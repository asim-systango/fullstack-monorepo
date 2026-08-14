import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../message.entity';

export class CreateAttachmentDto {
  @ApiProperty({ example: 'https://example.com/files/auth.log' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;

  @ApiProperty({ example: 'auth.log' })
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiPropertyOptional({ example: 'text/plain' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 1024 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sizeBytes?: number;
}

export class CreateMessageDto {
  @ApiProperty({ example: 'I have attached the authentication logs.' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.PUBLIC })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType = MessageType.PUBLIC;

  @ApiPropertyOptional({ type: [CreateAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}
