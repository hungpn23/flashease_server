import {
  BooleanValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';
import { SetEntity } from '../set/entities/set.entity';
import { ProgressEntity } from './entities/progress.entity';

export class StartProgressDto {
  @StringValidators({ required: false })
  visibleToPassword?: string;
}

export class FindProgressDetailDto extends StartProgressDto {}

export class SaveAnswerDto {
  @BooleanValidators()
  isCorrect: boolean;
}

@Expose()
export class ProgressMetadataDto {
  totalCards: number;
  notStudiedCount: number;
  learningCount: number;
  knownCount: number;
}

@Expose()
export class FindProgressDetailResDto {
  set: SetEntity;
  metadata: ProgressMetadataDto;
}

@Expose()
export class ProgressWithMetadataDto extends ProgressEntity {
  metadata: ProgressMetadataDto;
}
