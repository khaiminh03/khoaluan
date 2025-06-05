import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import axios from 'axios';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

import { EmailService } from '../email/email.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}
 async register(createUserDto: CreateUserDto) {
  const { email } = createUserDto;

  const userExists = await this.userService.findByEmail(email);
  if (userExists) {
    throw new BadRequestException('Email đã tồn tại');
  }

  // Tạo user mới (mặc định isVerified = false)
  const newUser = await this.userService.create(createUserDto);

  // Tạo token xác minh email (JWT)
  const token = this.jwtService.sign({ sub: newUser._id }, { expiresIn: '24h' });

  // Gửi email xác minh
  await this.emailService.sendVerificationEmail(email, token);

  return {
    message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.',
  };
}
  async validateUser(email: string, password: string): Promise<UserDocument> {
  const user = await this.userService.findByEmail(email);
  if (!user) {
    throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
  }

  if (user.isBlocked) {
    throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
  }

  return user;
}
  // Đăng nhập với email và password
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      address: user.address,
      phone: user.phone,
      isGoogleAccount: false,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        address: user.address,
        role: user.role,
      },
    };
  }

  // Xác thực user Google, tạo hoặc cập nhật user, đảm bảo isGoogleAccount true
  async validateGoogleUser(
    googleUser: any,
    accessToken: string,
    extraInfo?: Partial<UpdateUserDto>,
  ): Promise<UserDocument> {
    const googleUserInfo = await this.getGoogleUserInfo(accessToken);

    let user = await this.userService.findByEmail(googleUserInfo.email);

    if (!user) {
      const fullName = [googleUserInfo.given_name, googleUserInfo.family_name].filter(Boolean).join(' ').trim();

      user = await this.userService.create({
        email: googleUserInfo.email,
        name: fullName,
        avatarUrl: googleUserInfo.picture,
        password: '',
        role: 'customer',
        phone: extraInfo?.phone ?? '',
        address: extraInfo?.address ?? '',
        isGoogleAccount: true,
      });
    } else {
      let hasUpdate = false;

      if (!user.isGoogleAccount) {
        user.isGoogleAccount = true;
        hasUpdate = true;
      }
      if (extraInfo?.phone && !user.phone) {
        user.phone = extraInfo.phone;
        hasUpdate = true;
      }
      if (extraInfo?.address && !user.address) {
        user.address = extraInfo.address;
        hasUpdate = true;
      }

      if (hasUpdate) {
        await user.save();
      }
    }
    return user as UserDocument;
  }

  async getGoogleUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token or unable to fetch user info from Google');
    }
  }

  // Tạo JWT token, thêm isGoogleAccount nếu có trong payload
  getAccessToken(payload: { email: string; sub: string; role: string; avatarUrl: string; isGoogleAccount?: boolean }) {
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  // Xác thực token JWT và trả user
  async validateAccessToken(accessToken: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(accessToken);
      const { sub: userId } = decoded as { sub: string };

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Cập nhật address và phone cho user
  async updateAddressAndPhone(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<UserDocument> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.address) {
      user.address = updateUserDto.address;
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone;
    }
    return user.save();
  }

  verifyToken(token: string): any {
  return this.jwtService.verify(token); // sẽ ném lỗi nếu token sai/hết hạn
}

async markEmailAsVerified(userId: string): Promise<void> {
  await this.userService.markEmailAsVerified(userId);
}
async sendResetPasswordEmail(email: string) {
  const user = await this.userService.findByEmail(email);
  if (!user) {
    throw new NotFoundException('Email không tồn tại trong hệ thống');
  }

  const token = this.jwtService.sign({ sub: user._id }, { expiresIn: '15m' });

  await this.emailService.sendResetPasswordEmail(user.email, token);

  return {
    message: '✅ Đã gửi email đặt lại mật khẩu',
  };
}
async resetPassword(token: string, newPassword: string) {
  try {
    const payload = this.jwtService.verify(token);
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userService.update(payload.sub, { password: hashed });
    return { message: '✅ Mật khẩu đã được cập nhật' };
  } catch (err) {
    throw new BadRequestException('❌ Token không hợp lệ hoặc đã hết hạn');
  }
}
}
