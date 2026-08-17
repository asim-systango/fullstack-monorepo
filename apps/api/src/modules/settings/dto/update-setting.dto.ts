import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value!: string;
}
