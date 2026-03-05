import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  category_id: number;

  @IsNotEmpty()
  product_name: string;

  @IsOptional()
  product_description: string;

  @IsNotEmpty()
  @IsPositive()
  product_price: number;

  @IsNotEmpty()
  @IsPositive()
  available_quantity: number;

  @IsNotEmpty()
  vendor_id: number;
}
