import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ enum: ['admin', 'staff', 'user'] })
  @IsIn(['admin', 'staff', 'user'])
  role!: 'admin' | 'staff' | 'user';
}
