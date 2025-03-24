import { StringValidators } from '@/decorators/properties.decorator';
import { UUID } from '@/types/branded.type';

export class CardDto {
  @StringValidators({ required: false, minLength: 0 })
  id?: UUID | null;

  @StringValidators()
  term: string;

  @StringValidators()
  definition: string;
}
