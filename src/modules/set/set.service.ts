import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CardEntity } from './entities/card.entity';
import { ProgressEntity } from './entities/progress.entity';
import { SetEntity } from './entities/set.entity';
import { CreateSetDto, ProgressMetadataDto, UpdateSetDto } from './set.dto';
import { VisibleTo } from './set.enum';

@Injectable()
export class SetService {
  async create(dto: CreateSetDto, userId: number) {
    const found = await SetEntity.findOneBy({
      name: dto.name,
      createdBy: userId,
    });

    if (found) throw new ConflictException();

    const cards = dto.cards.map((card) => {
      return new CardEntity({ ...card, createdBy: userId });
    });

    const set = new SetEntity({ ...dto, cards, createdBy: userId });
    return await SetEntity.save(set);
  }

  async findAll(query: OffsetPaginationQueryDto) {
    const builder = SetEntity.createQueryBuilder('set');

    builder.where('set.visibleTo = :visibleTo', {
      visibleTo: VisibleTo.EVERYONE,
    });

    if (query.search) {
      const search = query.search.trim();
      builder
        .where('set.name LIKE :name', { name: `%${search}%` })
        .orWhere('set.description LIKE :description', {
          description: `%${search}%`,
        });
    }

    const { entities, metadata } = await paginate<SetEntity>(builder, query);

    return new OffsetPaginatedDto<SetEntity>(entities, metadata);
  }

  async findMySets(query: OffsetPaginationQueryDto, userId: number) {
    const builder = SetEntity.createQueryBuilder('set');

    builder.where('set.createdBy = :userId', { userId });

    if (query.search) {
      const search = query.search.trim();
      builder
        .where('set.name LIKE :name', { name: `%${search}%` })
        .orWhere('set.description LIKE :description', {
          description: `%${search}%`,
        });
    }

    const { entities, metadata } = await paginate<SetEntity>(builder, query);

    return new OffsetPaginatedDto<SetEntity>(entities, metadata);
  }

  async update(setId: number, dto: UpdateSetDto, userId: number) {
    const { cards, ...rest } = dto;

    const found = await SetEntity.findOneOrFail({
      where: { id: setId },
      relations: ['cards'],
    });

    if (found.createdBy !== userId) throw new ForbiddenException();

    if (cards) {
      await CardEntity.remove(found.cards);
      found.cards = cards.map((card) => {
        return new CardEntity({ ...card, createdBy: userId });
      });
    }

    return await SetEntity.save(
      Object.assign(found, {
        ...rest,
        updatedBy: userId,
      } as SetEntity),
    );
  }

  async remove(setId: number, userId: number) {
    const found = await SetEntity.findOneOrFail({ where: { id: setId } });

    if (found.createdBy !== userId) throw new ForbiddenException();

    return await SetEntity.remove(found);
  }

  private getProgressMetadata(progresses: ProgressEntity[]) {
    const metadata = {
      totalCards: progresses.length,
      notStudiedCount: 0,
      learningCount: 0,
      knowCount: 0,
    } as ProgressMetadataDto;

    progresses.forEach((p) => {
      if (!p.correctCount) {
        metadata.notStudiedCount += 1;
      } else if (p.correctCount >= 2) {
        metadata.knowCount += 1;
      } else {
        metadata.learningCount += 1;
      }
    });

    return metadata;
  }
}
