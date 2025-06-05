import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false })
  name?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ required: true, enum: ['customer', 'supplier', 'admin'], default: 'customer' })
  role: string;

  @Prop({ default: false })
  isGoogleAccount?: boolean;

  @Prop({ default: false })
  isBlocked?: boolean;

  // ✅ Trường mới để xác thực và reset mật khẩu
  @Prop({ default: false })
  isVerified?: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export type UserDocument = User & Document & { _id: Types.ObjectId };
export const UserSchema = SchemaFactory.createForClass(User);
