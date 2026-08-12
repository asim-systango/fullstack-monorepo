import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { Restaurant } from '../restaurants/restaurant.entity';
import { DeliveryStatus } from './delivery-status.entity';
import { OrderLine } from './order-line.entity';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Payment } from './payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    RestaurantsModule,
    TypeOrmModule.forFeature([
      Order,
      OrderLine,
      DeliveryStatus,
      Payment,
      CartItem,
      Restaurant,
    ]),
  ],
  controllers: [OrdersController, PaymentsController],
  providers: [OrdersService, PaymentsService],
  exports: [TypeOrmModule, OrdersService, PaymentsService],
})
export class OrdersModule {}
