import { Expose } from 'class-transformer';

@Expose()
export class OffsetMetadataDto {
  take: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
}
