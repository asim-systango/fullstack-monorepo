import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import type { Server } from 'socket.io';
import { IssuesEvents, type IssueUpdatedEvent } from './issues-events';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/issues',
})
export class IssuesGateway implements OnGatewayInit, OnModuleDestroy {
  private readonly logger = new Logger(IssuesGateway.name);
  private unsubscribe?: () => void;

  @WebSocketServer()
  server!: Server;

  constructor(private readonly issuesEvents: IssuesEvents) {}

  afterInit() {
    this.unsubscribe = this.issuesEvents.onIssueUpdated((event: IssueUpdatedEvent) => {
      this.server.emit('issue.updated', event);
      this.logger.debug(`emit issue.updated ${event.issueId} (${event.type})`);
    });
  }

  onModuleDestroy() {
    this.unsubscribe?.();
  }
}
