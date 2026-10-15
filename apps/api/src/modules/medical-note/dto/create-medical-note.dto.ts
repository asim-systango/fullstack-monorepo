import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/** DTO for creating a clinical note. */
export class CreateMedicalNoteDto {
  @ApiProperty({ description: 'Appointment UUID' })
  @IsUUID()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty({ description: 'Doctor profile UUID (authoring doctor)' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({
    description: 'Clinical observation notes',
    example: 'Patient presents with elevated heart rate. Recommending ECG follow-up.',
  })
  @IsString()
  @IsNotEmpty()
  notes!: string;
}
