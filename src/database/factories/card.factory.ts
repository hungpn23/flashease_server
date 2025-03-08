import { CardEntity } from '@/modules/set/entities/card.entity';
import { setSeederFactory } from 'typeorm-extension';

export const CardFactory = setSeederFactory(
  CardEntity,
  async (faker) =>
    new CardEntity({
      term: faker.lorem.word(),
      definition: faker.lorem.word(),
      correctCount: Math.random() > 0.5 ? null : faker.number.int({ max: 2 }),
    }),
);
