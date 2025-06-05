export class CreateReviewDto {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}
