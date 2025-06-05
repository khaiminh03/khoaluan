import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string; // ví dụ: "xoai-cat-hoa-loc"

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number; // giá theo đơn vị

  @Prop({ required: true })
  quantity: number; // số lượng theo đơn vị (vd: 2, 500, 10...)

  @Prop({ required: true })
  unitType: string; // "kg", "g", "bó", "gói", "thùng"...

  @Prop({ required: true })
  unitDisplay: string; // dùng để hiển thị đẹp: "2kg", "500g", "10 gói"

  @Prop({ required: true })
  stock: number; // số lượng tồn kho

  @Prop()
  origin: string; // ví dụ: "Trà Vinh, Việt Nam"

  @Prop([String])
  images: string[]; // ảnh thư viện

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  supplierId: Types.ObjectId; // người đăng sản phẩm (role = 'supplier')

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    enum: ['pending', 'approved', 'rejected', 'out_of_stock'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected' | 'out_of_stock';
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Tạo chỉ mục tìm kiếm toàn văn cho tên sản phẩm
ProductSchema.index({ name: 'text', description: 'text' });
