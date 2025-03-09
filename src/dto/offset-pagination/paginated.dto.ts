import { AbstractEntity } from '@/database/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OffsetMetadataDto } from './metadata.dto';

@Expose()
export class OffsetPaginatedDto<Entity extends AbstractEntity> {
  @ApiProperty({ type: Array<Object> }) // to avoid circular dependency
  data: Entity[];
  metadata: OffsetMetadataDto;
}
