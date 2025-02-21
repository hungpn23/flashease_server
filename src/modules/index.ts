import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { FolderModule } from './folder/folder.module';
import { ProgressModule } from './progress/progress.module';
import { SetModule } from './set/set.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    SetModule,
    FolderModule,
    CoreModule,
    ProgressModule,
  ],
})
export class Modules {}
