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
}
