import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export class BecomeSupplierDto {
  phone: string;
  address: string;
}

interface JwtRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

// Cấu hình multer lưu ảnh avatar vào uploads/avatar
const storage = diskStorage({
  destination: './uploads/avatar', // Thư mục lưu ảnh
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // API nâng cấp lên nhà cung cấp, bảo vệ route chỉ cho user đăng nhập
  @UseGuards(JwtAuthGuard)
  @Patch('become-supplier')
  async becomeSupplier(@Req() req: JwtRequest, @Body() dto: BecomeSupplierDto) {
    const userId = req.user.userId;
    return this.userService.becomeSupplier(userId, dto.phone, dto.address);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // PATCH cập nhật user có nhận file avatar upload
  @Patch(':id')
@UseInterceptors(FileInterceptor('avatar', { storage }))
async updateUser(
  @Param('id') id: string,
  @Body() dto: UpdateUserDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  console.log('Received id in controller:', id);
  console.log('DTO:', dto);

  if (!id) {
    throw new Error('User ID is missing in request parameters');
  }

  if (file) {
    dto.avatarUrl = `/uploads/avatar/${file.filename}`;
  }

  return this.userService.update(id, dto);
}
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
  // Lấy toàn bộ user (có thể lọc theo role) - chỉ admin
@UseGuards(JwtAuthGuard)
@Get('admin/list')
async getAllUsers(@Req() req: JwtRequest, @Body('role') role?: string) {
  if (req.user.role !== 'admin') {
    throw new BadRequestException('Bạn không có quyền');
  }
  return this.userService.getAllUsers(role);
}

// Khóa hoặc mở khóa user - chỉ admin
@UseGuards(JwtAuthGuard)
@Patch('admin/block/:id')
async blockUser(
  @Req() req: JwtRequest,
  @Param('id') id: string,
  @Body('block') block: boolean,
) {
  if (req.user.role !== 'admin') {
    throw new BadRequestException('Bạn không có quyền');
  }
  return this.userService.toggleBlockUser(id, block);
}
}
