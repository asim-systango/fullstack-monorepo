import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { ResumeMetaModule } from '../resume-meta/resume-meta.module';
import { Application } from './application.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  // forwardRef: JobsModule.close depends on ApplicationsService (and create depends on JobsService).
  imports: [
    TypeOrmModule.forFeature([Application]),
    forwardRef(() => JobsModule),
    ResumeMetaModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
