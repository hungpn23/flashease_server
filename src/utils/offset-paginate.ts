import { AbstractEntity } from '@/database/entities/abstract.entity';
import { OffsetMetadataDto } from '@/dto/offset-pagination/metadata.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { SelectQueryBuilder } from 'typeorm';

export default async function paginate<Entity extends AbstractEntity>(
  builder: SelectQueryBuilder<Entity>,
  query: OffsetPaginationQueryDto,
) {
  const { skip, take, order } = query;

  builder.skip(skip).take(take).orderBy(`${builder.alias}.createdAt`, order);

  const [entities, totalRecords] = await builder.getManyAndCount();

  const metadata = new OffsetMetadataDto(totalRecords, query);

  return { entities, metadata };
}
