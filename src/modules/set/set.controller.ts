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
  CreateSetDto,
  SaveAnswerDto,
  SetDetailDto,
  StartLearningDto,
  UpdateSetDto,
} from './dto/set.dto';
import { SetEntity } from './entities/set.entity';
import { SetService } from './set.service';

@Controller({ path: 'set', version: '1' })
export class SetController {
  constructor(private setService: SetService) {}

  @ApiEndpoint({ type: SetEntity, isPaginated: true })
  @Get('explore')
  async findManyPublic(
    @Query() query: OffsetPaginationQueryDto,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.findManyPublic(query, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Get('explore/:setId')
  async findOnePublic(
    @Param('setId') setId: string,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.findOnePublic(setId, userId);
  }

  @ApiEndpoint({ type: SetDetailDto, isPaginated: true })
  @Get('library')
  async findMany(
    @Query() query: OffsetPaginationQueryDto,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.findMany(query, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Get('library/:setId')
  async findOne(
    @Param('setId') setId: string,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.findOne(setId, userId);
  }

  @ApiEndpoint({ type: SetDetailDto })
  @Get('flashcard/:setId')
  async findOneAndMetadata(
    @Param('setId') setId: string,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.findOneAndMetadata(setId, userId);
  }

  @Post('/flashcard/save-answer/:cardId')
  async saveAnswer(
    @Param('cardId') cardId: string,
    @Payload() { userId }: JwtPayload,
    @Body() { isCorrect }: SaveAnswerDto,
  ) {
    return await this.setService.saveAnswer(cardId, userId, isCorrect);
  }

  @ApiEndpoint()
  @Post('/start-learning/:setId')
  async startLearning(
    @Param('setId') setId: string,
    @Payload() { userId }: JwtPayload,
    @Body() dto: StartLearningDto,
  ) {
    return await this.setService.startLearning(setId, userId, dto);
  }

  @ApiEndpoint({ type: SetEntity })
  @Post('/create-set')
  async create(@Payload() { userId }: JwtPayload, @Body() dto: CreateSetDto) {
    return await this.setService.create(userId, dto);
  }

  @ApiEndpoint({ type: SetEntity })
  @Patch('/edit-set/:setId')
  async update(
    @Param('setId') setId: string,
    @Body() dto: UpdateSetDto,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.update(setId, userId, dto);
  }

  @ApiEndpoint({ type: SetEntity })
  @Delete('/delete-set/:setId')
  async remove(
    @Param('setId') setId: string,
    @Payload() { userId }: JwtPayload,
  ) {
    return await this.setService.remove(setId, userId);
  }
}
