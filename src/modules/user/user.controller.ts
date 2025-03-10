import { Role } from '@/constants';
import { UseRole } from '@/decorators/auth/role.decorator';
import { ApiEndpoint, ApiFile } from '@/decorators/endpoint.decorator';
import { Payload } from '@/decorators/jwt-payload.decorator';
import { validateImagePipe } from '@/pipes/validate-file.pipe';
import { JwtPayload } from '@/types/auth.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto, UploadAvatarResponseDto } from './user.dto';
import { UserService } from './user.service';

@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private userService: UserService) {}

  @SkipThrottle()
  @ApiEndpoint({ type: UserEntity, summary: 'get user by id' })
  @Get()
  async getOne(@Payload() { userId }: JwtPayload): Promise<UserEntity> {
    return await this.userService.findOne(userId);
  }

  @UseRole(Role.ADMIN)
  @ApiEndpoint({ type: UserEntity, summary: 'get all users' })
  @Get('all')
  async getAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  @ApiEndpoint({
    type: UserEntity,
    summary: 'update user profile, return updated profile',
  })
  @Patch()
  async updateProfile(
    @Payload() { userId }: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    return await this.userService.update(userId, dto);
  }

  @ApiFile('avatar')
  @ApiEndpoint({
    type: UploadAvatarResponseDto,
    summary: 'upload new user avatar',
  })
  @Post('upload-avatar')
  async uploadAvatar(
    @UploadedFile(validateImagePipe())
    file: Express.Multer.File,
    @Payload() { userId }: JwtPayload,
  ): Promise<UploadAvatarResponseDto> {
    return await this.userService.uploadAvatar(userId, file);
  }

  @ApiEndpoint({ summary: 'delete user avatar' })
  @Delete('delete-avatar')
  async deleteAvatar(@Payload() { userId }: JwtPayload): Promise<void> {
    await this.userService.deleteAvatar(userId);
  }
}
