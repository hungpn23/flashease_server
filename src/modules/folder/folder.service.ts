import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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

    if (query.search) {
      const search = query.search.trim();
      builder
        .where('folder.name LIKE :name', { name: `%${search}%` })
        .orWhere('folder.description LIKE :description', {
          description: `%${search}%`,
        });
    }

    const { entities, metadata } = await paginate<FolderEntity>(builder, query);

    return new OffsetPaginatedDto<FolderEntity>(entities, metadata);
  }

  async findOne(folderId: number, userId: number) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId },
      relations: ['sets'],
    });

    if (found.createdBy !== userId) throw new ForbiddenException();

    return found;
  }

  async update(folderId: number, dto: UpdateFolderDto, userId: number) {
    const found = await FolderEntity.findOneOrFail({
      where: { id: folderId },
      relations: ['sets'],
    });

    if (found.createdBy !== userId) throw new ForbiddenException();

    return await FolderEntity.save(
      Object.assign(found, {
        ...dto,
        updatedBy: userId,
      } as FolderEntity),
    );
  }

  async remove(folderId: number, userId: number) {
    const found = await FolderEntity.findOneOrFail({ where: { id: folderId } });

    if (found.createdBy !== userId) throw new ForbiddenException();

    return await FolderEntity.remove(found);
  }

  async addSets(folderId: number, setIds: number[], userId: number) {
    const folder = await FolderEntity.findOneOrFail({
      where: { id: folderId },
      relations: ['sets'],
    });

    if (folder.createdBy !== userId) throw new ForbiddenException();

    const sets = await SetEntity.findBy({ id: In(setIds), createdBy: userId });
    folder.sets = folder.sets.concat(sets);

    return await FolderEntity.save(folder);
  }

  async removeSets(folderId: number, setIds: number[], userId: number) {
    const folder = await FolderEntity.findOneOrFail({
      where: { id: folderId },
      relations: ['sets'],
    });

    if (folder.createdBy !== userId) throw new ForbiddenException();

    folder.sets = folder.sets.filter((set) => !setIds.includes(set.id));

    return await FolderEntity.save(folder);
  }
}
