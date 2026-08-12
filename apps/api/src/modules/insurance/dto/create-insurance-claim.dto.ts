import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateInsuranceClaimDto {
  @ApiProperty({ description: 'Target completed appointment ID' })
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ description: 'Insurance Provider Name (e.g. Star Health, BlueCross)' })
  @IsString()
  @IsNotEmpty()
  providerName: string;

  @ApiProperty({ description: 'Insurance Policy Number' })
  @IsString()
  @IsNotEmpty()
  policyNumber: string;

  @ApiProperty({ description: 'Total Claim Amount (INR)' })
  @IsNumber()
  @Min(0)
  claimAmount: number;
}
