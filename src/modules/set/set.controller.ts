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
import {
  GetProgressDto,
  GetProgressResDto,
  ProgressMetadataDto,
  SaveAnswerDto,
} from './dtos/progress.dto';
import { CreateSetDto, UpdateSetDto } from './dtos/set.dto';
import { SetEntity } from './entities/set.entity';
import { SetService } from './set.service';

@Controller({ path: 'set', version: '1' })
export class SetController {
  constructor(private setService: SetService) {}

  @ApiEndpoint({ type: SetEntity, summary: 'create a new set' })
  @Post()
  async create(
    @Body() dto: CreateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.create(dto, userId);
  }

  @ApiEndpoint({
    type: SetEntity,
    summary: 'find all paginated sets',
    isPaginated: true,
  })
  @Get('all')
  async findAll(@Query() query: OffsetPaginationQueryDto) {
    return await this.setService.findAll(query);
  }

  @ApiEndpoint({
    type: SetEntity,
    summary: 'find my sets',
    isPaginated: true,
  })
  @Get()
  async findMySets(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findMySets(query, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'update a set' })
  @Patch(':setId')
  async update(
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.update(setId, dto, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'remove a set' })
  @Delete(':setId')
  async remove(
    @Param('setId', ParseIntPipe) setId: number,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.remove(setId, userId);
  }

  @ApiEndpoint({
    type: GetProgressResDto,
    summary: "get a set's progresses",
  })
  @Get(':setId')
  async getProgress(
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: GetProgressDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.getProgress(setId, dto, userId);
  }

  @ApiEndpoint({
    type: ProgressMetadataDto,
    summary: 'save an answer',
  })
  @Post('save-answer/:progressId')
  async saveAnswer(
    @Param('progressId', ParseIntPipe) progressId: number,
    @Body() dto: SaveAnswerDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.saveAnswer(progressId, dto, userId);
  }
}
