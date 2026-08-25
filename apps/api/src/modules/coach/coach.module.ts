import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalRecordsModule } from '../personal-records';
import { WorkoutsModule } from '../workouts';
import { CoachAthlete } from './coach-athlete.entity';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoachAthlete]),
    WorkoutsModule,
    PersonalRecordsModule,
  ],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
