import { Module } from '@nestjs/common';
import { ResumesModule } from '../resumes/resumes.module';
import { PublicController } from './public.controller';

@Module({
  imports: [ResumesModule],
  controllers: [PublicController],
})
export class PublicModule {}
