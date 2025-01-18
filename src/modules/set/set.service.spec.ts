import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SetEntity } from './entities/set.entity';
import { VisibleTo } from './set.enum';
import { SetService } from './set.service';

describe('SetService', () => {
  let service: SetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetService],
    }).compile();

    service = module.get<SetService>(SetService);
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
});
