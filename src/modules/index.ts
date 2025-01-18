import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FolderModule } from './folder/folder.module';
import { SetModule } from './set/set.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, AuthModule, SetModule, FolderModule],
})
export class Modules {}
