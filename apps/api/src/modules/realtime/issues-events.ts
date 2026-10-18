import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

export type IssueUpdatedEvent = {
  issueId: string;
  projectId: string;
  type: string;
  status?: string;
};

/** In-process bridge so services can emit without circular Nest deps on the gateway. */
@Injectable()
export class IssuesEvents {
  private readonly bus = new EventEmitter();

  emitIssueUpdated(event: IssueUpdatedEvent) {
    this.bus.emit('issue.updated', event);
  }

  onIssueUpdated(listener: (event: IssueUpdatedEvent) => void) {
    this.bus.on('issue.updated', listener);
    return () => this.bus.off('issue.updated', listener);
  }
}
