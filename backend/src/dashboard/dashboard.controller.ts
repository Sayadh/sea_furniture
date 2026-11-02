import { Controller, Get } from '@nestjs/common';
import { AdminOnly } from '../common/decorators/admin.decorator';
import { DashboardService } from './dashboard.service';

@AdminOnly('dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  summary() {
    return this.dashboard.summary();
  }
}
