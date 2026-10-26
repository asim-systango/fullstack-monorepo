import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from '../employees';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { LeaveTypesModule } from '../leave-types';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { LeaveBalance } from './leave-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveBalance, LeaveRequest]),
    LeaveTypesModule,
    EmployeesModule,
  ],
  controllers: [BalancesController],
  providers: [BalancesService],
})
export class BalancesModule {}
