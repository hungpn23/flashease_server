import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';
import { SetEntity } from '../set/entities/set.entity';
import { UserEntity } from '../user/entities/user.entity';
import { FindPracticeResponseDto, PracticeMetadata } from './core.dto';
import { PracticeEntity } from './entities/practice.entity';
import { ProgressEntity } from './entities/progress.entity';

@Injectable()
export class CoreService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPractice(setId: number, userId: number) {
    return await this.dataSource.transaction(async (manager) => {
      const practice = await manager.findOne(PracticeEntity, {
        where: { user: { id: userId }, set: { id: setId } },
        relations: ['progresses'],
      });

      if (practice) {
        return plainToInstance(FindPracticeResponseDto, {
          set: practice.set,
          metadata: this.getPracticeMetadata(practice.progresses),
        } satisfies FindPracticeResponseDto);
      }

      const [user, set] = await Promise.all([
        manager.findOneOrFail(UserEntity, {
          where: { id: userId },
        }),
        manager.findOneOrFail(SetEntity, {
          where: { id: setId },
          relations: ['cards'],
        }),
      ]);

      const newPractice = manager.create(PracticeEntity, { user, set });

      const progresses = set.cards.map((card) =>
        manager.create(ProgressEntity, {
          practice: newPractice,
          card,
        } as ProgressEntity),
      );

      await Promise.all([manager.save(newPractice), manager.save(progresses)]);

      return plainToInstance(FindPracticeResponseDto, {
        set,
        metadata: this.getPracticeMetadata(progresses),
      } satisfies FindPracticeResponseDto);
    });
  }

  private getPracticeMetadata(progresses: ProgressEntity[]) {
    const metadata = {
      totalCards: progresses.length,
      notStudiedCount: 0,
      learningCount: 0,
      knowCount: 0,
    } as PracticeMetadata;

    progresses.forEach((p) => {
      if (!p.correctCount) {
        metadata.notStudiedCount += 1;
      } else if (p.correctCount >= 2) {
        metadata.knowCount += 1;
      } else {
        metadata.learningCount += 1;
      }
    });

    return metadata;
  }
}
