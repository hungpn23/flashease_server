import {
  ClassValidators,
  EnumValidators,
  PasswordValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import { EditableBy, VisibleTo } from './set.enum';

@Expose()
export class CardDto {
  @StringValidators()
  term: string;

  @StringValidators()
  definition: string;
}

export class CreateSetDto {
  @StringValidators()
  name: string;

  @StringValidators({ required: false })
  description?: string;

  @EnumValidators(VisibleTo)
  visibleTo: VisibleTo;

  @ValidateIf((o) => o.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD)
  @PasswordValidators()
  visibleToPassword: string;

  @EnumValidators(EditableBy)
  editableBy: EditableBy;

  @ValidateIf((o) => o.editableBy === EditableBy.PEOPLE_WITH_A_PASSWORD)
  @PasswordValidators()
  editableByPassword: string;

  @ClassValidators(CardDto, { isArray: true })
  cards: CardDto[];
}

export class FindOneSetDto {
  @PasswordValidators({ required: false })
  visibleToPassword?: string;
}

export class UpdateSetDto extends PartialType(CreateSetDto) {}
