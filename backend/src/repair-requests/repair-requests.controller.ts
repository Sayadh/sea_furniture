import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { imageFileFilter, MAX_IMAGE_BYTES } from '../storage/image-processing';
import {
  AdminRequestQueryDto, CreateContactRequestDto, CreateRepairRequestDto, UpdateRequestNoteDto, UpdateRequestStatusDto,
} from './dto/repair-request.dto';
import { RepairRequestsService } from './repair-requests.service';

export const MAX_REQUEST_IMAGES = 5;

@ApiTags('requests')
@Controller('requests')
export class RepairRequestsController {
  constructor(private readonly requests: RepairRequestsService) {}

  @Post('repair')
  @ApiConsumes('multipart/form-data')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseInterceptors(
    FilesInterceptor('images', MAX_REQUEST_IMAGES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_REQUEST_IMAGES, fields: 20 },
      fileFilter: imageFileFilter,
    }),
  )
  createRepair(@Body() dto: CreateRepairRequestDto, @UploadedFiles() files: Express.Multer.File[] = []) {
    return this.requests.createRepair(dto, files);
  }

  @Post('contact')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  createContact(@Body() dto: CreateContactRequestDto) {
    return this.requests.createContact(dto);
  }
}

@AdminOnly('requests')
@Controller('admin/requests')
export class AdminRepairRequestsController {
  constructor(private readonly requests: RepairRequestsService) {}

  @Get()
  findAll(@Query() query: AdminRequestQueryDto) {
    return this.requests.findAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.requests.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRequestStatusDto) {
    return this.requests.updateStatus(id, dto.status);
  }

  @Patch(':id/note')
  updateNote(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRequestNoteDto) {
    return this.requests.updateNote(id, dto.adminNote ?? null);
  }

  @Delete(':id')
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.requests.archive(id);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.requests.restore(id);
  }
}
