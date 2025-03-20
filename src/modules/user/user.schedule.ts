import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { SessionEntity } from './entities/session.entity';

@Injectable()
export class UserSchedule {
  private readonly logger = new Logger(UserSchedule.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanSessions() {
    const now = new Date();
    const found = await SessionEntity.findBy({ expiresAt: LessThan(now) });
    if (found) {
      await SessionEntity.remove(found);
      this.logger.log('Cleaned expired sessions');
    }
  }
}
