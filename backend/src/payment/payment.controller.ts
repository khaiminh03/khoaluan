import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';

@Controller('api/paymentapi')
export class PaymentController {
  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {}

@Post('payment')
async handleWebhook(
  @Body() body: any,
  @Headers('authorization') authorization: string,
) {
  const expectedKey = this.configService.get<string>('SEPAY_WEBHOOK_KEY');

  if (!expectedKey) {
    throw new Error('Thiếu biến SEPAY_WEBHOOK_KEY trong .env');
  }
 const cleaned = (authorization || '').trim().replace(/^Apikey\s+/i, '');
if (cleaned !== expectedKey) {
  throw new BadRequestException('API Key không hợp lệ');
}
  if (body.transferType !== 'in') {
    return { message: 'Không phải giao dịch tiền vào, bỏ qua.' };
  }

  const content = body.content || '';

  const matched = content.match(/don\s*([a-f0-9]{24})/i);

  if (!matched) {
    return { message: 'Không tìm thấy orderId trong nội dung' };
  }
  const orderId = matched[1];
  const order = await this.ordersService.findById(orderId);
  if (!order) {
    throw new NotFoundException('Đơn hàng không tồn tại');
  }
  const amount = Number(body.transferAmount || 0);
  if (amount !== order.totalAmount) {
    return { message: 'Sai số tiền chuyển khoản' };
  }
  const updated = await this.ordersService.markAsPaid(orderId);
  return { success: true, updatedOrder: updated };
}

}
