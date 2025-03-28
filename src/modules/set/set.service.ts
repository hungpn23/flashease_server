import paginate from '@/dto/offset-pagination/offset-paginate';
import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { UUID } from '@/types/branded.type';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { In, Not } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import {
  CreateSetDto,
  SetDetailDto,
  SetMetadataDto,
  StartLearningDto,
  UpdateSetDto,
} from './dto/set.dto';
import { CardEntity } from './entities/card.entity';
import { SetEntity } from './entities/set.entity';
import { VisibleTo } from './set.enum';

@Injectable()
export class SetService {
  async findManyPublic(query: OffsetPaginationQueryDto, userId: UUID) {
    const builder = SetEntity.createQueryBuilder('set')
      .leftJoin('set.cards', 'cards')
      .leftJoin('set.author', 'author')
      .where('set.createdBy != :userId', { userId })
      .andWhere('set.visibleTo IN (:...visibleTos)', {
        visibleTos: [VisibleTo.EVERYONE, VisibleTo.PEOPLE_WITH_A_PASSCODE],
      })
      .select(['set', 'cards', 'author']);

    return await paginate(builder, query);
  }

  async findOnePublic(setId: UUID, userId: UUID) {
    return await SetEntity.findOneOrFail({
      where: {
        id: setId,
        visibleTo: In([VisibleTo.EVERYONE, VisibleTo.PEOPLE_WITH_A_PASSCODE]),
        user: { id: Not(userId) },
      },
      relations: ['cards', 'author'],
    });
  }

  async findMany(query: OffsetPaginationQueryDto, userId: UUID) {
    const builder = SetEntity.createQueryBuilder('set')
      .leftJoin('set.author', 'author')
      .leftJoin('set.cards', 'cards')
      .where('set.createdBy = :userId', { userId })
      .select(['set', 'cards', 'author']);

    const { data, metadata } = await paginate(builder, query);
    const formatted = data.map((set) => {
      return plainToInstance(SetDetailDto, {
        set,
        metadata: this.getSetMetadata(set.cards),
      });
    });

    return plainToInstance(OffsetPaginatedDto, { data: formatted, metadata });
  }

  async findOne(setId: UUID, userId: UUID) {
    const set = await SetEntity.findOneOrFail({
      where: {
        id: setId,
        createdBy: userId,
      },
      relations: ['cards', 'author'],
    });

    return set;
  }

  async findOneAndMetadata(setId: UUID, userId: UUID) {
    const set = await SetEntity.findOneOrFail({
      where: {
        id: setId,
        createdBy: userId,
      },
      relations: ['cards', 'author'],
    });

    return plainToInstance(SetDetailDto, {
      set,
      metadata: this.getSetMetadata(set.cards),
    });
  }

  async saveAnswer(cardId: UUID, userId: UUID, isCorrect: boolean) {
    const card = await CardEntity.findOneOrFail({
      where: { id: cardId, createdBy: userId },
      relations: ['set'],
    });

    card.correctCount = card.correctCount ?? 0;
    card.correctCount = isCorrect
      ? card.correctCount + 1
      : Math.max(0, card.correctCount - 1);

    await CardEntity.save(card);
  }

  async resetFlashcard(setId: UUID, userId: UUID) {
    const cards = await CardEntity.find({
      where: { set: { id: setId }, createdBy: userId },
    });

    cards.forEach((card) => {
      card.correctCount = null;
    });

    await CardEntity.save(cards);
  }

  async startLearning(setId: UUID, userId: UUID, dto: StartLearningDto) {
    const [user, set] = await Promise.all([
      UserEntity.findOneByOrFail({ id: userId }),
      SetEntity.findOneOrFail({
        where: { id: setId },
        relations: ['cards', 'author'],
      }),
    ]);

    if (
      set.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSCODE &&
      dto.passcode !== set.passcode
    ) {
      throw new BadRequestException('Invalid passcode!!!');
    }

    const newCards = set.cards.map(
      ({ term, definition }) =>
        new CardEntity({ term, definition, createdBy: userId }),
    );

    const newSet = await SetEntity.save(
      new SetEntity({
        name: set.name,
        description: set.description,
        author: set.author,
        visibleTo: VisibleTo.JUST_ME,
        cards: newCards,
        user,
        createdBy: userId,
      }),
    );

    return await SetEntity.findOne({
      where: { id: newSet.id },
      relations: ['cards'],
    });
  }

  async create(userId: UUID, dto: CreateSetDto) {
    const [found, user] = await Promise.all([
      SetEntity.findOneBy({
        name: dto.name,
        createdBy: userId,
      }),
      UserEntity.findOneByOrFail({ id: userId }),
    ]);

    if (found) throw new ConflictException('Set with this name already exists');
    if (dto.cards.length < 4)
      throw new BadRequestException('Minimum 4 cards required');

    let passcode = undefined;
    if (dto.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSCODE) {
      passcode = dto.passcode;
    }

    const cards = dto.cards.map((card) => {
      return new CardEntity({ ...card, createdBy: userId });
    });

    const set = new SetEntity({
      ...dto,
      author: user,
      passcode,
      cards,
      user,
      createdBy: userId,
    });

    return await SetEntity.save(set);
  }

  async update(
    setId: UUID,
    userId: UUID,
    { cards, passcode, ...rest }: UpdateSetDto,
  ) {
    const set = await SetEntity.findOneOrFail({
      where: { id: setId, createdBy: userId },
      relations: ['cards'],
    });

    switch (rest.visibleTo) {
      case VisibleTo.EVERYONE:
      case VisibleTo.JUST_ME:
        set.passcode = null;
        break;
      case VisibleTo.PEOPLE_WITH_A_PASSCODE:
        set.passcode = passcode;
        break;
    }

    const cardMap = new Map(set.cards.map((card) => [String(card.id), card]));
    const newCards: CardEntity[] = [];

    for (const { id, term, definition } of cards) {
      if (id) {
        const card = cardMap.get(id);
        if (card.term !== term || card.definition !== definition) {
          card.term = term;
          card.definition = definition;
          card.correctCount = null;
        }

        newCards.push(card);
      } else {
        const newCard = new CardEntity({
          term: term,
          definition: definition,
          createdBy: userId,
        });

        newCards.push(newCard);
      }
    }

    if (set.cards && set.cards.length > 0) {
      await CardEntity.delete({ set: { id: setId } });
    }

    const updated = await SetEntity.save(
      Object.assign(set, {
        ...rest,
        cards: newCards,
        passcode: set.passcode,
        updatedBy: userId,
      } as SetEntity),
    );

    return await SetEntity.findOne({
      where: { id: updated.id },
      relations: ['cards'],
    });
  }

  async remove(setId: UUID, userId: UUID) {
    const found = await SetEntity.findOneByOrFail({
      id: setId,
      createdBy: userId,
    });

    return await SetEntity.remove(found);
  }

  private getSetMetadata(cards: CardEntity[]) {
    const metadata: SetMetadataDto = {
      totalCards: cards.length,
      notStudiedCount: 0,
      learningCount: 0,
      knownCount: 0,
    };

    cards.forEach((p) => {
      if (p.correctCount === null) {
        metadata.notStudiedCount += 1;
      } else if (p.correctCount >= 2) {
        metadata.knownCount += 1;
      } else {
        metadata.learningCount += 1;
      }
    });

    return plainToInstance(SetMetadataDto, metadata);
  }
}
