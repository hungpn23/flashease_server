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
import { SetEntity } from './entities/set.entity';
import { CardDto, CreateSetDto, FindOneSetDto, UpdateSetDto } from './set.dto';
import { SetService } from './set.service';

@Controller({ path: 'set', version: '1' })
export class SetController {
  constructor(private setService: SetService) {}

  /*
   * ===== PUBLIC ROUTES =====
   */
  @ApiEndpoint({
    type: SetEntity,
    summary: 'find all paginated sets',
    isPublic: true,
    isPaginated: true,
  })
  @Get('all')
  async findAll(@Query() query: OffsetPaginationQueryDto) {
    return await this.setService.findAll(query);
  }

  @ApiEndpoint({
    type: SetEntity,
    summary: 'find a set',
    isPublic: true,
  })
  @Get('public/:id')
  async findOnePublic(
    @Param('id', ParseIntPipe) setId: number,
    @Body() dto: FindOneSetDto,
  ) {
    return await this.setService.findOnePublic(setId, dto);
  }

  @ApiEndpoint({
    type: CardDto,
    summary: 'import cards',
    isPublic: true,
  })
  @Post('convert-from-text')
  convertFromText(@Body() body: { input: string }) {
    return this.setService.convertFromText(body.input);
  }
  /*
   * ===== END PUBLIC ROUTES =====
   */

  /*
   * ===== PROTECTED ROUTES =====
   */
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

  @ApiEndpoint({ type: SetEntity, summary: 'find my set by id' })
  @Get('private/:id')
  async findOnePrivate(
    @Param('id', ParseIntPipe) setId: number,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.setService.findOnePrivate(setId, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'update a set' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) setId: number,
    @Body() dto: UpdateSetDto,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return this.setService.update(setId, dto, userId);
  }

  @ApiEndpoint({ type: SetEntity, summary: 'remove a set' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) setId: number,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return this.setService.remove(setId, userId);
  }
  /*
   * ===== END PROTECTED ROUTES =====
   */
}
