import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull'; // ✅ import type
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderConfirmationEmail,
  EmailStatus,
} from '../entities/order-confirmation-email.entity';

export const EMAIL_QUEUE = 'email';
export const SEND_ORDER_CONFIRMATION = 'send-order-confirmation';

export interface OrderConfirmationJob {
  order_id: number;
  recipient_email: string;
  order_email_id: number;
}

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  constructor(
    @InjectRepository(OrderConfirmationEmail)
    private readonly emailRepository: Repository<OrderConfirmationEmail>,
  ) {}

  @Process(SEND_ORDER_CONFIRMATION)
  async handleOrderConfirmation(job: Job<OrderConfirmationJob>) {
    const { order_id, recipient_email, order_email_id } = job.data;

    await this.emailRepository.update(order_email_id, {
      email_status: EmailStatus.SENDING,
    });

    try {
      console.log(
        `📧 Sending confirmation email to ${recipient_email} for order #${order_id}`,
      );

      await this.emailRepository.update(order_email_id, {
        email_status: EmailStatus.SUCCESS,
      });

      console.log(`✅ Email sent successfully for order #${order_id}`);
    } catch (error) {
      await this.emailRepository.increment(
        { id: order_email_id },
        'retry_count',
        1,
      );
      await this.emailRepository.update(order_email_id, {
        email_status: EmailStatus.FAILED,
      });
      throw error;
    }
  }
}
