import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Request body for POST /articles */
export class CreateArticleDto {
  @ApiProperty({ example: 'Understanding React Hooks' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'understanding-react-hooks' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({
    description:
      'Plain markdown convenience. Mutually exclusive with content — converted to one paragraph block.',
    example: '# React Hooks\n\nReact Hooks allow...',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  body?: string;

  @ApiPropertyOptional({
    description:
      'Medium-style ordered blocks (paragraph, heading, image, video, code). Mutually exclusive with body. Upload media first, then reference mediaId.',
    type: 'array',
    items: { type: 'object' },
    example: [
      {
        id: 'b1',
        type: 'heading',
        level: 1,
        text: 'React Hooks',
      },
      {
        id: 'b2',
        type: 'paragraph',
        markdown: 'Hooks let you use state in function components.',
      },
      {
        id: 'b3',
        type: 'image',
        mediaId: '11111111-1111-4111-8111-111111111111',
        alt: 'Hooks diagram',
        caption: 'useState flow',
      },
      {
        id: 'b4',
        type: 'video',
        mediaId: '22222222-2222-4222-8222-222222222222',
        caption: 'Demo',
      },
      {
        id: 'b5',
        type: 'code',
        language: 'tsx',
        code: 'const [count, setCount] = useState(0);',
      },
    ],
  })
  /**
   * Global ValidationPipe uses enableImplicitConversion, which would turn
   * each block object into an Array instance. Re-materialize plain objects.
   */
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return value;
    return value.map((item: unknown) => {
      if (item === null || typeof item !== 'object') return item;
      return { ...(item as Record<string, unknown>) };
    });
  })
  @IsOptional()
  @IsArray()
  content?: unknown[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}

/** Response from POST /articles */
export type CreatedArticle = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: null;
  publishedAt: null;
  createdAt: Date;
  updatedAt: Date;
  revision: {
    id: string;
    content: unknown[];
    createdAt: Date;
  };
  tags: Array<{ id: string; name: string }>;
};
