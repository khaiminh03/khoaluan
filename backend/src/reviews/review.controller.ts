import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Delete,
  Param,
  UnauthorizedException,
  BadRequestException,

} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReviewDto & { accessToken: string }) {
    const decoded = this.jwtService.verify(dto.accessToken);
    const userId = decoded.sub;

    if (!userId) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }

    return this.reviewService.create(userId, dto);
  }

  @Get('product/:id')
  async getReviewsByProduct(@Param('id') id: string) {
    return this.reviewService.getReviewsByProductId(id);
  }
  @Get('all')
async getAllReviews() {
  return this.reviewService.findAll();
}
 @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Thiếu ID');
    }
    return this.reviewService.deleteReview(id);
  }
}
