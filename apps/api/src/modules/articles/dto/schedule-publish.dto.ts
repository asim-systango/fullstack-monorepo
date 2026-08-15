import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined, IsUUID } from 'class-validator';

/**
 * Request body for POST /articles/:id/schedule-publish.
 * Overwrites any existing scheduledRevisionId / scheduledAt on the article.
 */
export class SchedulePublishDto {
  @ApiProperty({
    description: 'Revision UUID to publish when the schedule is due',
    format: 'uuid',
  })
  @IsDefined({ message: 'revisionId is required' })
  @IsUUID('4')
  revisionId!: string;

  @ApiProperty({
    description: 'Future ISO-8601 timestamp. Must be strictly after the server clock.',
    example: '2026-08-20T22:46:00+05:30',
  })
  @IsDefined({ message: 'scheduledAt is required' })
  @IsDateString()
  scheduledAt!: string;
}

/** Response from POST /articles/:id/schedule-publish */
export type ScheduledPublish = {
  id: string;
  scheduledRevisionId: string;
  scheduledAt: Date;
};

/** Response from POST /articles/publish-due */
export type DuePublishResult = {
  published: Array<{
    id: string;
    publishedRevisionId: string;
    publishedAt: Date;
  }>;
  skipped: number;
};
