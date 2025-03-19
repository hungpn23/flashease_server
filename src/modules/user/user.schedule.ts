import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import ms, { StringValue } from 'ms';
import { SessionEntity } from './entities/session.entity';

@Injectable()
export class UserSchedule {
  private readonly logger = new Logger(UserSchedule.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanSessions() {
    const sessions = await SessionEntity.find();
    if (!sessions.length) return;

    const sessionsToRemove = await Promise.all(
      sessions.map((session) => {
        const expiresInMs = ms(session.expiresIn as StringValue);
        if (Date.now() > session.createdAt.getTime() + expiresInMs)
          return session;
      }),
    );

    await SessionEntity.remove(sessionsToRemove);
    this.logger.log(`Removed ${sessionsToRemove.length} sessions`);
  }
}
