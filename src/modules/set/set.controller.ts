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

  @ApiEndpoint({ type: SetEntity, isPaginated: true })
  @Get('explore')
  async findManyPublic(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findManyPublic(query, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Get('explore/:setId')
  async findOnePublic(
    @Param('setId') setId: string,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findOnePublic(setId, userId);
  }

  @ApiEndpoint({ type: SetDetailDto, isPaginated: true })
  @Get('library')
  async findMany(
    @Query() query: OffsetPaginationQueryDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findMany(query, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Get('library/:setId')
  async findOne(
    @Param('setId') setId: string,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findOne(setId, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Post('/create-set')
  async create(
    @Body() dto: CreateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.create(dto, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Patch('/edit-set/:setId')
  async update(
    @Param('setId') setId: string,
    @Body() dto: UpdateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.update(setId, dto, userId);
  }

  @ApiEndpoint({ type: SetEntity })
  @Delete(':setId')
  async remove(
    @Param('setId') setId: string,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.remove(setId, userId);
  }
}
