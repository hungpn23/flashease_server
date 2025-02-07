import {
  BooleanValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';
import { SetEntity } from '../entities/set.entity';

@Expose()
export class ProgressMetadataDto {
  totalCards: number;
  notStudiedCount: number;
  learningCount: number;
  knowCount: number;
}

@Expose()
export class GetProgressResDto {
  set: SetEntity;
  metadata: ProgressMetadataDto;
}

export class GetProgressDto {
  @StringValidators({ required: false })
  visibleToPassword?: string;
}

export class SaveAnswerDto {
  @BooleanValidators()
  isCorrect: boolean;
}
