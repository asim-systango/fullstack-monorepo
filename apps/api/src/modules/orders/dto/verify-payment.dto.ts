import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Razorpay order id (mock: order_xxx)',
    example: 'order_mock_123',
  })
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay payment id (mock: pay_xxx)',
    example: 'pay_mock_123',
  })
  @IsString()
  razorpayPaymentId: string;

  @ApiPropertyOptional({
    description: 'Razorpay signature. In mock mode any non-empty value works.',
    example: 'mock_signature',
  })
  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}
