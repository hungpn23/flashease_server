import { AbstractEntity } from '@/database/entities/abstract.entity';
import { OffsetMetadataDto } from '@/dto/offset-pagination/metadata.dto';
import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { SelectQueryBuilder } from 'typeorm';

export default async function paginate<Entity extends AbstractEntity>(
  builder: SelectQueryBuilder<Entity>,
  query: OffsetPaginationQueryDto,
) {
  const { skip, take, order, search } = query;

  if (search) {
    builder
      .where('set.name LIKE :name', { name: `%${search.trim()}%` })
      .orWhere('set.description LIKE :description', {
        description: `%${search.trim()}%`,
      });
  }

  builder.skip(skip).take(take).orderBy(`${builder.alias}.createdAt`, order);

  const [entities, totalRecords] = await builder.getManyAndCount();
  const metadata = new OffsetMetadataDto(totalRecords, query);

  return new OffsetPaginatedDto<Entity>(entities, metadata);
}
