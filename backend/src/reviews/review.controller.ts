import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Get, 
  Param
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // ✅ chỉ yêu cầu token khi tạo đánh giá
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req, @Body() dto: CreateReviewDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Không xác định được người dùng từ token.');
    }
    return this.reviewService.create(userId, dto);
  }

  // ✅ mở public
  @Get('product/:id')
  async getReviewsByProduct(@Param('id') id: string) {
    return this.reviewService.getReviewsByProductId(id);
  }
}
