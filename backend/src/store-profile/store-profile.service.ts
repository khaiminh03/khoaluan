import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreProfile, StoreProfileDocument } from './schemas/store-profile.schema';
import { CreateStoreProfileDto } from './dto/create-store-profile.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StoreProfileService {
  constructor(
    @InjectModel(StoreProfile.name) private storeProfileModel: Model<StoreProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string): Promise<StoreProfileDocument | null> {
    return this.storeProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async create(userId: string, dto: CreateStoreProfileDto): Promise<StoreProfileDocument> {
    const exists = await this.findByUserId(userId);
    if (exists) {
      throw new BadRequestException('Bạn đã đăng ký nhà cung cấp rồi');
    }

    const created = new this.storeProfileModel({
      userId: new Types.ObjectId(userId),
      ...dto,
      isApproved: false,
    });

    return created.save();
  }

  async createOrUpdate(userId: string, dto: CreateStoreProfileDto): Promise<StoreProfileDocument> {
    const existing = await this.storeProfileModel.findOne({ userId: new Types.ObjectId(userId) });

    if (existing) {
      // Kiểm tra hồ sơ đã đầy đủ
      const isComplete = !!existing.storeName && !!existing.phone && !!existing.address;

      if (isComplete && !existing.isApproved) {
        // Đã gửi rồi, chờ duyệt => không cho cập nhật
        throw new BadRequestException('Bạn đã gửi đăng ký rồi, vui lòng chờ admin duyệt.');
      }

      if (existing.isApproved) {
        // Đã được duyệt => không cho sửa
        throw new BadRequestException('Bạn đã là nhà cung cấp được duyệt.');
      }

      // Chưa hoàn chỉnh => cho cập nhật
      existing.storeName = dto.storeName;
      existing.phone = dto.phone;
      existing.address = dto.address;
      existing.isApproved = false; // Reset duyệt khi cập nhật
      return existing.save();
    } else {
      // Tạo mới hồ sơ
      const created = new this.storeProfileModel({
        userId: new Types.ObjectId(userId),
        ...dto,
        isApproved: false,
      });
      return created.save();
    }
  }

  async findAll(): Promise<StoreProfileDocument[]> {
    return this.storeProfileModel.find().populate('userId', 'name email').exec();
  }

  async approveProfile(id: string): Promise<StoreProfileDocument> {
    const profile = await this.storeProfileModel.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Cập nhật trạng thái duyệt
    profile.isApproved = true;
    await profile.save();

    // Cập nhật role user thành 'supplier'
    await this.userModel.findByIdAndUpdate(profile.userId, { role: 'supplier' });

    return profile;
  }

  async findById(id: string): Promise<StoreProfile | null> {
    return this.storeProfileModel.findById(id).exec();
  }

}
