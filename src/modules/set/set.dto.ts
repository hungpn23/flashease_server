import {
  BooleanValidators,
  ClassValidators,
  EnumValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import { CardDto } from '../core/dtos/card.dto';
import { SetEntity } from './entities/set.entity';
import { VisibleTo } from './set.enum';

export class CreateSetDto {
  @StringValidators()
  name: string;

  @StringValidators({ minLength: 0, required: false })
  description?: string;

  @EnumValidators(VisibleTo)
  visibleTo: VisibleTo;

  @ValidateIf((o) => o.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSCODE)
  @StringValidators()
  passcode?: string;

  @ClassValidators(CardDto, { isArray: true })
  cards: CardDto[];
}

export class UpdateSetDto extends CreateSetDto {}

export class StartLearningDto {
  @StringValidators({ minLength: 0 })
  passcode: string;
}

export class SaveAnswerDto {
  @BooleanValidators()
  isCorrect: boolean;
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
