import { Types } from 'mongoose';

export class UpdateProductDto {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  quantity?: number;
  unitType?: string;
  unitDisplay?: string;
  stock?: number;
  origin?: string;
  images?: string[];
  categoryId?: string | Types.ObjectId;
  supplierId?: string | Types.ObjectId;
  isActive?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'out_of_stock';
}
