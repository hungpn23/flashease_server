import { OffsetMetadataDto } from '@/dto/offset-pagination/metadata.dto';
import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SelectQueryBuilder } from 'typeorm';
import { CreateFolderDto, UpdateFolderDto } from './folder.dto';
import { FolderEntity } from './folder.entity';
import { FolderService } from './folder.service';

jest.mock('@/utils/offset-paginate');

describe('FolderService', () => {
  let service: FolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderService],
    }).compile();

    service = module.get<FolderService>(FolderService);
  });

  describe('create', () => {
    it('should create a new folder', async () => {
      const createFolderDto: CreateFolderDto = {
        name: 'New Folder',
        description: 'Description',
      };
      const userId = 1;

      jest.spyOn(FolderEntity, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(FolderEntity, 'save').mockResolvedValue({
        id: 1,
        ...createFolderDto,
        createdBy: userId,
      } as FolderEntity);

      const result = await service.create(createFolderDto, userId);
      expect(result).toEqual({
        id: 1,
        ...createFolderDto,
        createdBy: userId,
      });
    });

    it('should throw ConflictException if folder with the same name already exists', async () => {
      const createFolderDto: CreateFolderDto = {
        name: 'Existing Folder',
        description: 'Description',
      };
      const userId = 1;

      jest.spyOn(FolderEntity, 'findOneBy').mockResolvedValue({
        id: 1,
        ...createFolderDto,
        createdBy: userId,
      } as FolderEntity);

      await expect(service.create(createFolderDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated folders', async () => {
      const query = new OffsetPaginationQueryDto();
      const folders = [
        { id: 1, name: 'Folder 1' },
        { id: 2, name: 'Folder 2' },
      ];
      const metadata = new OffsetMetadataDto(folders.length, query);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([folders, folders.length]),
      } as unknown as SelectQueryBuilder<FolderEntity>;

      jest
        .spyOn(FolderEntity, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      (paginate as jest.Mock).mockResolvedValue({
        entities: folders,
        metadata,
      });

      const result = await service.findAll(query, 1);
      expect(result).toEqual(new OffsetPaginatedDto(folders, metadata));
    });
  });

  describe('findOne', () => {
    it('should return a folder by id', async () => {
      const folderId = 1;
      const userId = 1;
      const folder = {
        id: folderId,
        name: 'Folder 1',
        createdBy: userId,
      } as FolderEntity;

      jest.spyOn(FolderEntity, 'findOneOrFail').mockResolvedValue(folder);

      const result = await service.findOne(folderId, userId);
      expect(result).toEqual(folder);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      const folderId = 1;
      const userId = 2;
      const folder = {
        id: folderId,
        name: 'Folder 1',
        createdBy: 1,
      } as FolderEntity;

      jest.spyOn(FolderEntity, 'findOneOrFail').mockResolvedValue(folder);

      await expect(service.findOne(folderId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a folder', async () => {
      const folderId = 1;
      const userId = 1;
      const updateFolderDto: UpdateFolderDto = {
        name: 'Updated Folder',
        description: 'Updated Description',
      };

      jest.spyOn(FolderEntity, 'findOneOrFail').mockResolvedValue({
        id: folderId,
        createdBy: userId,
      } as FolderEntity);

      jest.spyOn(FolderEntity, 'save').mockResolvedValue({
        id: folderId,
        ...updateFolderDto,
        updatedBy: userId,
      } as FolderEntity);

      const result = await service.update(folderId, updateFolderDto, userId);
      expect(result).toEqual({
        id: folderId,
        ...updateFolderDto,
        updatedBy: userId,
      });
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      const folderId = 1;
      const userId = 2;
      const updateFolderDto: UpdateFolderDto = {
        name: 'Updated Folder',
        description: 'Updated Description',
      };

      jest.spyOn(FolderEntity, 'findOneOrFail').mockResolvedValue({
        id: folderId,
        createdBy: 1,
      } as FolderEntity);

      await expect(
        service.update(folderId, updateFolderDto, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a folder', async () => {
      const folderId = 1;
      const userId = 1;
      const folder = { id: folderId, createdBy: userId } as FolderEntity;

      jest.spyOn(FolderEntity, 'findOneOrFail').mockResolvedValue(folder);
      jest.spyOn(FolderEntity, 'remove').mockResolvedValue(folder);

      const result = await service.remove(folderId, userId);
      expect(result).toEqual(folder);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      const folderId = 1;
      const userId = 1;
      const folder = { id: folderId, createdBy: 2 } as FolderEntity;

      jest.spyOn(FolderEntity, 'findOneOrFail').mockResolvedValue(folder);

      await expect(service.remove(folderId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
