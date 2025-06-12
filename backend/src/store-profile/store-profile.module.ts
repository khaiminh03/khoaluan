import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreProfileService } from './store-profile.service';
import { StoreProfileController } from './store-profile.controller';
import { StoreProfile, StoreProfileSchema } from './schemas/store-profile.schema';
import { User, UserSchema } from '../users/schemas/user.schema';  // Đường dẫn chính xác tới file user.schema.ts
import { UserModule } from '../users/user.module';  // Đường dẫn chính xác tới user.module.ts

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreProfile.name, schema: StoreProfileSchema },
      { name: User.name, schema: UserSchema },  
    ]),
    UserModule,
  ],
  controllers: [StoreProfileController],
  providers: [StoreProfileService],
  exports: [StoreProfileService,MongooseModule],
})
export class StoreProfileModule {}
