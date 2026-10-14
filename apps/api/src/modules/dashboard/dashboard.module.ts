import { Module } from '@nestjs/common';
import { ApplicationsModule } from '../applications/applications.module';
import { CompaniesModule } from '../companies/companies.module';
import { JobsModule } from '../jobs/jobs.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [CompaniesModule, JobsModule, ApplicationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
