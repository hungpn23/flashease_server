import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { SavedSetEntity } from '../set/entities/saved-set.entity';
import { SetEntity } from '../set/entities/set.entity';
import { VisibleTo } from '../set/set.enum';
import { UserEntity } from '../user/entities/user.entity';
import {
  FindProgressDto,
  FindProgressResDto,
  ProgressMetadataDto,
  SaveAnswerDto,
  StartProgressDto,
} from './progress.dto';
import { ProgressEntity } from './progress.entity';

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
        const isPasswordMatch = await argon2.verify(
          set.visibleToPassword,
          dto.visibleToPassword,
        );

        if (!isPasswordMatch) return false;
    }

    if (set.visibleTo === VisibleTo.JUST_ME && set.createdBy !== userId) {
      return false;
    }

    if (
      set.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD &&
      !(await argon2.verify(set.visibleToPassword, dto.visibleToPassword))
    ) {
      return false;
    }

    if (set.cards.length < 4)
      throw new BadRequestException(
        'the set must have at least 4 cards to start progress',
      );

    const newSavedSet = await SavedSetEntity.save(
      new SavedSetEntity({ user, set }),
    );

    const newProgresses = newSavedSet.set.cards.map((card) => {
      return new ProgressEntity({
        savedSet: newSavedSet,
        card,
        createdBy: user.id,
      });
    });

    await ProgressEntity.save(newProgresses);

    return true;
  }

  async findProgress(savedSetId: number, userId: number, dto: FindProgressDto) {
    const found = await SavedSetEntity.findOneOrFail({
      where: { id: savedSetId },
      relations: ['set'],
    });

    switch (found.set.visibleTo) {
      case VisibleTo.JUST_ME:
        if (found.set.createdBy !== userId) throw new ForbiddenException();
      case VisibleTo.PEOPLE_WITH_A_PASSWORD:
        const isPasswordMatch = await argon2.verify(
          found.set.visibleToPassword,
          dto.visibleToPassword,
        );

        if (!isPasswordMatch) throw new ForbiddenException();
    }

    const progresses = await ProgressEntity.findBy({
      savedSet: found,
    });

    if (!progresses.length) throw new BadRequestException();

    return plainToInstance(FindProgressResDto, {
      set: found.set,
      metadata: this.getProgressMetadata(progresses),
    } satisfies FindProgressResDto);
  }

  async saveAnswer(progressId: number, dto: SaveAnswerDto) {
    const progress = await ProgressEntity.findOneOrFail({
      where: { id: progressId },
      relations: { savedSet: true },
    });

    if (dto.isCorrect) {
      progress.correctCount = progress.correctCount
        ? progress.correctCount + 1
        : 1;
    } else {
      progress.correctCount = progress.correctCount || 0;
    }

    await ProgressEntity.save(progress);

    const progresses = await ProgressEntity.findBy({
      savedSet: { id: progress.savedSet.id },
    });

    return this.getProgressMetadata(progresses);
  }

  async findUserProgresses() {}

  private getProgressMetadata(progresses: ProgressEntity[]) {
    const metadata: ProgressMetadataDto = {
      totalCards: progresses.length,
      notStudiedCount: 0,
      learningCount: 0,
      knowCount: 0,
    };

    progresses.forEach((p) => {
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
