import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { FaqsModule } from './faqs/faqs.module';
import { OrdersModule } from './orders/orders.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { RepairRequestsModule } from './repair-requests/repair-requests.module';
import { SeoModule } from './seo/seo.module';
import { ServicesModule } from './services/services.module';
import { SettingsModule } from './settings/settings.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 200 }]),
    PrismaModule,
    CommonModule,
    StorageModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ServicesModule,
    PortfolioModule,
    FaqsModule,
    OrdersModule,
    RepairRequestsModule,
    SettingsModule,
    DashboardModule,
    SeoModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
