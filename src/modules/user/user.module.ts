import { Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { UserController } from './user.controller';
import { UserSchedule } from './user.schedule';
import { UserService } from './user.service';

@Module({
  imports: [AwsModule],
  controllers: [UserController],
  providers: [UserService, UserSchedule],
})
export class UserModule {}
