import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  author!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  isbn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
