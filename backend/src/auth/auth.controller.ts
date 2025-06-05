import { Controller, Post, Body,Get, UseGuards, Req, Res,Put,Param   } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto'; // hoặc bạn tự tạo DTO
import { LoginUserDto } from './dto/login-user.dto'
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { BadRequestException, Query } from '@nestjs/common';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {

  }

@UseGuards(GoogleAuthGuard)
@Get('google/callback')
async googleCallback(@Req() req, @Res() res) {
  const { access_token } = req.user; // Lấy token đã tạo sẵn trong GoogleStrategy
  res.redirect(`http://localhost:5173/login?token=${access_token}`);
}
@Put('update-address-phone/:userId')
async updateAddressAndPhone(
  @Param('userId') userId: string,
  @Body() updateUserDto: UpdateUserDto,
) {
  return this.authService.updateAddressAndPhone(userId, updateUserDto);
}
@Get('verify-email')
async verifyEmail(@Query('token') token: string) {
  try {
    const payload = this.authService.verifyToken(token); // 👈 tách hàm verify cho rõ
    await this.authService.markEmailAsVerified(payload.sub);
    return { message: '✅ Tài khoản đã được xác minh thành công' };
  } catch (err) {
    console.error('❌ Lỗi xác minh token:', err.message);
    throw new BadRequestException('❌ Token không hợp lệ hoặc đã hết hạn');
  }
}
@Post('forgot-password')
async forgotPassword(@Body('email') email: string) {
  return this.authService.sendResetPasswordEmail(email);
}
@Put('reset-password')
async resetPassword(
  @Query('token') token: string,
  @Body('newPassword') newPassword: string,
) {
  return this.authService.resetPassword(token, newPassword);
}

}
