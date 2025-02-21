import { Role } from '@/constants';
import { CardEntity } from '@/modules/set/entities/card.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { EditableBy, VisibleTo } from '@/modules/set/set.enum';
import { UserEntity } from '@/modules/user/entities/user.entity';
import argon2 from 'argon2';
import slugify from 'slugify';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactory, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const NounCardFactory = factoryManager.get<CardEntity, 'noun'>(CardEntity);

    const users = await this.seedUsers();

    const sets = await this.seedSets(users);

    await this.seedCards(sets[0], NounCardFactory);
  }

  private async seedCards<Meta = unknown>(
    set: SetEntity,
    factory: SeederFactory<CardEntity, Meta>,
  ) {
    for (let i = 0; i < 5; i++) {
      const card = await factory.make({ set, createdBy: set.createdBy });
      await CardEntity.save(card);
    }
  }

  private async seedSets(users: UserEntity[]) {
    const [hungpn23, andy, red, rust, martin] = users;

    const [
      hungpn23PublicSet,
      hungpn23ProtectedSet,
      hungpn23PrivateSet,
      andyPublicSet,
      andyProtectedSet,
    ] = await SetEntity.save([
      new SetEntity({
        name: 'hungpn23 public',
        slug: slugify('hungpn23 public', { lower: true, strict: true }),
        description: 'hungpn23 public set',
        author: hungpn23.username,
        visibleTo: VisibleTo.EVERYONE,
        visibleToPassword: null,
        editableBy: EditableBy.JUST_ME,
        editableByPassword: null,
        createdBy: hungpn23.id,
      }),

      new SetEntity({
        name: 'hungpn23 protected',
        slug: slugify('hungpn23 protected', { lower: true, strict: true }),
        description: 'hungpn23 protected set',
        author: hungpn23.username,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
        visibleToPassword: await argon2.hash('password'),
        editableBy: EditableBy.JUST_ME,
        editableByPassword: null,
        createdBy: hungpn23.id,
      }),

      new SetEntity({
        name: 'hungpn23 private',
        slug: slugify('hungpn23 private', { lower: true, strict: true }),
        description: 'hungpn23 private set',
        author: hungpn23.username,
        visibleTo: VisibleTo.JUST_ME,
        visibleToPassword: null,
        editableBy: EditableBy.JUST_ME,
        editableByPassword: null,
        createdBy: hungpn23.id,
      }),

      new SetEntity({
        name: 'andy public',
        slug: slugify('andy public', { lower: true, strict: true }),
        description: 'public set',
        author: hungpn23.username,
        visibleTo: VisibleTo.EVERYONE,
        visibleToPassword: null,
        editableBy: EditableBy.PEOPLE_WITH_A_PASSWORD,
        editableByPassword: await argon2.hash('password'),
        createdBy: andy.id,
      }),

      new SetEntity({
        name: 'andy protected',
        slug: slugify('andy protected', { lower: true, strict: true }),
        description: 'protected set',
        author: hungpn23.username,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
        visibleToPassword: await argon2.hash('password'),
        editableBy: EditableBy.PEOPLE_WITH_A_PASSWORD,
        editableByPassword: await argon2.hash('password'),
        createdBy: andy.id,
      }),
    ]);

    return [
      hungpn23PublicSet,
      hungpn23ProtectedSet,
      hungpn23PrivateSet,
      andyPublicSet,
      andyProtectedSet,
    ];
  }

  private async seedUsers() {
    const [hungpn23, andy, red, rust, martin] = await UserEntity.save([
      new UserEntity({
        username: 'hungpn23',
        email: 'hungpn23@gmail.com',
        isEmailVerified: true,
        bio: 'I am Hung',
        password: await argon2.hash('password'),
        role: Role.ADMIN,
      }),

      new UserEntity({
        username: 'andy',
        email: 'andy@gmail.com',
        bio: 'I am Andy',
        password: await argon2.hash('password'),
      }),

      new UserEntity({
        username: 'red',
        email: 'red@gmail.com',
        bio: 'I am Red',
        password: await argon2.hash('password'),
      }),

      new UserEntity({
        username: 'rust',
        email: 'rust@gmail.com',
        bio: 'I am Rust',
        password: await argon2.hash('password'),
      }),

      new UserEntity({
        username: 'martin',
        email: 'martin@gmail.com',
        bio: 'I am Martin',
        password: await argon2.hash('password'),
      }),
    ]);

    return [hungpn23, andy, red, rust, martin];
  }
}
