import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { AdminProductQueryDto, PublicProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

class CartLookupDto {
  @IsArray() @ArrayMaxSize(100) @IsUUID('4', { each: true })
  ids: string[];
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@Query() query: PublicProductQueryDto) {
    return this.products.findPublic(query);
  }

  @Get('hero-slides')
  heroSlides() {
    return this.products.findHeroSlides();
  }

  @Post('lookup')
  @HttpCode(200)
  lookup(@Body() dto: CartLookupDto) {
    return this.products.findManyForCart(dto.ids);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.products.findPublicBySlug(slug);
  }

  @Post(':slug/view')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  view(@Param('slug') slug: string) {
    return this.products.registerView(slug);
  }
}

@AdminOnly('products')
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@Query() query: AdminProductQueryDto) {
    return this.products.findAdmin(query);
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.products.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id);
  }
}
