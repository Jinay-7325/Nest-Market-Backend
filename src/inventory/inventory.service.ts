import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InventoryLog,
  InventoryChangeType,
} from './entities/inventory-log.entity';

interface LogInventoryParams {
  tenant_id: number;
  product_id: number;
  change_type: InventoryChangeType;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  performed_by: number;
  reference_id?: number | null;
  reference_type?: string | null;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
  ) {}

  async log(params: LogInventoryParams) {
    const log = this.inventoryLogRepository.create(params);
    return this.inventoryLogRepository.save(log);
  }

  async findAll(tenant_id: number) {
    return this.inventoryLogRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  async findByProduct(product_id: number) {
    return this.inventoryLogRepository.find({
      where: { product_id },
      order: { created_at: 'DESC' },
    });
  }
}
