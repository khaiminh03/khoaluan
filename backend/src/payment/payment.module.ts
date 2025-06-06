import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule], // import để dùng OrdersService
  controllers: [PaymentController],
})
export class PaymentModule {}
