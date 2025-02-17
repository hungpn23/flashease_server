import { CardEntity } from '@/modules/set/entities/card.entity';
import { translate } from '@vitalets/google-translate-api';
import { setSeederFactory } from 'typeorm-extension';

export const AdjectiveCardFactory = setSeederFactory<CardEntity, 'adjective'>(
  CardEntity,
  async (faker) => {
    const term = faker.word.adjective();
    const definition = (await translate(term, { from: 'en', to: 'vi' })).text;
    const card = new CardEntity();

    card.term = term;
    card.definition = definition;

    return card;
  },
);

export const ConjunctionCardFactory = setSeederFactory<
  CardEntity,
  'conjunction'
>(CardEntity, async (faker) => {
  const term = faker.word.conjunction();
  const definition = (await translate(term, { from: 'en', to: 'vi' })).text;
  const card = new CardEntity();

  card.term = term;
  card.definition = definition;

  return card;
});

export const NounCardFactory = setSeederFactory<CardEntity, 'noun'>(
  CardEntity,
  async (faker) => {
    const term = faker.word.noun();
    const definition = (await translate(term, { from: 'en', to: 'vi' })).text;
    const card = new CardEntity();

    card.term = term;
    card.definition = definition;

    return card;
  },
);

export const VerbCardFactory = setSeederFactory<CardEntity, 'verb'>(
  CardEntity,
  async (faker) => {
    const term = faker.word.verb();
    const definition = (await translate(term, { from: 'en', to: 'vi' })).text;
    const card = new CardEntity();

    card.term = term;
    card.definition = definition;

    return card;
  },
);
