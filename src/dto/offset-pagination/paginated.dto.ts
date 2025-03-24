import { AbstractEntity } from '@/database/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OffsetMetadataDto } from './metadata.dto';

export class OffsetPaginatedDto<Entity extends AbstractEntity> {
  @ApiProperty({ type: Array<object> }) // to avoid circular dependency
  data: Entity[];
  metadata: OffsetMetadataDto;
}
