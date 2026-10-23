import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { GatewayUsersClient } from './gateway-users.client';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
  controllers: [ProjectsController],
  providers: [ProjectsService, GatewayUsersClient],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}
