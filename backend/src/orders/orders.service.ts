import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import mongoose from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // 1. Kiểm tra từng sản phẩm
      for (const item of createOrderDto.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm ID ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Sản phẩm ${product.name} không đủ hàng tồn kho`);
        }

        product.stock -= item.quantity;
        await product.save();
      }

      // 2. Chuyển tất cả ID sang ObjectId trước khi lưu
      const orderToSave = {
        ...createOrderDto,
        customerId: new Types.ObjectId(createOrderDto.customerId),
        items: createOrderDto.items.map(item => ({
          ...item,
          productId: new Types.ObjectId(item.productId),
          supplierId: new Types.ObjectId(item.supplierId),
        })),
      };

      const order = new this.orderModel(orderToSave);
      return await order.save();
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // async getOrdersWithProductDetails() {
  //   try {
  //     return await this.orderModel
  //       .find()
  //       .populate({
  //         path: 'items.productId',
  //         select: 'name images categoryId',
  //         populate: {
  //           path: 'categoryId',
  //           select: 'name',
  //         },
  //       })
  //       .exec();
  //   } catch (error) {
  //     throw new Error(`Failed to get orders: ${error.message}`);
  //   }
  // }
async getOrdersWithProductDetails() {
  return this.orderModel
    .find()
    .populate({
      path: 'items.productId',
      select: 'name images price',
    })
    .populate({
      path: 'items.supplierId', // ✅ Thêm dòng này
      select: 'name', // Lấy tên nhà cung cấp
    })
    .populate({
      path: 'customerId',
      select: 'name phone email address',
    })
    .exec();
}
  async getOrdersByCustomerId(customerId: string) {
    try {
      return await this.orderModel
        .find({ customerId: new Types.ObjectId(customerId) }) // ✅ đảm bảo match
        .populate({
          path: 'items.productId',
          select: 'name images categoryId',
          populate: {
            path: 'categoryId',
            select: 'name',
          },
        })
        .exec();
    } catch (error) {
      throw new Error(`Failed to get orders by customer: ${error.message}`);
    }
  }

  async getOrdersBySupplierId(supplierId: string) {
  return this.orderModel
    .find({
      'items.supplierId': new Types.ObjectId(supplierId),
    })
    .populate({
      path: 'items.productId',
      select: 'name images price',
    })
    .populate({
      path: 'customerId',
      select: 'name phone email address', 
    })
    .exec();
}

   async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const allowed = ['Đã đặt hàng', 'Đã xác nhận', 'Đang giao hàng', 'Hoàn thành'];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    order.status = status;
    await order.save();

    return order;
  }
//   async markOrderStatus(orderId: string, status: string, transactionId?: string) {
//   if (!orderId) {
//     throw new BadRequestException('Thiếu ID đơn hàng');
//   }

//   const updateData: Record<string, any> = { status };

//   if (transactionId) {
//     updateData.transactionId = transactionId;
//   }

//   const order = await this.orderModel.findByIdAndUpdate(
//     orderId,
//     { $set: updateData },
//     { new: true },
//   );

//   if (!order) {
//     throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
//   }

//   return order;
// }

   // danh thu 
   async calculateRevenueBySupplier(
    supplierId: string,
    from?: string,
    to?: string,
  ) {
    const match: any = {
      'items.supplierId': new mongoose.Types.ObjectId(supplierId),
      status: 'Hoàn thành',
    };

    if (from && to) {
      match.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const result = await this.orderModel.aggregate([
      { $unwind: '$items' },
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          totalOrders: { $addToSet: '$_id' }, // tránh trùng đơn hàng
          totalProductsSold: { $sum: '$items.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrdersCount: { $size: '$totalOrders' },
          totalProductsSold: 1,
        },
      },
    ]);

    return result[0] || {
      totalRevenue: 0,
      totalOrdersCount: 0,
      totalProductsSold: 0,
    };
  }
//
async markAsPaid(orderId: string): Promise<OrderDocument> {
  const order = await this.orderModel.findById(orderId);
  if (!order) {
    throw new NotFoundException('Không tìm thấy đơn hàng');
  }

  order.isPaid = true;
  order.status = 'Đã thanh toán';
  return await order.save();
}
async findById(orderId: string) {
  return this.orderModel.findById(orderId).exec();
}

}
