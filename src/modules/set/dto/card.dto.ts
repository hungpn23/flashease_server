import { StringValidators } from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';

@Expose()
export class CardDto {
  @StringValidators({ required: false, minLength: 0 })
  id?: string | null;

  @StringValidators()
  term: string;

  @StringValidators()
  definition: string;
}
