import paginate from '@/dto/offset-pagination/offset-paginate';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import { UUID } from '@/types/branded.type';
import { ConflictException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { SetEntity } from '../set/entities/set.entity';
import { CreateFolderDto, UpdateFolderDto } from './folder.dto';
import { FolderEntity } from './folder.entity';

@Injectable()
export class FolderService {
  async create(dto: CreateFolderDto, userId: UUID) {
    const found = await FolderEntity.findOneBy({ name: dto.name });
    if (found) throw new ConflictException();

    return await FolderEntity.save(
      new FolderEntity({ ...dto, createdBy: userId }),
    );
  }

  async findAll(query: OffsetPaginationQueryDto, userId: UUID) {
    const builder = FolderEntity.createQueryBuilder('folder');

    builder.where('folder.createdBy = :userId', { userId });

    return await paginate(builder, query);
  }

  async findOne(folderId: UUID, userId: UUID) {
    return await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });
  }

  async update(folderId: UUID, dto: UpdateFolderDto, userId: UUID) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });

    return await FolderEntity.save(
      Object.assign(found, {
        ...dto,
        updatedBy: userId,
      } as FolderEntity),
    );
  }

  async remove(folderId: UUID, userId: UUID) {
    const found = await FolderEntity.findOneByOrFail({
      id: folderId,
      createdBy: userId,
    });

    return await FolderEntity.remove(found);
  }

  async addSets(folderId: UUID, setIds: string[], userId: UUID) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });

    const sets = await SetEntity.findBy({ id: In(setIds), createdBy: userId });
    found.sets = found.sets.concat(sets);

    return await FolderEntity.save(found);
  }

  async removeSets(folderId: UUID, setIds: string[], userId: UUID) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });

    found.sets = found.sets.filter((set) => !setIds.includes(set.id));

    return await FolderEntity.save(found);
  }
}
