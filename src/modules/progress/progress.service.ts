import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { delay } from '@/utils/delay';
import paginate from '@/utils/offset-paginate';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SetEntity } from '../set/entities/set.entity';
import { VisibleTo } from '../set/set.enum';
import { UserEntity } from '../user/entities/user.entity';
import { ProgressItemEntity } from './entities/progress-item.entity';
import { ProgressEntity } from './entities/progress.entity';
import {
  FindMyProgressDto,
  FindProgressDetailDto,
  FindProgressDetailResDto,
  ProgressMetadataDto,
  SaveAnswerDto,
  StartProgressDto,
} from './progress.dto';

@Injectable()
export class ProgressService {
  async startProgress(setId: number, userId: number, dto: StartProgressDto) {
    const [user, set] = await Promise.all([
      UserEntity.findOneByOrFail({ id: userId }),
      SetEntity.findOneOrFail({
        where: { id: setId },
        relations: ['cards'],
      }),
    ]);

    switch (set.visibleTo) {
      case VisibleTo.JUST_ME:
        if (set.createdBy !== userId) return false;
      case VisibleTo.PEOPLE_WITH_A_PASSWORD:
        if (set.visibleToPassword !== dto.visibleToPassword) return false;
    }

    if (set.visibleTo === VisibleTo.JUST_ME && set.createdBy !== userId) {
      return false;
    }

    if (
      set.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD &&
      set.visibleToPassword !== dto.visibleToPassword
    ) {
      return false;
    }

    if (set.cards.length < 4)
      throw new BadRequestException(
        'the set must have at least 4 cards to start progress',
      );

    const newProgress = await ProgressEntity.save(
      new ProgressEntity({ user, set, createdBy: user.id }),
    );

    const newItems = newProgress.set.cards.map((card) => {
      return new ProgressItemEntity({
        progress: newProgress,
        card,
        createdBy: user.id,
      });
    });

    await ProgressItemEntity.save(newItems);

    return true;
  }

  async findProgressDetail(
    progressId: number,
    userId: number,
    dto: FindProgressDetailDto,
  ) {
    const progress = await ProgressEntity.findOneOrFail({
      where: { id: progressId },
      relations: ['set', 'items'],
    });

    switch (progress.set.visibleTo) {
      case VisibleTo.JUST_ME:
        if (progress.set.createdBy !== userId) throw new ForbiddenException();
      case VisibleTo.PEOPLE_WITH_A_PASSWORD:
        if (progress.set.visibleToPassword !== dto.visibleToPassword)
          throw new ForbiddenException();
    }

    if (!progress.items.length) throw new BadRequestException();

    return plainToInstance(FindProgressDetailResDto, {
      set: progress.set,
      metadata: this.getProgressMetadata(progress.items),
    } satisfies FindProgressDetailResDto);
  }

  async saveAnswer(itemId: number, dto: SaveAnswerDto) {
    const item = await ProgressItemEntity.findOneOrFail({
      where: { id: itemId },
      relations: { progress: true },
    });

    if (dto.isCorrect) {
      item.correctCount = item.correctCount ? item.correctCount + 1 : 1;
    } else {
      item.correctCount = item.correctCount || 0;
    }

    await ProgressItemEntity.save(item);

    const items = await ProgressItemEntity.findBy({
      progress: { id: item.progress.id },
    });

    return this.getProgressMetadata(items);
  }

  async findMyProgress(query: OffsetPaginationQueryDto, userId: number) {
    await delay(2000);
    const builder = ProgressEntity.createQueryBuilder('progress');

    builder.leftJoinAndSelect('progress.items', 'items');
    builder.leftJoinAndSelect('progress.set', 'set');
    builder.leftJoinAndSelect('progress.user', 'user');
    builder.where('progress.createdBy = :userId', { userId });

    const res = await paginate(builder, query);
    const formatted = res.data.map((p) => {
      return plainToInstance(FindMyProgressDto, {
        name: p.set.name,
        description: p.set.description,
        username: p.user.username,
        createdAt: p.createdAt,
        metadata: this.getProgressMetadata(p.items),
      } satisfies FindMyProgressDto);
    });

    return new OffsetPaginatedDto<FindMyProgressDto>(formatted, res.metadata);
  }

  private getProgressMetadata(items: ProgressItemEntity[]) {
    const metadata: ProgressMetadataDto = {
      totalCards: items.length,
      notStudiedCount: 0,
      learningCount: 0,
      knownCount: 0,
    };

    items.forEach((p) => {
      if (p.correctCount === null) {
        metadata.notStudiedCount += 1;
      } else if (p.correctCount >= 2) {
        metadata.knownCount += 1;
      } else {
        metadata.learningCount += 1;
      }
    });

    return plainToInstance(ProgressMetadataDto, metadata);
  }
}
