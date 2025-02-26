import { StringValidators } from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';

@Expose()
export class CardDto {
  @StringValidators()
  id: string;

  @StringValidators()
  term: string;

  @StringValidators()
  definition: string;
}
