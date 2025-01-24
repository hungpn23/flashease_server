import {
  ClassValidators,
  EnumValidators,
  PasswordValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { PartialType } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { CardDto } from '../../core/dtos/card.dto';
import { EditableBy, VisibleTo } from '../set.enum';

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
