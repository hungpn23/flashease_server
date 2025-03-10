import { OffsetMetadataDto } from '@/dto/offset-pagination/metadata.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { plainToInstance } from 'class-transformer';

export function genOffsetMetadata(
  totalRecords: number,
  query: OffsetPaginationQueryDto,
) {
  const take = query.take;

  const totalPages = take > 0 ? Math.ceil(totalRecords / take) : 0;

  const currentPage = query.page;

  const nextPage = currentPage < totalPages ? currentPage + 1 : undefined;

  const previousPage =
    currentPage > 1 && currentPage - 1 < totalPages
      ? currentPage - 1
      : undefined;

  return plainToInstance(OffsetMetadataDto, {
    take,
    totalRecords,
    totalPages,
    currentPage,
    nextPage,
    previousPage,
  });
}
