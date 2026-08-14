import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'customer@tastygo.com' })
  email!: string;

  @ApiProperty({ example: 'Demo User' })
  name!: string;

  @ApiProperty({ enum: ['admin', 'user', 'staff'], example: 'user' })
  role!: 'admin' | 'user' | 'staff';

  @ApiProperty({
    example: '21 MG Road, Apt 4B, Indore',
    nullable: true,
    description: 'Saved delivery address for checkout',
  })
  deliveryAddress!: string | null;
}
