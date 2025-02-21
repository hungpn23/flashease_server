import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { delay } from '@/utils/delay';
import paginate from '@/utils/offset-paginate';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import argon2 from 'argon2';
import slugify from 'slugify';
import { UserEntity } from '../user/entities/user.entity';
import { CardEntity } from './entities/card.entity';
import { SetEntity } from './entities/set.entity';
import { CreateSetDto, UpdateSetDto } from './set.dto';
import { EditableBy, VisibleTo } from './set.enum';

@Injectable()
export class SetService {
  async create(dto: CreateSetDto, userId: number) {
    const [found, user] = await Promise.all([
      SetEntity.findOneBy({
        name: dto.name,
        createdBy: userId,
      }),
      UserEntity.findOneByOrFail({ id: userId }),
    ]);

    if (found) throw new ConflictException();

    if (dto.cards.length < 4)
      throw new BadRequestException('Set must have at least 4 cards');

    const cards = dto.cards.map((card) => {
      return new CardEntity({ ...card, createdBy: userId });
    });

    const set = new SetEntity({
      ...dto,
      author: user.username,
      cards,
      createdBy: userId,
    });

    if (
      dto.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD &&
      dto.visibleToPassword
    ) {
      set.visibleToPassword = await argon2.hash(dto.visibleToPassword);
    }

    if (
      dto.editableBy === EditableBy.PEOPLE_WITH_A_PASSWORD &&
      dto.editableByPassword
    ) {
      set.editableByPassword = await argon2.hash(dto.editableByPassword);
    }

    set.slug = slugify(set.name, { lower: true, strict: true });

    return await SetEntity.save(set);
  }

  async findPublicSets(query: OffsetPaginationQueryDto) {
    await delay(1000);
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
    await delay(1000);
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

    if (
      dto.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD &&
      dto.visibleToPassword
    ) {
      found.visibleToPassword = await argon2.hash(dto.visibleToPassword);
    }

    if (
      dto.editableBy === EditableBy.PEOPLE_WITH_A_PASSWORD &&
      dto.editableByPassword
    ) {
      found.editableByPassword = await argon2.hash(dto.editableByPassword);
    }

    if (cards) {
      if (cards.length < 4)
        throw new BadRequestException('Set must have at least 4 cards');

      await CardEntity.remove(found.cards);
      found.cards = cards.map((card) => {
        return new CardEntity({ ...card, createdBy: userId });
      });
    }

    found.slug = slugify(found.name, { lower: true, strict: true });

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
}
