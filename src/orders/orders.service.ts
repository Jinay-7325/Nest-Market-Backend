import { Injectable } from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-items.entity';
import { OrderConfirmationEmail } from './entities/order-confirmation-email.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderConfirmationEmail)
    private readonly orderConfirmationEmailRepository: Repository<OrderConfirmationEmail>,
  ) {}
  async create(
    createOrderDto: CreateOrderDto,
    tenant_id: number,
    user_id: number,
  ) {
    console.log(createOrderDto, tenant_id, user_id);

    const order = await this.orderRepository.save({
      user_id: user_id,
      tenant_id: tenant_id,
      total_amount: createOrderDto.total_amount,
      order_time: createOrderDto.order_time,
    });

    console.log(order);
    let itmes: OrderItem[] = [];
    for (let item of createOrderDto.order_items) {
      console.log(item);
      itmes.push(await this.addOrderItems(item, order.order_id));
    }
    return { order, itmes };
  }

  async addOrderItems(orderItemDto: OrderItemDto, order_id: number) {
    const product = await this.productService.findOne(orderItemDto.product_id);
    const orderItem = this.orderItemRepository.save({
      order_id: order_id,
      product_id: orderItemDto.product_id,
      product_name: product?.product_name,
      product_price_at_purchase: product?.product_price,
      purchased_quantity: orderItemDto.purchased_quantity,
    });
    return orderItem;
  }

  async findAll(tenant_id: number) {
    const orders = this.orderRepository.find({
      where: { tenant_id: tenant_id },
    });
    return orders;
  }

  findByVendor(tenant_id: number, vendor_id: number) {
    const orders = this.orderItemRepository.query(
      `select * from order_items as oi join products as p on oi.product_id = p.product_id where p.vendor_id = ${vendor_id} `,
    );
    return orders;
  }
}
