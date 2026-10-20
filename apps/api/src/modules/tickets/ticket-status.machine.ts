import { Injectable, BadRequestException } from '@nestjs/common';
import { TicketStatus } from './ticket.entity';

@Injectable()
export class TicketStatusMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.OPEN]: [TicketStatus.PENDING],
    [TicketStatus.PENDING]: [TicketStatus.OPEN, TicketStatus.RESOLVED],
    [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
    [TicketStatus.CLOSED]: [],
  };

  /**
   * Validates whether a state transition from `currentStatus` to `newStatus` is allowed.
   * Throws `BadRequestException` if the transition is forbidden.
   */
  public validateTransition(currentStatus: TicketStatus, newStatus: TicketStatus): void {
    if (currentStatus === newStatus) {
      return; // No-op transition is allowed
    }

    const allowed = TicketStatusMachine.ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid ticket status transition from '${currentStatus}' to '${newStatus}'. Allowed targets from '${currentStatus}': [${allowed.join(', ')}].`,
      );
    }
  }

  /**
   * Returns true if transition is valid, false otherwise without throwing.
   */
  public canTransition(currentStatus: TicketStatus, newStatus: TicketStatus): boolean {
    if (currentStatus === newStatus) return true;
    const allowed = TicketStatusMachine.ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
  }
}
