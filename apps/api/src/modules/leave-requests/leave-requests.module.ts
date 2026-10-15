import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveBalance } from '../balances/leave-balance.entity';
import { EmployeesModule } from '../employees';
import { HolidaysModule } from '../holidays';
import { LeaveTypesModule } from '../leave-types';
import { LeaveRequest } from './leave-request.entity';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, LeaveBalance]),
    LeaveTypesModule,
    HolidaysModule,
    EmployeesModule,
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
