import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import { JwtPayload } from '@/decorators/jwt-payload.decorator';
import { JwtPayloadType } from '@/types/auth.type';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  FindProgressDto,
  FindProgressResDto,
  ProgressMetadataDto,
  SaveAnswerDto,
  StartProgressDto,
} from './progress.dto';
import { ProgressService } from './progress.service';

@Controller({ path: 'progress', version: '1' })
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @ApiEndpoint({
    type: FindProgressResDto,
    summary: 'find progresses by saved_set id',
  })
  @Get(':savedSetId')
  async findProgress(
    @Param('savedSetId', ParseIntPipe) savedSetId: number,
    @JwtPayload() { userId }: JwtPayloadType,
    @Body() dto: FindProgressDto,
  ) {
    return await this.progressService.findProgress(savedSetId, userId, dto);
  }

  @ApiEndpoint({
    type: Boolean,
    summary: 'start a progress by set id',
  })
  @Post('/start-progress/:setId')
  async startProgress(
    @Param('setId', ParseIntPipe) setId: number,
    @JwtPayload() { userId }: JwtPayloadType,
    @Body() dto: StartProgressDto,
  ) {
    return await this.progressService.startProgress(setId, userId, dto);
  }

  @ApiEndpoint({
    type: ProgressMetadataDto,
    summary: 'save an answer',
  })
  @Post('save-answer/:progressId')
  async saveAnswer(
    @Param('progressId', ParseIntPipe) progressId: number,
    @Body() dto: SaveAnswerDto,
  ) {
    return await this.progressService.saveAnswer(progressId, dto);
  }
}
