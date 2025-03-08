import { Role } from '@/constants';
import { CardEntity } from '@/modules/set/entities/card.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { VisibleTo } from '@/modules/set/set.enum';
import { UserEntity } from '@/modules/user/entities/user.entity';
import argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactory, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const CardFactory = factoryManager.get(CardEntity);
    const users = await this.seedUsers();
    await this.seedSets(users, CardFactory);
  }

  private async seedSets(
    users: UserEntity[],
    cardFactory: SeederFactory<CardEntity>,
  ) {
    const [hungpn23, andy, red, rust, martin] = users;
    const hungpn23PublicSet = await SetEntity.save([
      new SetEntity({
        name: 'hungpn23 public',
        description: 'hungpn23 public set',
        author: hungpn23.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: hungpn23.id,
        user: hungpn23,
        cards: await cardFactory.saveMany(20),
      }),
    ]);

    const hungpn23ProtectedSet = await SetEntity.save([
      new SetEntity({
        name: 'hungpn23 protected',
        description: 'hungpn23 protected set',
        author: hungpn23.username,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSCODE,
        passcode: 'passcode',
        createdBy: hungpn23.id,
        user: hungpn23,
        cards: await cardFactory.saveMany(30),
      }),
    ]);

    const hungpn23PrivateSet = await SetEntity.save([
      new SetEntity({
        name: 'hungpn23 private',
        description: 'hungpn23 private set',
        author: hungpn23.username,
        visibleTo: VisibleTo.JUST_ME,
        passcode: null,
        createdBy: hungpn23.id,
        user: hungpn23,
        cards: await cardFactory.saveMany(10),
      }),
    ]);

    const andyPublicSet = await SetEntity.save([
      new SetEntity({
        name: 'andy public',
        description: 'andy public set',
        author: andy.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: andy.id,
        user: andy,
        cards: await cardFactory.saveMany(12),
      }),
    ]);

    const andyPrivateSet = await SetEntity.save([
      new SetEntity({
        name: 'andy private',
        description: 'andy private set',
        author: andy.username,
        visibleTo: VisibleTo.JUST_ME,
        passcode: null,
        createdBy: andy.id,
        user: andy,
        cards: await cardFactory.saveMany(15),
      }),
    ]);

    const redPublicSet = await SetEntity.save([
      new SetEntity({
        name: 'red public',
        description: 'red public set',
        author: red.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: red.id,
        user: red,
        cards: await cardFactory.saveMany(24),
      }),
    ]);

    const redProtectedSet = await SetEntity.save([
      new SetEntity({
        name: 'red protected',
        description: 'red protected set',
        author: red.username,
        visibleTo: VisibleTo.PEOPLE_WITH_A_PASSCODE,
        passcode: 'passcode',
        createdBy: red.id,
        user: red,
        cards: await cardFactory.saveMany(24),
      }),
    ]);

    const rustPublicSet = await SetEntity.save([
      new SetEntity({
        name: 'rust public',
        description: 'rust public set',
        author: rust.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: rust.id,
        user: rust,
        cards: await cardFactory.saveMany(32),
      }),
    ]);

    const martinPublicSet = await SetEntity.save([
      new SetEntity({
        name: 'martin public',
        description: 'martin public set',
        author: martin.username,
        visibleTo: VisibleTo.EVERYONE,
        passcode: null,
        createdBy: martin.id,
        user: martin,
        cards: await cardFactory.saveMany(14),
      }),
    ]);
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
