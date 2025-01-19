import {
  NumberValidators,
  StringValidators,
} from '@/decorators/properties.decorator';
import { PartialType } from '@nestjs/swagger';

export class CreateFolderDto {
  @StringValidators()
  name: string;

  @StringValidators({ required: false })
  description?: string;
}

export class UpdateFolderDto extends PartialType(CreateFolderDto) {}

export class AddSetsDto {
  @NumberValidators({ isArray: true })
  setIds: number[];
}

export class RemoveSetsDto extends AddSetsDto {}
