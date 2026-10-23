import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { loadApiEnv } from '../../common/env';
import { ProjectsModule } from '../projects/projects.module';
import { IssuesEvents } from './issues-events';
import { IssuesGateway } from './issues.gateway';

const env = loadApiEnv();

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
    }),
    ProjectsModule,
  ],
  providers: [IssuesEvents, IssuesGateway],
  exports: [IssuesEvents],
})
export class RealtimeModule {}
