import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StoreProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  storeName: string;

  @Prop({ required: true })
  phone: string;

   @Prop({ default: '' }) 
  imageUrl: string;

  @Prop({ required: true })
  address: string;

  @Prop({ default: false })
  isApproved: boolean; // Admin duyệt hay chưa
}

export type StoreProfileDocument = StoreProfile & Document;
export const StoreProfileSchema = SchemaFactory.createForClass(StoreProfile);
