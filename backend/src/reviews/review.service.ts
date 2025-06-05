import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Review') private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Convert string IDs to ObjectId
    const customerIdObject = new Types.ObjectId(userId);
    const orderIdObject = new Types.ObjectId(dto.orderId);
    const productIdObject = new Types.ObjectId(dto.productId);

    // Tìm đơn hàng thuộc về người dùng & đã hoàn thành
    const order = await this.orderModel.findOne({
      _id: orderIdObject,
      customerId: customerIdObject,
      status: { $regex: /^hoàn thành$/i },
    });

    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng hoặc đơn hàng chưa hoàn thành.');
    }

    // Kiểm tra sản phẩm có trong đơn hàng không
    const matchedItem = order.items.find(
      (item: any) => item.productId.toString() === dto.productId
    );

    if (!matchedItem) {
      throw new BadRequestException('Sản phẩm không có trong đơn hàng.');
    }

    if (matchedItem.isReviewed) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này.');
    }

    // Tạo đánh giá
    const review = await this.reviewModel.create({
      userId: customerIdObject,
      productId: productIdObject,
      orderId: orderIdObject,
      rating: dto.rating,
      comment: dto.comment,
    });

    // Đánh dấu là đã đánh giá trong order.items
    await this.orderModel.updateOne(
      {
        _id: orderIdObject,
        'items.productId': productIdObject,
      },
      {
        $set: { 'items.$.isReviewed': true },
      }
    );

    return review;
  }
  async getReviewsByProductId(productId: string): Promise<Review[]> {
  if (!Types.ObjectId.isValid(productId)) {
    throw new BadRequestException('ID sản phẩm không hợp lệ');
  }

  return this.reviewModel
    .find({ productId: new Types.ObjectId(productId) })
    .populate('userId', 'name email avatarUrl') // ✅ thêm dòng này để lấy tên + email người dùng
    .sort({ createdAt: -1 })
    .exec();
}
}
