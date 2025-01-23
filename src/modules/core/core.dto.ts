import { SetEntity } from '../set/entities/set.entity';

export class PracticeMetadata {
  totalCards: number;
  notStudiedCount: number;
  learningCount: number;
  knowCount: number;
}

export class FindPracticeResponseDto {
  set: SetEntity;
  metadata: PracticeMetadata;
}
