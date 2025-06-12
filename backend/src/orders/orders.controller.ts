import { Controller, Post, Body, Get, Param,Patch,Query , HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await this.ordersService.create(createOrderDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getAll() {
    try {
      return await this.ordersService.getOrdersWithProductDetails();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('customer/:id')
  async getByCustomer(@Param('id') customerId: string) {
    try {
      return await this.ordersService.getOrdersByCustomerId(customerId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('supplier/:id')
async getOrdersBySupplier(@Param('id') supplierId: string) {
  return this.ordersService.getOrdersBySupplierId(supplierId);
}
  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string
  ) {
    return this.ordersService.updateOrderStatus(orderId, status);
  }
  @Patch(':id/shipping-status')
updateShippingStatus(
  @Param('id') orderId: string,
  @Body('shippingStatus') shippingStatus: string,
) {
  return this.ordersService.updateShippingStatus(orderId, shippingStatus);
}

  @Get('supplier/:id/revenue')
async getRevenueBySupplier(
  @Param('id') supplierId: string,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.ordersService.calculateRevenueBySupplier(supplierId, from, to);
}
@Get(':id')
async getOrderById(@Param('id') id: string) {
  const order = await this.ordersService.findById(id);
  if (!order) {
    throw new HttpException('Đơn hàng không tồn tại', HttpStatus.NOT_FOUND);
  }
  return order;
}

//
 @Get('supplier/:id/daily-revenue')
  async getDailyRevenue(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getDailyRevenue(supplierId, from, to);
  }

  @Get('supplier/:id/top-products')
  async getTopProducts(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getTopProducts(supplierId, from, to);
  }

  @Get('supplier/:id/order-status')
  async getOrderStatusSummary(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getOrderStatusSummary(supplierId, from, to);
  }
// doanh thu admin
// Tổng doanh thu theo ngày, tháng, năm
// 1. Tổng doanh thu theo ngày / tháng / năm
  @Get('revenue-summary')
  getRevenueSummary(@Query('unit') unit: 'day' | 'month' | 'year') {
    return this.ordersService.getRevenueSummaryByPeriod(unit);
  }

  // 2. Doanh thu theo nhà cung cấp
  @Get('supplier-revenue')
  getRevenueBySuppliers() {
    return this.ordersService.getRevenueGroupedBySuppliers();
  }

  // 3. Tổng số đơn hàng và đơn hàng hoàn thành
  @Get('order-summary')
  getOrderSummary() {
    return this.ordersService.getOrderCountSummary();
  }

  // 4. Tổng số sản phẩm đã được duyệt
  @Get('product-count')
  getTotalApprovedProducts() {
    return this.ordersService.getTotalApprovedProducts();
  }

  // 5. Hàng tồn kho theo loại nông sản
  @Get('stock-by-category')
  getStockByCategory() {
    return this.ordersService.getStockByCategory();
  }
}
