import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull'; // ✅ import type
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-items.entity';
import {
  OrderConfirmationEmail,
  EmailStatus,
} from './entities/order-confirmation-email.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  EMAIL_QUEUE,
  SEND_ORDER_CONFIRMATION,
} from './processors/email.processor';
import { InventoryChangeType } from 'src/inventory/entities/inventory-log.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { UsersService } from 'src/users/users.service';
import { Product } from 'src/products/entities/product.entity'; // ✅ direct import

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(OrderConfirmationEmail)
    private readonly emailRepository: Repository<OrderConfirmationEmail>,

    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,

    private readonly inventoryService: InventoryService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    tenant_id: number,
    user_id: number,
  ) {
    const { order, items } = await this.dataSource.transaction(
      async (manager) => {
        // 1. Validate stock for all items
        const productSnapshots: {
          product_id: number;
          product_name: string;
          product_price_at_purchase: number;
          purchased_quantity: number;
          previous_quantity: number;
          new_quantity: number;
          vendor_id: number;
        }[] = [];

        for (const item of createOrderDto.order_items) {
          const product = await manager.findOne(Product, {
            // ✅ direct import, no require()
            where: { product_id: item.product_id },
          });

          if (!product) {
            throw new NotFoundException(
              `Product #${item.product_id} not found`,
            );
          }
          if (product.available_quantity < item.purchased_quantity) {
            throw new BadRequestException(
              `Insufficient stock for "${product.product_name}". Available: ${product.available_quantity}`,
            );
          }

          productSnapshots.push({
            product_id: product.product_id,
            product_name: product.product_name,
            product_price_at_purchase: product.product_price,
            purchased_quantity: item.purchased_quantity,
            previous_quantity: product.available_quantity,
            new_quantity: product.available_quantity - item.purchased_quantity,
            vendor_id: product.vendor_id,
          });
        }

        // 2. Create order
        const order = await manager.save(Order, {
          user_id,
          tenant_id,
          total_amount: createOrderDto.total_amount,
          order_time: createOrderDto.order_time,
        });

        // 3. Save order items + reduce stock
        const items: OrderItem[] = [];
        for (const snapshot of productSnapshots) {
          const item = await manager.save(OrderItem, {
            order_id: order.order_id,
            product_id: snapshot.product_id,
            product_name: snapshot.product_name,
            product_price_at_purchase: snapshot.product_price_at_purchase,
            purchased_quantity: snapshot.purchased_quantity,
          });
          items.push(item);

          // ✅ Reduce stock inside transaction
          await manager.decrement(
            Product,
            { product_id: snapshot.product_id },
            'available_quantity',
            snapshot.purchased_quantity,
          );
        }

        // 4. Create email record
        await manager.save(OrderConfirmationEmail, {
          order_id: order.order_id,
          email_status: EmailStatus.REMAINING,
          recipient_email: '',
          retry_count: 0,
        });

        return { order, items, productSnapshots };
      },
    );

    // ─── After transaction ─────────────────────────────────────

    // 5. Log inventory changes
    for (const item of items) {
      const product = await this.dataSource
        .getRepository(Product)
        .findOne({ where: { product_id: item.product_id } });

      if (!product) continue; // ✅ null check

      await this.inventoryService.log({
        tenant_id,
        product_id: item.product_id,
        change_type: InventoryChangeType.SALE,
        quantity_change: -item.purchased_quantity,
        previous_quantity: product.available_quantity + item.purchased_quantity,
        new_quantity: product.available_quantity,
        performed_by: user_id,
        reference_id: order.order_id,
        reference_type: 'order',
      });
    }

    // 6. Get user email + update email record
    const user = await this.usersService.findById(user_id);
    const emailRecord = await this.emailRepository.findOne({
      where: { order_id: order.order_id },
    });

    if (user && emailRecord) {
      await this.emailRepository.update(emailRecord.id, {
        recipient_email: user.email,
      });

      // 7. Add to Bull Queue
      await this.emailQueue.add(
        SEND_ORDER_CONFIRMATION,
        {
          order_id: order.order_id,
          recipient_email: user.email,
          order_email_id: emailRecord.id,
        },
        {
          attempts: 3,
          backoff: 5000,
          removeOnComplete: true,
        },
      );
    }

    return { order, items };
  }

  async findAll(tenant_id: number) {
    return this.orderRepository.find({
      where: { tenant_id },
      relations: ['items'],
    });
  }

  findByVendor(tenant_id: number, vendor_id: number) {
    return this.orderItemRepository
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .where('p.vendor_id = :vendor_id', { vendor_id })
      .andWhere('p.tenant_id = :tenant_id', { tenant_id })
      .getMany();
  }
}
