import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanDay } from './plan-day.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { WorkoutPlan } from './workout-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutPlan, PlanDay])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
