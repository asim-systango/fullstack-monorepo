import { SlaPriority } from '../categories/sla-priority.enum';

export interface SlaPolicyHours {
  firstResponseHours: number;
  resolutionHours: number;
}

export interface SlaDeadlines {
  firstResponseDueAt: Date;
  resolutionDueAt: Date;
}

export class SlaDeadlineCalculator {
  private static readonly DEFAULT_MATRIX: Record<SlaPriority, SlaPolicyHours> = {
    [SlaPriority.LOW]: { firstResponseHours: 72, resolutionHours: 240 },
    [SlaPriority.MEDIUM]: { firstResponseHours: 24, resolutionHours: 72 },
    [SlaPriority.HIGH]: { firstResponseHours: 8, resolutionHours: 24 },
    [SlaPriority.URGENT]: { firstResponseHours: 2, resolutionHours: 8 },
  };

  /**
   * Computes SLA due dates based on explicit policy or matrix defaults.
   */
  public static compute(
    policy: SlaPolicyHours | null | undefined,
    priority: SlaPriority,
    createdAt: Date = new Date(),
  ): SlaDeadlines {
    const effectiveHours =
      policy || this.DEFAULT_MATRIX[priority] || this.DEFAULT_MATRIX[SlaPriority.MEDIUM];

    const startTime = createdAt.getTime();

    const firstResponseDueAt = new Date(
      startTime + effectiveHours.firstResponseHours * 3600 * 1000,
    );
    const resolutionDueAt = new Date(
      startTime + effectiveHours.resolutionHours * 3600 * 1000,
    );

    return {
      firstResponseDueAt,
      resolutionDueAt,
    };
  }
}
