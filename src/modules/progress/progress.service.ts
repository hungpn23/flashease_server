import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
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
  ProgressDetailDto,
  ProgressMetadataDto,
  SaveAnswerDto,
  StartProgressDto,
} from './progress.dto';

@Injectable()
export class ProgressService {
  async startProgress(setId: string, userId: string, dto: StartProgressDto) {
    const [user, set] = await Promise.all([
      UserEntity.findOneByOrFail({ id: userId }),
      SetEntity.findOneOrFail({
        where: { id: setId },
        relations: ['cards'],
      }),
    ]);

    this.validate(set, userId, dto.password);

    if (set.cards.length < 4)
      throw new BadRequestException(
        'the set must have at least 4 cards to start progress',
      );

    const newProgress = new ProgressEntity({ user, set, createdBy: user.id });

    const newItems = newProgress.set.cards.map((card) => {
      return new ProgressItemEntity({ card, createdBy: user.id });
    });
    newProgress.items = newItems;

    return await ProgressEntity.save(newProgress);
  }

  async findProgressDetail(progressId: string) {
    const progress = await ProgressEntity.findOneOrFail({
      where: { id: progressId },
      relations: ['user', 'set', 'items.card'],
    });

    return plainToInstance(ProgressDetailDto, {
      progress,
      metadata: this.getProgressMetadata(progress.items),
    } satisfies ProgressDetailDto);
  }

  async saveAnswer(itemId: string, dto: SaveAnswerDto) {
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

  // ============================= //
  // ======== IMPLEMENTED ======== //
  // ============================= //
  async findMyProgress(query: OffsetPaginationQueryDto, userId: string) {
    const builder = ProgressEntity.createQueryBuilder('progress');

    builder.leftJoinAndSelect('progress.items', 'items');
    builder.leftJoinAndSelect('progress.set', 'set');
    builder.leftJoinAndSelect('progress.user', 'user');
    builder.where('progress.createdBy = :userId', { userId });

    const res = await paginate(builder, query);
    const formatted = res.data.map((progress, i) => {
      return plainToInstance(ProgressDetailDto, {
        progress,
        metadata: this.getProgressMetadata(progress.items),
      });
    });

    return new OffsetPaginatedDto<ProgressDetailDto>(formatted, res.metadata);
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

    return plainToInstance(
      ProgressMetadataDto,
      metadata satisfies ProgressMetadataDto,
    );
  }

  private validate(set: SetEntity, userId: string, password?: string) {
    if (set.visibleTo === VisibleTo.JUST_ME && set.createdBy !== userId) {
      throw new ForbiddenException();
    }

    if (
      set.createdBy !== userId &&
      set.visibleTo === VisibleTo.PEOPLE_WITH_A_PASSWORD &&
      set.visibleToPassword !== password
    ) {
      throw new BadRequestException('Incorrect password');
    }
  }
}
