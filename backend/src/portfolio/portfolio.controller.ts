import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';
import { PortfolioService } from './portfolio.service';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('limit') limit?: string) {
    const n = Number(limit);
    return this.portfolio.findPublic(Number.isInteger(n) && n > 0 && n <= 50 ? n : undefined);
  }
}

@AdminOnly('portfolio')
@Controller('admin/portfolio')
export class AdminPortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get()
  findAll() {
    return this.portfolio.findAllAdmin();
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.portfolio.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolio.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePortfolioDto) {
    return this.portfolio.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePortfolioDto) {
    return this.portfolio.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolio.remove(id);
  }
}
