import { StringValidators } from '@/decorators/properties.decorator';

export class ConvertFromTextDto {
  @StringValidators()
  input: string;
}
