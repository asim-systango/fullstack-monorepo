import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

/** Request body for POST /articles/:id/publish */
export class PublishArticleDto {
  @ApiProperty({
    description: 'Revision UUID that should become the live published revision',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsDefined({ message: 'revisionId is required' })
  @IsUUID('4')
  revisionId!: string;
}

/** Response from POST /articles/:id/publish */
export type PublishedArticle = {
  id: string;
  publishedRevisionId: string;
  publishedAt: Date;
};
