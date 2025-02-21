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
  FindProgressDto,
  FindProgressResDto,
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
      new ProgressEntity({ user, set }),
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

  async findProgress(progressId: number, userId: number, dto: FindProgressDto) {
    const progress = await ProgressEntity.findOneOrFail({
      where: { id: progressId },
      relations: ['set'],
    });

    switch (progress.set.visibleTo) {
      case VisibleTo.JUST_ME:
        if (progress.set.createdBy !== userId) throw new ForbiddenException();
      case VisibleTo.PEOPLE_WITH_A_PASSWORD:
        if (progress.set.visibleToPassword !== dto.visibleToPassword)
          throw new ForbiddenException();
    }

    const progressItems = await ProgressItemEntity.findBy({ progress });

    if (!progressItems.length) throw new BadRequestException();

    return plainToInstance(FindProgressResDto, {
      set: progress.set,
      metadata: this.getProgressMetadata(progressItems),
    } satisfies FindProgressResDto);
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

  async findUserProgresses() {}

  private getProgressMetadata(items: ProgressItemEntity[]) {
    const metadata: ProgressMetadataDto = {
      totalCards: items.length,
      notStudiedCount: 0,
      learningCount: 0,
      knowCount: 0,
    };

    items.forEach((p) => {
      if (p.correctCount === null) {
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
