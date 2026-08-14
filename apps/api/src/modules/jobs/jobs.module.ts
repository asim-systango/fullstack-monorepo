import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsModule } from '../applications/applications.module';
import { CompaniesModule } from '../companies/companies.module';
import { Job } from './job.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  // forwardRef: JobsService.close injects ApplicationsService; Applications.create injects JobsService.
  imports: [
    TypeOrmModule.forFeature([Job]),
    CompaniesModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
