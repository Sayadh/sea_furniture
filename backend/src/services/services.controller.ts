import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  findAll() {
    return this.services.findPublic();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.services.findPublicBySlug(slug);
  }
}

@AdminOnly('services')
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  findAll() {
    return this.services.findAllAdmin();
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.services.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.services.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.services.remove(id);
  }
}
