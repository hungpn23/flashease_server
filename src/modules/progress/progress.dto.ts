import {
  BooleanValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { Expose } from 'class-transformer';
import { SetEntity } from '../set/entities/set.entity';

@Expose()
export class ProgressMetadataDto {
  totalCards: number;
  notStudiedCount: number;
  learningCount: number;
  knowCount: number;
}

@Expose()
export class FindProgressResponseDto {
  set: SetEntity;
  metadata: ProgressMetadataDto;
}

export class StartProgressDto {
  @StringValidators({ required: false })
  visibleToPassword?: string;
}

export class FindProgressDto extends StartProgressDto {}

export class SaveAnswerDto {
  @BooleanValidators()
  isCorrect: boolean;
}
