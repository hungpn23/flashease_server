import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import { JwtPayload } from '@/decorators/jwt-payload.decorator';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { JwtPayloadType } from '@/types/auth.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateFolderDto, UpdateFolderDto } from './folder.dto';
import { FolderEntity } from './folder.entity';
import { FolderService } from './folder.service';

@Controller({ path: 'folder', version: '1' })
export class FolderController {
  constructor(private folderService: FolderService) {}

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'create a new folder',
  })
  @Post()
  create(
    @Body() dto: CreateFolderDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return this.folderService.create(dto, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'find all paginated folders',
    isPaginated: true,
  })
  @Get()
  async findAll(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.folderService.findAll(query, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'find a folder',
  })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) folderId: number,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return this.folderService.findOne(folderId, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'update a folder',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) folderId: number,
    @Body() dto: UpdateFolderDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return this.folderService.update(folderId, dto, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'remove a folder',
  })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) folderId: number,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return this.folderService.remove(folderId, userId);
  }
}
