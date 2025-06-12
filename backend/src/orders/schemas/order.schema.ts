import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // supplier của sản phẩm
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
  
   @Prop({ default: false }) // ✅ Thêm đúng tại đây
  isReviewed?: boolean;
  
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop() 
  status?: string;

  @Prop({ enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng','Giao thất bại', 'Hoàn thành'], 
  default: 'Chờ xác nhận' })
  shippingStatus: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: false }) // <-- Thêm dòng này
  isReviewed?: boolean;

}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
