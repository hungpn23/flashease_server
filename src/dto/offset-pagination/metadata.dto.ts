import { Expose } from 'class-transformer';
import { OffsetPaginationQueryDto } from './query.dto';

@Expose()
export class OffsetMetadataDto {
  take: number;
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;

  constructor(totalRecords: number, query: OffsetPaginationQueryDto) {
    this.take = query.take;

    this.totalRecords = totalRecords;

    this.totalPages = this.take > 0 ? Math.ceil(totalRecords / this.take) : 0;

    this.currentPage = query.page;

    this.nextPage =
      this.currentPage < this.totalPages ? this.currentPage + 1 : undefined;

    this.previousPage =
      this.currentPage > 1 && this.currentPage - 1 < this.totalPages
        ? this.currentPage - 1
        : undefined;
  }
}
