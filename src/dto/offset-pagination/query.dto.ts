import { Order } from '@/constants';
import {
  EnumValidators,
  NumberValidators,
  StringValidators,
} from '@/decorators/properties.decorator';

export class OffsetPaginationQueryDto {
  @NumberValidators({ isInt: true, min: 1, required: false })
  page?: number = 1;

  @NumberValidators({ isInt: true, min: 10, required: false })
  take?: number = 10;

  @EnumValidators(Order, { required: false })
  order?: Order = Order.DESC;

  @StringValidators({ required: false })
  search?: string;

  get skip() {
    return this.page ? (this.page - 1) * this.take : 0;
  }
}
