import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { AdminOrderQueryDto, CreateOrderDto, UpdateOrderNoteDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }
}

@AdminOnly('orders')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll(@Query() query: AdminOrderQueryDto) {
    return this.orders.findAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orders.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Patch(':id/note')
  updateNote(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderNoteDto) {
    return this.orders.updateNote(id, dto.adminNote ?? null);
  }

  /** Archive (soft delete) — orders are never hard-deleted. */
  @Delete(':id')
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.orders.archive(id);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.orders.restore(id);
  }
}
