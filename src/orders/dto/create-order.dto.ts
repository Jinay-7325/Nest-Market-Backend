import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty()
  product_id: number;

  @IsNotEmpty()
  purchased_quantity: number;
}

export class CreateOrderDto {
  @IsPositive()
  total_amount: number;

  @IsDateString()
  order_time: Date;

  @IsArray()
  @Type(() => OrderItemDto)
  order_items: OrderItemDto[];
}
