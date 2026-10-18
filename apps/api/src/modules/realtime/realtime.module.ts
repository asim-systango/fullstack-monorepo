import { Global, Module } from '@nestjs/common';
import { IssuesEvents } from './issues-events';
import { IssuesGateway } from './issues.gateway';

@Global()
@Module({
  providers: [IssuesEvents, IssuesGateway],
  exports: [IssuesEvents],
})
export class RealtimeModule {}
