import { IsOptional, IsString, Length } from 'class-validator';

export class CreateLabelDto {
  @IsString() @Length(1, 40) name!: string;
  @IsOptional() @IsString() color?: string;
}
