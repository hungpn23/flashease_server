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
export class GetProgressResponseDto {
  set: SetEntity;
  metadata: ProgressMetadataDto;
}
