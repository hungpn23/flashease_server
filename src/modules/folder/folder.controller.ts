import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import { Payload } from '@/decorators/jwt-payload.decorator';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { JwtPayload } from '@/types/auth.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AddSetsDto,
  CreateFolderDto,
  RemoveSetsDto,
  UpdateFolderDto,
} from './folder.dto';
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
  create(@Body() dto: CreateFolderDto, @Payload() { userId }: JwtPayload) {
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
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.folderService.findAll(query, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'find a folder',
  })
  @Get(':id')
  findOne(@Param('id') folderId: string, @Payload() { userId }: JwtPayload) {
    return this.folderService.findOne(folderId, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'update a folder',
  })
  @Patch(':id')
  update(
    @Param('id') folderId: string,
    @Body() dto: UpdateFolderDto,
    @Payload() { userId }: JwtPayload,
  ) {
    return this.folderService.update(folderId, dto, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'remove a folder',
  })
  @Delete(':id')
  remove(@Param('id') folderId: string, @Payload() { userId }: JwtPayload) {
    return this.folderService.remove(folderId, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'add sets by ids',
  })
  @Post(':id/add-sets')
  async addSets(
    @Param('id') folderId: string,
    @Body() { setIds }: AddSetsDto,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.folderService.addSets(folderId, setIds, userId);
  }

  @ApiEndpoint({
    type: FolderEntity,
    summary: 'remove sets by ids',
  })
  @Post(':id/remove-sets')
  async removeSets(
    @Param('id') folderId: string,
    @Body() { setIds }: RemoveSetsDto,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.folderService.removeSets(folderId, setIds, userId);
  }
}
