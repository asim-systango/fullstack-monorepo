import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { Sprint } from './sprint.entity';
import { SprintsService } from './sprints.service';
import { SprintsController } from './sprints.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sprint]), ProjectsModule],
  providers: [SprintsService],
  controllers: [SprintsController],
})
export class SprintsModule {}
