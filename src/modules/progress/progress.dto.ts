import {
  BooleanValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SetEntity } from '../set/entities/set.entity';
import { UserEntity } from '../user/entities/user.entity';
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
export class FindMyProgressDto extends IntersectionType(
  PickType(SetEntity, ['name', 'description'] as const),
  PickType(UserEntity, ['username'] as const),
  PickType(ProgressEntity, ['createdAt'] as const),
) {
  metadata: ProgressMetadataDto;
}
