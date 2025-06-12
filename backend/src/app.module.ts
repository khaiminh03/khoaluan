import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module'
import { AuthModule } from './auth/auth.module';
import googleOAuthConfig from './auth/config/google-oauth.config';
import { OrdersModule } from './orders/orders.module';
import { StoreProfileModule } from './store-profile/store-profile.module';
import {ReviewModule} from './reviews/review.module';
import { PaymentModule } from './payment/payment.module';
@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
      load: [googleOAuthConfig],
      envFilePath: '.env', 
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/db_ecommerce'),
    CategoryModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
    StoreProfileModule,
    ReviewModule,
    PaymentModule,

    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
