import {
  BooleanValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';
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
export class ProgressDetailDto {
  progress: ProgressEntity;
  metadata: ProgressMetadataDto;
}
