import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
  // 🔎 Kiểm tra email đã tồn tại chưa
  const existingUser = await this.userModel.findOne({ email: createUserDto.email });
  if (existingUser) {
    throw new BadRequestException('Email đã có');
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
  createUserDto.password = hashedPassword;

  const createdUser = new this.userModel(createUserDto);
  return createdUser.save();
}

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

   // Phương thức để cập nhật người dùng
   // Phương thức cập nhật người dùng
 async update(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<UserDocument> {
  if (!userId) {
    throw new BadRequestException('User ID không được để trống');
  }
  const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
  if (!updatedUser) {
    throw new NotFoundException('User không tồn tại');
  }
  return updatedUser;
}

  

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
   // Phương thức tìm người dùng theo ID
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  //
  async upgradeToSupplier(userId: string, phone: string, address: string): Promise<UserDocument> {
  if (!phone || !address) {
    throw new BadRequestException('Phone và address là bắt buộc để nâng cấp nhà cung cấp');
  }

  const updatedUser = await this.userModel.findByIdAndUpdate(
    userId,
    { role: 'supplier', phone, address },
    { new: true }
  );

  if (!updatedUser) {
    throw new NotFoundException('User không tồn tại');
  }

  return updatedUser;
}
async becomeSupplier(userId: string, phone: string, address: string): Promise<UserDocument> {
  if (!phone || !address) {
    throw new BadRequestException('Phone và address là bắt buộc để trở thành nhà cung cấp');
  }

  const updatedUser = await this.userModel.findByIdAndUpdate(
    userId,
    { role: 'supplier', phone, address },
    { new: true }
  );

  if (!updatedUser) {
    throw new NotFoundException('User không tồn tại');
  }

  return updatedUser;
}
  async toggleBlockUser(userId: string, block: boolean): Promise<UserDocument> {
  const updatedUser = await this.userModel.findByIdAndUpdate(
    userId,
    { isBlocked: block },
    { new: true },
  );

  if (!updatedUser) {
    throw new NotFoundException('User không tồn tại');
  }

  return updatedUser;
}

// Dành cho Admin: Lấy tất cả user, có thể lọc theo vai trò
async getAllUsers(role?: string): Promise<User[]> {
  const query = role ? { role } : {};
  return this.userModel.find(query).select('-password').exec();
}
async markEmailAsVerified(userId: string): Promise<void> {
  await this.userModel.findByIdAndUpdate(userId, { isVerified: true });
}



}

