import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../user/entities/user.entity';
import {
  GetProgressResponseDto,
  ProgressMetadataDto,
} from './dtos/progress.dto';
import { CreateSetDto, UpdateSetDto } from './dtos/set.dto';
import { CardEntity } from './entities/card.entity';
import { ProgressEntity } from './entities/progress.entity';
import { SetEntity } from './entities/set.entity';
import { VisibleTo } from './set.enum';

@Injectable()
export class SetService {
  async create(dto: CreateSetDto, userId: number) {
    const found = await SetEntity.findOneBy({
      name: dto.name,
      createdBy: userId,
    });

    if (found) throw new ConflictException();

    if (dto.cards.length < 4)
      throw new BadRequestException('Set must have at least 4 cards');

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
      where: { id: setId, createdBy: userId },
      relations: ['cards'],
    });

    if (cards) {
      if (cards.length < 4)
        throw new BadRequestException('Set must have at least 4 cards');

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
    const found = await SetEntity.findOneByOrFail({
      id: setId,
      createdBy: userId,
    });

    return await SetEntity.remove(found);
  }

  async getProgress(setId: number, userId: number) {
    const [user, set] = await Promise.all([
      UserEntity.findOneByOrFail({ id: userId }),
      SetEntity.findOneOrFail({ where: { id: setId }, relations: ['cards'] }),
    ]);

    const found = await ProgressEntity.findBy({
      user: { id: userId },
      set: { id: setId },
    });

    if (found) {
      return plainToInstance(GetProgressResponseDto, {
        set,
        metadata: this.getProgressMetadata(found),
      } satisfies GetProgressResponseDto);
    }

    const newProgresses = set.cards.map((card) => {
      return new ProgressEntity({ user, set, card, createdBy: user.id });
    });

    await ProgressEntity.save(newProgresses);

    return plainToInstance(GetProgressResponseDto, {
      set,
      metadata: this.getProgressMetadata(newProgresses),
    } satisfies GetProgressResponseDto);
  }

  private getProgressMetadata(progresses: ProgressEntity[]) {
    const metadata = {
      totalCards: progresses.length,
      notStudiedCount: 0,
      learningCount: 0,
      knowCount: 0,
    } satisfies ProgressMetadataDto;

    progresses.forEach((p) => {
      if (!p.correctCount) {
        metadata.notStudiedCount += 1;
      } else if (p.correctCount >= 2) {
        metadata.knowCount += 1;
      } else {
        metadata.learningCount += 1;
      }
    });

    return plainToInstance(ProgressMetadataDto, metadata);
  }
}
