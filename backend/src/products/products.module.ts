import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { CategoryModule } from '../categories/categories.module';
import { StoreProfileModule } from '../store-profile/store-profile.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    CategoryModule,
    StoreProfileModule, // nếu controller/service có dùng Category
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [
    ProductsService,
    MongooseModule,
     // cho phép module khác dùng Product model
  ],
})
export class ProductsModule {}
