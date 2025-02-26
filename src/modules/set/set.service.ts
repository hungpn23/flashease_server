import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
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
  async findPublicSets(query: OffsetPaginationQueryDto, userId: string) {
    const builder = SetEntity.createQueryBuilder('set');

    builder.leftJoinAndSelect('set.user', 'user');
    builder
      .where('set.createdBy != :userId', { userId })
      .andWhere('set.visibleTo IN (:...visibleTos)', {
        visibleTos: [VisibleTo.EVERYONE, VisibleTo.PEOPLE_WITH_A_PASSWORD],
      });

    return await paginate(builder, query);
  }

  async findPublicSetDetail(setId: string, userId: string) {
    return await this.findSetDetail(setId, userId, {
      visibleTo: In([VisibleTo.EVERYONE, VisibleTo.PEOPLE_WITH_A_PASSWORD]),
    });
  }

  async findMySet(query: OffsetPaginationQueryDto, userId: string) {
    const builder = SetEntity.createQueryBuilder('set');

    builder.leftJoinAndSelect('set.user', 'user');
    builder.where('set.createdBy = :userId', { userId });

    return await paginate(builder, query);
  }

  async findMySetDetail(setId: string, userId: string) {
    return await this.findSetDetail(setId, userId, {
      createdBy: userId,
    });
  }

  async create(dto: CreateSetDto, userId: string) {
    const [found, user] = await Promise.all([
      SetEntity.findOneBy({
        name: dto.name,
        createdBy: userId,
      }),
      UserEntity.findOneByOrFail({ id: userId }),
    ]);

    if (found) throw new ConflictException();

    if (dto.cards.length < 4)
      throw new BadRequestException('Minimum 4 cards required');

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

  async update(setId: string, dto: UpdateSetDto, userId: string) {
    const set = await SetEntity.findOneOrFail({
      where: { id: setId, createdBy: userId },
    });

    // if (cards) {
    //   if (cards.length < 4)
    //     throw new BadRequestException('Minimum 4 cards required');

    //   console.log('🚀 ~ SetService ~ update ~ cards:', cards);
    //   await delay(300000);
    //   await CardEntity.remove(set.cards); // ! ERROR: khi update set cards, thì lại xoá hết progress items
    //   set.cards = cards.map((card) => {
    //     return new CardEntity({ ...card, createdBy: userId });
    //   });
    // }

    return await SetEntity.save(
      Object.assign(set, {
        ...dto,
        updatedBy: userId,
      } as SetEntity),
    );
  }

  async remove(setId: string, userId: string) {
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
    setId: string,
    userId: string,
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

    return plainToInstance(FindSetDetailDto, {
      set,
      progress,
    } satisfies FindSetDetailDto);
  }
}
