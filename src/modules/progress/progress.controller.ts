import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import { JwtPayload } from '@/decorators/jwt-payload.decorator';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { JwtPayloadType } from '@/types/auth.type';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProgressEntity } from './entities/progress.entity';
import {
  ProgressDetailDto,
  ProgressMetadataDto,
  SaveAnswerDto,
  StartProgressDto,
} from './progress.dto';
import { ProgressService } from './progress.service';

@Controller({ path: 'progress', version: '1' })
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @ApiEndpoint({
    type: ProgressDetailDto,
    summary: 'find my progress',
    isPaginated: true,
  })
  @Get('/my-progress')
  async findMyProgress(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.progressService.findMyProgress(query, userId);
  }

  @ApiEndpoint({
    type: ProgressDetailDto,
    summary: 'find items by progress id',
  })
  @Get(':progressId')
  async findProgressDetail(@Param('progressId') progressId: string) {
    return await this.progressService.findProgressDetail(progressId);
  }

  @ApiEndpoint({ type: ProgressEntity, summary: 'start a progress by set id' })
  @Post('/start-progress/:setId')
  async startProgress(
    @Param('setId') setId: string,
    @JwtPayload() { userId }: JwtPayloadType,
    @Body() dto: StartProgressDto,
  ) {
    return await this.progressService.startProgress(setId, userId, dto);
  }

  @ApiEndpoint({
    type: ProgressMetadataDto,
    summary: 'save an answer',
  })
  @Post('save-answer/:itemId')
  async saveAnswer(
    @Param('itemId') itemId: string,
    @Body() dto: SaveAnswerDto,
  ) {
    return await this.progressService.saveAnswer(itemId, dto);
  }
}
