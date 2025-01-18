import { OffsetMetadataDto } from '@/dto/offset-pagination/metadata.dto';
import { OffsetPaginatedDto } from '@/dto/offset-pagination/paginated.dto';
import { OffsetPaginationQueryDto } from '@/dto/offset-pagination/query.dto';
import paginate from '@/utils/offset-paginate';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SelectQueryBuilder } from 'typeorm';
import { CardEntity } from './entities/card.entity';
import { SetEntity } from './entities/set.entity';
import { CreateSetDto, UpdateSetDto } from './set.dto';
import { EditableBy, VisibleTo } from './set.enum';
import { SetService } from './set.service';

jest.mock('@/utils/offset-paginate');

describe('SetService', () => {
  let service: SetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetService],
    }).compile();

    service = module.get<SetService>(SetService);
  });

  describe('create', () => {
    it('should create a new set', async () => {
      const createSetDto: CreateSetDto = {
        name: 'New Set',
        description: 'Description',
        visibleTo: VisibleTo.JUST_ME,
        visibleToPassword: undefined,
        editableBy: EditableBy.JUST_ME,
        editableByPassword: undefined,
        cards: [{ term: 'term', definition: 'definition' }],
      };
      const userId = 1;

      jest.spyOn(SetEntity, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(SetEntity, 'save').mockResolvedValue({
        id: 1,
        ...createSetDto,
        createdBy: userId,
      } as SetEntity);

      const result = await service.create(createSetDto, userId);
      expect(result).toEqual({
        id: 1,
        ...createSetDto,
        createdBy: userId,
      });
    });

    it('should throw ConflictException if set with the same name already exists', async () => {
      const createSetDto: CreateSetDto = {
        name: 'Existing Set',
        description: 'Description',
        visibleTo: VisibleTo.JUST_ME,
        visibleToPassword: undefined,
        editableBy: EditableBy.JUST_ME,
        editableByPassword: undefined,
        cards: [{ term: 'term', definition: 'definition' }],
      };
      const userId = 1;

      jest.spyOn(SetEntity, 'findOneBy').mockResolvedValue({
        id: 1,
        ...createSetDto,
        createdBy: userId,
      } as SetEntity);

      await expect(service.create(createSetDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sets', async () => {
      const query = new OffsetPaginationQueryDto();
      const sets = [
        { id: 1, name: 'Set 1' },
        { id: 2, name: 'Set 2' },
      ];
      const metadata = new OffsetMetadataDto(sets.length, query);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([sets, sets.length]),
      } as unknown as SelectQueryBuilder<SetEntity>;

      jest
        .spyOn(SetEntity, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      (paginate as jest.Mock).mockResolvedValue({ entities: sets, metadata });

      const result = await service.findAll(query);
      expect(result).toEqual(new OffsetPaginatedDto(sets, metadata));
    });
  });

  describe('findMySets', () => {
    it('should return paginated sets created by the user', async () => {
      const query = new OffsetPaginationQueryDto();
      const userId = 1;
      const sets = [{ id: 1, name: 'Set 1', createdBy: userId }];
      const metadata = new OffsetMetadataDto(sets.length, query);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([sets, sets.length]),
      } as unknown as SelectQueryBuilder<SetEntity>;

      jest
        .spyOn(SetEntity, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      (paginate as jest.Mock).mockResolvedValue({ entities: sets, metadata });

      const result = await service.findMySets(query, userId);
      expect(result).toEqual(new OffsetPaginatedDto(sets, metadata));
    });
  });

  describe('findOnePublic', () => {
    it('should return the set when visibleTo is EVERYONE', async () => {
      const setId = 1;
      const dto = {};

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        visibleTo: VisibleTo.EVERYONE,
      } as SetEntity);

      const result = await service.findOnePublic(setId, dto);
      expect(result).toEqual({ id: setId, visibleTo: VisibleTo.EVERYONE });
    });

    it('should return the set when visibleTo is PEOPLE_WITH_A_PASSWORD and password is correct', async () => {
      const setId = 1;
      const dto = { visibleToPassword: 'correct_password' };

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
        visibleToPassword: 'correct_password',
      } as SetEntity);

      const result = await service.findOnePublic(setId, dto);
      expect(result).toEqual({
        id: setId,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
        visibleToPassword: 'correct_password',
      });
    });

    it('should throw BadRequestException when visibleTo is PEOPLE_WITH_A_PASSWORD and password is incorrect', async () => {
      const setId = 1;
      const dto = { visibleToPassword: 'wrong_password' };

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
        visibleToPassword: 'correct_password',
      } as SetEntity);

      await expect(service.findOnePublic(setId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOnePrivate', () => {
    it('should return the set when the user is the creator', async () => {
      const setId = 1;
      const userId = 1;

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        createdBy: userId,
        cards: [],
      } as SetEntity);

      const result = await service.findOnePrivate(setId, userId);
      expect(result).toEqual({
        id: setId,
        createdBy: userId,
        cards: [],
      });
    });

    it('should throw ForbiddenException when the user is not the creator', async () => {
      const setId = 1;
      const userId = 2;

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        createdBy: 1,
        cards: [],
      } as SetEntity);

      await expect(service.findOnePrivate(setId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update the name or description successfully', async () => {
      const setId = 1;
      const userId = 1;
      const dto: UpdateSetDto = {
        name: 'Updated Set',
        description: 'Updated Description',
      };

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        createdBy: userId,
        cards: [],
      } as SetEntity);

      jest.spyOn(SetEntity, 'save').mockResolvedValue({
        id: setId,
        ...dto,
        updatedBy: userId,
      } as SetEntity);

      const result = await service.update(setId, dto, userId);
      expect(result).toEqual({
        id: setId,
        ...dto,
        updatedBy: userId,
      });
    });

    it('should update the set and cards successfully', async () => {
      const setId = 1;
      const userId = 1;
      const dto: UpdateSetDto = {
        name: 'Updated Set',
        description: 'Updated Description',
        cards: [{ term: 'term1', definition: 'definition1' }],
      };

      const found = {
        id: setId,
        createdBy: userId,
        cards: [],
      } as SetEntity;

      const updated = {
        id: setId,
        ...dto,
        updatedBy: userId,
      } as SetEntity;

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue(found);
      jest.spyOn(CardEntity, 'remove').mockResolvedValue(undefined);
      jest.spyOn(SetEntity, 'save').mockResolvedValue(updated);

      const result = await service.update(setId, dto, userId);
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when the user is not the creator', async () => {
      const setId = 1;
      const userId = 2;
      const dto: UpdateSetDto = {
        name: 'Updated Set',
        description: 'Updated Description',
      };

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue({
        id: setId,
        createdBy: 1,
        cards: [],
      } as SetEntity);

      await expect(service.update(setId, dto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove the set successfully', async () => {
      const setId = 1;
      const userId = 1;
      const found = { id: 1, createdBy: 1 } as SetEntity;

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue(found);
      jest.spyOn(SetEntity, 'remove').mockResolvedValue(found);

      expect(await service.remove(setId, userId)).toEqual(found);
    });

    it('should throw ForbiddenException when the user is not the creator', async () => {
      const setId = 1;
      const userId = 1;
      const found = { id: setId, createdBy: 2 } as SetEntity;

      jest.spyOn(SetEntity, 'findOneOrFail').mockResolvedValue(found);

      await expect(service.remove(setId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
