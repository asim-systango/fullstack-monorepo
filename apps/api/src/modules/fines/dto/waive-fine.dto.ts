import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class WaiveFineDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
