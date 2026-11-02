import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, question: true, answer: true },
    });
  }

  findAllAdmin() {
    return this.prisma.faq.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('Հարցը չի գտնվել');
    return faq;
  }

  async create(dto: CreateFaqDto) {
    const max = await this.prisma.faq.aggregate({ _max: { sortOrder: true } });
    return this.prisma.faq.create({ data: { ...dto, sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? 0) + 1 } });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.faq.delete({ where: { id } });
    return { ok: true };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.faq.update({ where: { id }, data: { sortOrder: index } })));
    return { ok: true };
  }
}
