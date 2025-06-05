import { Controller, Get, Post, Body, Req, UseGuards, Patch, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StoreProfileService } from './store-profile.service';
import { CreateStoreProfileDto } from './dto/create-store-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

interface JwtRequest extends Request {
  user: { userId: string; role: string };
}

@Controller('store-profiles')
export class StoreProfileController {
  constructor(private readonly storeProfileService: StoreProfileService) {}

  // Lấy hồ sơ nhà cung cấp của user hiện tại
  @UseGuards(JwtAuthGuard)
  @Get('my-profile')
  async getMyProfile(@Req() req: JwtRequest) {
    const profile = await this.storeProfileService.findByUserId(req.user.userId);
    if (!profile) {
      return { message: 'Chưa đăng ký nhà cung cấp', isComplete: false, isApproved: false };
    }

    const isComplete = !!profile.storeName && !!profile.phone && !!profile.address;

    return {
      storeName: profile.storeName,
      phone: profile.phone,
      address: profile.address,
      imageUrl: profile.imageUrl,
      isApproved: profile.isApproved,
      isComplete,
    };
  }

  // Đăng ký nhà cung cấp + upload ảnh đại diện
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/store-profile';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(
    @Req() req: JwtRequest,
    @Body() dto: CreateStoreProfileDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const imageUrl = image ? `/store-profile/${image.filename}` : '';
    return this.storeProfileService.createOrUpdate(req.user.userId, {
      ...dto,
      imageUrl,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.storeProfileService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.storeProfileService.approveProfile(id);
  }

  // Lấy hồ sơ nhà cung cấp theo userId (supplierId)
  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const profile = await this.storeProfileService.findByUserId(userId);
    if (!profile) {
      return { message: 'Không tìm thấy hồ sơ nhà cung cấp' };
    }
    return profile;
  }

  // Nếu bạn muốn lấy hồ sơ nhà cung cấp theo id (profile id)
  @Get(':id')
  async findById(@Param('id') id: string) {
    const profile = await this.storeProfileService.findById(id);
    if (!profile) {
      return { message: 'Không tìm thấy hồ sơ nhà cung cấp' };
    }
    return profile;
  }
}
