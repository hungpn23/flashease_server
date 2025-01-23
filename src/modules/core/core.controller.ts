import { ApiEndpoint } from '@/decorators/endpoint.decorator';
import { JwtPayload } from '@/decorators/jwt-payload.decorator';
import { JwtPayloadType } from '@/types/auth.type';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FindPracticeResponseDto } from './core.dto';
import { CoreService } from './core.service';

@Controller({ path: 'core', version: '1' })
export class CoreController {
  constructor(private coreService: CoreService) {}

  @ApiEndpoint({
    type: FindPracticeResponseDto,
    summary: 'create new practice or return existing set data',
  })
  @Get(':id')
  async handleSetInteraction(
    @Param('id', ParseIntPipe) setId: number,
    @JwtPayload() { userId }: JwtPayloadType,
  ) {
    return await this.coreService.findPractice(setId, userId);
  }
}
