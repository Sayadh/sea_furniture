import { Module } from '@nestjs/common';
import { AdminRepairRequestsController, RepairRequestsController } from './repair-requests.controller';
import { RepairRequestsService } from './repair-requests.service';

@Module({
  controllers: [RepairRequestsController, AdminRepairRequestsController],
  providers: [RepairRequestsService],
})
export class RepairRequestsModule {}
