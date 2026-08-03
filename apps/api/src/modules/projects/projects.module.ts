import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
})
export class ProjectsModule {}
