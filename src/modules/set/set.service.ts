import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CardEntity } from './entities/card.entity';
import { SetEntity } from './entities/set.entity';
import { CreateSetDto, FindOneSetDto, UpdateSetDto } from './set.dto';
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

  async findOnePublic(setId: number, dto: FindOneSetDto) {
    const found = await SetEntity.findOneOrFail({
      where: { id: setId },
      relations: ['cards'],
    });

    switch (found.visibleTo) {
      case VisibleTo.EVERYONE:
        return found;
      case VisibleTo.PEOPLE_WITH_A_PASSWORD:
        if (dto.visibleToPassword === found.visibleToPassword) return found;
        throw new BadRequestException('invalid password');
    }
  }

  async findOnePrivate(setId: number, userId: number) {
    const found = await SetEntity.findOneOrFail({
      where: { id: setId },
      relations: ['cards'],
    });

    if (found.createdBy !== userId) throw new ForbiddenException();

    return found;
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
}
