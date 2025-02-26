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
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SetEntity } from './entities/set.entity';
import { CreateSetDto, SetDetailDto, UpdateSetDto } from './set.dto';
import { SetService } from './set.service';

@Controller({ path: 'set', version: '1' })
export class SetController {
  constructor(private setService: SetService) {}

  @ApiEndpoint({
    type: SetEntity,
    summary: 'find public sets',
    isPaginated: true,
  })
  @Get('public')
  async findPublicSets(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findPublicSets(query, userId);
  }

  @ApiEndpoint({
    type: SetEntity,
    summary: 'find public set detail',
  })
  @Get('public/:setId')
  async findPublicSetDetail(@Param('setId') setId: string) {
    return await this.setService.findPublicSetDetail(setId);
  }

  @ApiEndpoint({
    type: SetDetailDto,
    summary: 'find my sets',
    isPaginated: true,
  })
  @Get('my-sets')
  async findMySets(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findMySets(query, userId);
  }

  @ApiEndpoint({
    type: SetEntity,
    summary: 'find my set detail',
  })
  @Get('my-set/:setId')
  async findMySetDetail(
    @Param('setId') setId: string,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findMySetDetail(setId, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'create a new set' })
  @Post()
  async create(
    @Body() dto: CreateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.create(dto, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'update a set' })
  @Patch(':setId')
  async update(
    @Param('setId') setId: string,
    @Body() dto: UpdateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.update(setId, dto, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'remove a set' })
  @Delete(':setId')
  async remove(
    @Param('setId') setId: string,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.remove(setId, userId);
  }
}
