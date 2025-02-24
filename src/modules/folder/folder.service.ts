import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import { ConflictException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { SetEntity } from '../set/entities/set.entity';
import { CreateFolderDto, UpdateFolderDto } from './folder.dto';
import { FolderEntity } from './folder.entity';

@Injectable()
export class FolderService {
  async create(dto: CreateFolderDto, userId: number) {
    const found = await FolderEntity.findOneBy({ name: dto.name });
    if (found) throw new ConflictException();

    return await FolderEntity.save(
      new FolderEntity({ ...dto, createdBy: userId }),
    );
  }

  async findAll(query: OffsetPaginationQueryDto, userId: number) {
    const builder = FolderEntity.createQueryBuilder('folder');

    builder.where('folder.createdBy = :userId', { userId });

    return await paginate(builder, query);
  }

  async findOne(folderId: number, userId: number) {
    return await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });
  }

  async update(folderId: number, dto: UpdateFolderDto, userId: number) {
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

  async remove(folderId: number, userId: number) {
    const found = await FolderEntity.findOneByOrFail({
      id: folderId,
      createdBy: userId,
    });

    return await FolderEntity.remove(found);
  }

  async addSets(folderId: number, setIds: number[], userId: number) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });

    const sets = await SetEntity.findBy({ id: In(setIds), createdBy: userId });
    found.sets = found.sets.concat(sets);

    return await FolderEntity.save(found);
  }

  async removeSets(folderId: number, setIds: number[], userId: number) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId, createdBy: userId },
      relations: ['sets'],
    });

    found.sets = found.sets.filter((set) => !setIds.includes(set.id));

    return await FolderEntity.save(found);
  }
}
