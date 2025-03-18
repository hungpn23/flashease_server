import { StringValidators } from '@/decorators/properties.decorator';
import { UUID } from '@/types/branded.type';
import { Expose } from 'class-transformer';

@Expose()
export class CardDto {
  @StringValidators({ required: false, minLength: 0 })
  id?: UUID | null;

  @StringValidators()
  term: string;

  @StringValidators()
  definition: string;
}
