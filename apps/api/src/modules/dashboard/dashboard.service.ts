import { Injectable } from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CompaniesService } from '../companies/companies.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly jobsService: JobsService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async staffDashboard(userId: string) {
    const company = await this.companiesService.findByUserIdOrThrow(userId);
    const [applicationsByStatus, openJobCount] = await Promise.all([
      this.applicationsService.summaryForCompany(company.id),
      this.jobsService.countOpenForCompany(company.id),
    ]);
    return { openJobCount, applicationsByStatus };
  }
}
