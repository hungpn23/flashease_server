import {
  ClassValidators,
  EnumValidators,
  PasswordValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { OmitType, PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import { CardDto } from '../core/dtos/card.dto';
import { SetEntity } from './entities/set.entity';
import { EditableBy, VisibleTo } from './set.enum';

export class CreateSetDto {
  @StringValidators()
  name: string;

  @StringValidators({ required: false })
  description?: string;

  @EnumValidators(VisibleTo)
  visibleTo: VisibleTo;

  @ValidateIf((o) => o.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD)
  @PasswordValidators()
  visibleToPassword?: string;

  @EnumValidators(EditableBy)
  editableBy: EditableBy;

  @ValidateIf((o) => o.editableBy === EditableBy.PEOPLE_WITH_A_PASSWORD)
  @PasswordValidators()
  editableByPassword?: string;

  @ClassValidators(CardDto, { isArray: true })
  cards: CardDto[];
}

export class UpdateSetDto extends PartialType(
  OmitType(CreateSetDto, ['cards'] as const),
) {}

export class UpdateCardsDto {
  @ClassValidators(CardDto, { isArray: true })
  cards: CardDto[];
}

@Expose()
export class SetMetadataDto {
  totalCards: number;
  notStudiedCount: number;
  learningCount: number;
  knownCount: number;
}

@Expose()
export class SetDetailDto {
  set: SetEntity;
  metadata: SetMetadataDto;
}
