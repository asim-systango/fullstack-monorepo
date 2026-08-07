import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryStatus } from './delivery-status.entity';
import { OrderLine } from './order-line.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderLine, DeliveryStatus, Payment]),
  ],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
