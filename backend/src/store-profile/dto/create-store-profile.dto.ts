import { IsNotEmpty,IsOptional, IsString } from 'class-validator';

export class CreateStoreProfileDto {
  @IsNotEmpty()
  @IsString()
  storeName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

   @IsOptional() // 👈 thêm cái này
  @IsString()
  imageUrl?: string;
}
