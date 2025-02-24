import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { delay } from '@/utils/delay';
import paginate from '@/utils/offset-paginate';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindOptionsWhere, In } from 'typeorm';
import { ProgressEntity } from '../progress/entities/progress.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CardEntity } from './entities/card.entity';
import { SetEntity } from './entities/set.entity';
import { CreateSetDto, FindSetDetailDto, UpdateSetDto } from './set.dto';
import { VisibleTo } from './set.enum';

@Injectable()
export class SetService {
  async findPublicSets(query: OffsetPaginationQueryDto, userId: number) {
    await delay(500);
    const builder = SetEntity.createQueryBuilder('set');

    builder.leftJoinAndSelect('set.user', 'user');
    builder
      .where('set.createdBy != :userId', { userId })
      .andWhere('set.visibleTo IN (:...visibleTos)', {
        visibleTos: [VisibleTo.EVERYONE, VisibleTo.PEOPLE_WITH_A_PASSWORD],
      });

    return await paginate(builder, query);
  }

  async findPublicSetDetail(setId: number, userId: number) {
    return await this.findSetDetail(setId, userId, {
      visibleTo: In([VisibleTo.EVERYONE, VisibleTo.PEOPLE_WITH_A_PASSWORD]),
    });
  }

  async findMySet(query: OffsetPaginationQueryDto, userId: number) {
    await delay(500);
    const builder = SetEntity.createQueryBuilder('set');

    builder.leftJoinAndSelect('set.user', 'user');
    builder.where('set.createdBy = :userId', { userId });

    return await paginate(builder, query);
  }

  async findMySetDetail(setId: number, userId: number) {
    return await this.findSetDetail(setId, userId, {
      createdBy: userId,
    });
  }

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
      cards,
      user,
      createdBy: userId,
    });

    return await SetEntity.save(set);
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

  // ================================================= //
  // ================ PRIVATE METHODS ================ //
  // ================================================= //
  private async findSetDetail(
    setId: number,
    userId: number,
    options: FindOptionsWhere<SetEntity>,
  ) {
    const set = await SetEntity.findOneOrFail({
      where: {
        id: setId,
        ...options,
      },
      relations: ['cards'],
    });

    const progress = await ProgressEntity.findOneBy({
      set: { id: set.id },
      user: { id: userId },
    });

    const isLearning = !!progress;

    return plainToInstance(FindSetDetailDto, {
      set,
      isLearning,
    } satisfies FindSetDetailDto);
  }
}
