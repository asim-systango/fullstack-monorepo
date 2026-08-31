import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { JobsModule } from '../jobs/jobs.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [CompaniesModule, JobsModule],
  controllers: [AdminController],
})
export class AdminModule {}
