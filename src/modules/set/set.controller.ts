import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSetDto, UpdateSetDto } from './set.dto';
import { SetService } from './set.service';

@Controller({ path: 'set', version: '1' })
export class SetController {
  constructor(private setService: SetService) {}

  @ApiEndpoint({ type: CreateSetDto, summary: 'create a new set' })
  @Post()
  create(@Body() dto: CreateSetDto) {
    console.log('🚀 ~ SetController ~ create ~ CreateSetDto:', dto);

    return 'ok';
  }

  @Get()
  findAll() {
    return this.setService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.update(+id, updateSetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setService.remove(+id);
  }
}
