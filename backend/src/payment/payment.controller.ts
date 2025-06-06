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
    console.error('❌ Thiếu biến môi trường SEPAY_WEBHOOK_KEY trong .env');
    throw new Error('Thiếu biến SEPAY_WEBHOOK_KEY trong .env');
  }

 const cleaned = (authorization || '').trim().replace(/^Apikey\s+/i, '');
console.log('🔑 Authorization:', authorization);
console.log('🔍 Cleaned API Key:', cleaned);
console.log('🧾 Expected API Key (.env):', expectedKey);
if (cleaned !== expectedKey) {
  console.warn('❌ API Key sai hoặc thiếu:', authorization);
  throw new BadRequestException('API Key không hợp lệ');
}

  console.log('📩 Webhook SePay nhận được:', JSON.stringify(body, null, 2));

  if (body.transferType !== 'in') {
    console.log('ℹ️ Bỏ qua giao dịch không phải tiền vào:', body.transferType);
    return { message: 'Không phải giao dịch tiền vào, bỏ qua.' };
  }

  const content = body.content || '';
  console.log('🔍 Nội dung chuyển khoản:', content);

  const matched = content.match(/don\s*([a-f0-9]{24})/i);

  if (!matched) {
    console.warn('⚠️ Không tìm thấy orderId trong nội dung:', content);
    return { message: 'Không tìm thấy orderId trong nội dung' };
  }

  const orderId = matched[1];
  console.log('🧾 Mã đơn hàng trích xuất:', orderId);

  const order = await this.ordersService.findById(orderId);
  if (!order) {
    console.error('❌ Không tìm thấy đơn hàng:', orderId);
    throw new NotFoundException('Đơn hàng không tồn tại');
  }

  const amount = Number(body.transferAmount || 0);
  console.log(`💸 So khớp số tiền: ${amount} so với ${order.totalAmount}`);

  if (amount !== order.totalAmount) {
    console.warn(`⚠️ Số tiền không khớp: ${amount} ≠ ${order.totalAmount}`);
    return { message: 'Sai số tiền chuyển khoản' };
  }

  const updated = await this.ordersService.markAsPaid(orderId);
  console.log('✅ Đã xác nhận thanh toán đơn hàng:', updated._id);

  return { success: true, updatedOrder: updated };
}

}
