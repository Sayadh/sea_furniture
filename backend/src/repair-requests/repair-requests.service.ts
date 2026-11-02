import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, RequestSource, RequestStatus } from '@prisma/client';
import { generateRequestNumber } from '../common/utils/codes';
import { paginate } from '../common/dto/pagination.dto';
import { phoneSearchFragment } from '../common/utils/search';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService, StoredFile } from '../storage/storage.service';
import { AdminRequestQueryDto, CreateContactRequestDto, CreateRepairRequestDto } from './dto/repair-request.dto';

const SUCCESS_SELECT = { requestNumber: true, createdAt: true } as const;

@Injectable()
export class RepairRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private async resolveService(serviceId?: string) {
    if (!serviceId) return null;
    return this.prisma.service.findFirst({ where: { id: serviceId, isActive: true }, select: { id: true, title: true } });
  }

  private async createWithRetry(data: Omit<Prisma.RepairRequestCreateInput, 'requestNumber'>) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.repairRequest.create({
          data: { ...data, requestNumber: generateRequestNumber() },
          select: SUCCESS_SELECT,
        });
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
      }
    }
    throw new InternalServerErrorException('Հարցումը ուղարկել չհաջողվեց։ Խնդրում ենք փորձել կրկին');
  }

  async createRepair(dto: CreateRepairRequestDto, files: Express.Multer.File[] = []) {
    const service = await this.resolveService(dto.serviceId);
    const uploaded: StoredFile[] = [];
    try {
      // Sequential to keep memory bounded; each file is validated by content before upload.
      for (const file of files) uploaded.push(await this.storage.uploadImage(file, 'requests'));
      return await this.createWithRetry({
        source: RequestSource.REPAIR,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        description: dto.description,
        serviceTitle: service?.title,
        ...(service ? { service: { connect: { id: service.id } } } : {}),
        images: { create: uploaded.map((f) => ({ url: f.url, path: f.path })) },
      });
    } catch (e) {
      await this.storage.remove(uploaded.map((f) => f.path));
      throw e;
    }
  }

  async createContact(dto: CreateContactRequestDto) {
    const service = await this.resolveService(dto.serviceId);
    return this.createWithRetry({
      source: dto.source ?? RequestSource.CONTACT,
      name: dto.name,
      phone: dto.phone,
      description: dto.message,
      serviceTitle: service?.title,
      ...(service ? { service: { connect: { id: service.id } } } : {}),
    });
  }

  async findAdmin(q: AdminRequestQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.RepairRequestWhereInput = { deletedAt: q.archived ? { not: null } : null };
    if (q.status) where.status = q.status;
    if (q.source) where.source = q.source;
    if (q.search) {
      const or: Prisma.RepairRequestWhereInput[] = [
        { requestNumber: { contains: q.search.toUpperCase() } },
        { name: { contains: q.search } },
      ];
      const fragment = phoneSearchFragment(q.search);
      if (fragment) or.push({ phone: { contains: fragment } });
      where.OR = or;
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.repairRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { images: true } } },
      }),
      this.prisma.repairRequest.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  async findOne(id: string) {
    const request = await this.prisma.repairRequest.findUnique({
      where: { id },
      include: { images: { orderBy: { createdAt: 'asc' } }, service: { select: { id: true, title: true, slug: true } } },
    });
    if (!request) throw new NotFoundException('Հարցումը չի գտնվել');
    return request;
  }

  async updateStatus(id: string, status: RequestStatus) {
    await this.findOne(id);
    return this.prisma.repairRequest.update({ where: { id }, data: { status } });
  }

  async updateNote(id: string, adminNote: string | null) {
    await this.findOne(id);
    return this.prisma.repairRequest.update({ where: { id }, data: { adminNote } });
  }

  async archive(id: string) {
    await this.findOne(id);
    await this.prisma.repairRequest.update({ where: { id }, data: { deletedAt: new Date() } });
    return { ok: true };
  }

  async restore(id: string) {
    await this.findOne(id);
    await this.prisma.repairRequest.update({ where: { id }, data: { deletedAt: null } });
    return { ok: true };
  }
}
