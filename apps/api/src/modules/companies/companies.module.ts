import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { Company } from './company.entity';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  // forwardRef: CompaniesService.suspend closes the company's open jobs via JobsService.
  imports: [TypeOrmModule.forFeature([Company]), forwardRef(() => JobsModule)],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
