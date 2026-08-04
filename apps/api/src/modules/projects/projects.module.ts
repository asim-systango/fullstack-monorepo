import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { MembershipService } from './membership.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class ProjectsModule {}
