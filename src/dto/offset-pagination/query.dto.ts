import { Order } from '@/constants';
import {
  EnumValidators,
  NumberValidators,
  StringValidators,
} from '@/decorators/properties.decorator';

export class OffsetPaginationQueryDto {
  @NumberValidators({ isInt: true, min: 1, required: false })
  page?: number;

  @NumberValidators({ isInt: true, min: 10, required: false })
  take?: number;

  @EnumValidators(Order, { required: false })
  order?: Order;

  @StringValidators({ required: false })
  search?: string;

  constructor() {
    this.page = 1;
    this.take = 10;
    this.order = Order.DESC;
  }

  @NumberValidators({ isInt: true, required: false })
  get skip() {
    return this.page ? (this.page - 1) * this.take : 0;
  }
}
