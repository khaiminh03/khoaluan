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
         status: 'Chưa thanh toán',
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
  const allowed = ['Chưa thanh toán', 'Đã thanh toán']; // ✅ CHỈ trạng thái thanh toán
  if (!allowed.includes(status)) {
    throw new BadRequestException('Trạng thái thanh toán không hợp lệ');
  }

  const order = await this.orderModel.findById(orderId);
  if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

  order.status = status;
  await order.save();

  return order;
}
  async updateShippingStatus(orderId: string, shippingStatus: string): Promise<Order> {
  const allowed = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng','Giao thất bại', 'Hoàn thành'];
  if (!allowed.includes(shippingStatus)) {
    throw new BadRequestException('Trạng thái vận chuyển không hợp lệ');
  }

  const order = await this.orderModel.findById(orderId);
  if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

  order.shippingStatus = shippingStatus;


  if (shippingStatus === 'Hoàn thành') {
    order.status = 'Đã thanh toán';
    order.isPaid = true;
  }

  await order.save();
  return order;
}
   // danh thu 
   async calculateRevenueBySupplier(
    supplierId: string,
    from?: string,
    to?: string,
  ) {
    const match: any = {
      'items.supplierId': new mongoose.Types.ObjectId(supplierId),
      shippingStatus: 'Hoàn thành',
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


///
async getDailyRevenue(supplierId: string, from?: string, to?: string) {
  const match: any = {
    'items.supplierId': new Types.ObjectId(supplierId),
    shippingStatus: 'Hoàn thành',
  };
  if (from && to) {
    match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }

  return this.orderModel.aggregate([
    { $unwind: '$items' },
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      },
    },
    {
      $project: {
        date: '$_id',
        revenue: 1,
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);
}

  async getTopProducts(supplierId: string, from?: string, to?: string) {
  const match: any = {
    'items.supplierId': new Types.ObjectId(supplierId),
    shippingStatus: 'Hoàn thành',
  };
  if (from && to) {
    match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }

  return this.orderModel.aggregate([
    { $unwind: '$items' },
    { $match: match },
    {
      $group: {
        _id: '$items.productId',
        sold: { $sum: '$items.quantity' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        sold: 1,
        _id: 0,
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);
}
  async getOrderStatusSummary(supplierId: string, from?: string, to?: string) {
  const match: any = {
    'items.supplierId': new Types.ObjectId(supplierId),
  };
  if (from && to) {
    match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }

  return this.orderModel.aggregate([
    { $unwind: '$items' },
    { $match: match },
    {
      $group: {
        _id: '$shippingStatus',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);
}
// doanh thu admin
// Tổng doanh thu theo ngày, tháng, năm
async getRevenueSummaryByPeriod(unit: 'day' | 'month' | 'year') {
  const formatMap = {
    day: '%Y-%m-%d',
    month: '%Y-%m',
    year: '%Y',
  };
  const format = formatMap[unit];

  return this.orderModel.aggregate([
    { $match: { shippingStatus: 'Hoàn thành' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: { $dateToString: { format, date: '$createdAt' } },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      },
    },
    { $project: { date: '$_id', revenue: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ]);
}
//Doanh thu theo nhà cung cấp
async getRevenueGroupedBySuppliers() {
  return this.orderModel.aggregate([
    { $match: { shippingStatus: 'Hoàn thành' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.supplierId',
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        productsSold: { $sum: '$items.quantity' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    { $unwind: '$supplier' },
    {
      $project: {
        supplierId: '$_id',
        revenue: 1,
        productsSold: 1,
        name: '$supplier.name',
        email: '$supplier.email',
      },
    },
  ]);
}
//Tổng số đơn hàng và đơn hàng đã hoàn thành
async getOrderCountSummary() {
  const [total, completed] = await Promise.all([
    this.orderModel.countDocuments(),
    this.orderModel.countDocuments({ shippingStatus: 'Hoàn thành' }),
  ]);

  return {
    totalOrders: total,
    completedOrders: completed,
  };
}
// Tổng số sản phẩm đã được đăng bán
async getTotalApprovedProducts() {
  return this.productModel.countDocuments({ isActive: true, status: 'approved' });
}
// Số lượng hàng tồn kho theo loại nông sản
async getStockByCategory() {
  return this.productModel.aggregate([
    {
      $group: {
        _id: '$categoryId',
        totalStock: { $sum: '$stock' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        categoryName: '$category.name',
        totalStock: 1,
        _id: 0,
      },
    },
  ]);
}

}

