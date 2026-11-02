import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FaqsService } from './faqs.service';

@ApiTags('faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Get()
  findAll() {
    return this.faqs.findPublic();
  }
}

@AdminOnly('faqs')
@Controller('admin/faqs')
export class AdminFaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Get()
  findAll() {
    return this.faqs.findAllAdmin();
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.faqs.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqs.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqs.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFaqDto) {
    return this.faqs.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqs.remove(id);
  }
}
