import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { LeaveType } from './leave-type.entity';
import { LeaveTypesController } from './leave-types.controller';
import { LeaveTypesService } from './leave-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveType, LeaveRequest])],
  controllers: [LeaveTypesController],
  providers: [LeaveTypesService],
  exports: [LeaveTypesService],
})
export class LeaveTypesModule {}
