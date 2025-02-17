import { Role } from '@/constants';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { EditableBy, VisibleTo } from '@/modules/set/set.enum';
import { UserEntity } from '@/modules/user/entities/user.entity';
import argon2 from 'argon2';
import slugify from 'slugify';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const [hungpn23, andy, red, rust, martin] = await this.seedUsers();

    const hungpn23PublicSet = SetEntity.create({
      name: 'hungpn23 public',
      slug: slugify('hungpn23 public', { lower: true, strict: true }),
      description: 'hungpn23 public set',
      visibleTo: VisibleTo.EVERYONE,
      visibleToPassword: null,
      editableBy: EditableBy.JUST_ME,
      editableByPassword: null,
      createdBy: hungpn23.id,
    } as SetEntity);

    const hungpn23ProtectedSet = SetEntity.create({
      name: 'hungpn23 protected',
      slug: slugify('hungpn23 protected', { lower: true, strict: true }),
      description: 'hungpn23 protected set',
      visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
      visibleToPassword: await argon2.hash('password'),
      editableBy: EditableBy.JUST_ME,
      editableByPassword: null,
      createdBy: hungpn23.id,
    } as SetEntity);

    const hungpn23PrivateSet = SetEntity.create({
      name: 'hungpn23 private',
      slug: slugify('hungpn23 private', { lower: true, strict: true }),
      description: 'hungpn23 private set',
      visibleTo: VisibleTo.JUST_ME,
      visibleToPassword: null,
      editableBy: EditableBy.JUST_ME,
      editableByPassword: null,
      createdBy: hungpn23.id,
    } as SetEntity);

    const andyPublicSet = SetEntity.create({
      name: 'andy public',
      slug: slugify('andy public', { lower: true, strict: true }),
      description: 'public set',
      visibleTo: VisibleTo.EVERYONE,
      visibleToPassword: null,
      editableBy: EditableBy.PEOPLE_WITH_A_PASSWORD,
      editableByPassword: await argon2.hash('password'),
      createdBy: andy.id,
    } as SetEntity);

    const andyProtectedSet = SetEntity.create({
      name: 'andy protected',
      slug: slugify('andy protected', { lower: true, strict: true }),
      description: 'protected set',
      visibleTo: VisibleTo.PEOPLE_WITH_A_PASSWORD,
      visibleToPassword: await argon2.hash('password'),
      editableBy: EditableBy.PEOPLE_WITH_A_PASSWORD,
      editableByPassword: await argon2.hash('password'),
      createdBy: andy.id,
    } as SetEntity);

    await SetEntity.save([
      hungpn23PublicSet,
      hungpn23ProtectedSet,
      hungpn23PrivateSet,
      andyPublicSet,
      andyProtectedSet,
    ]);
  }

  private async seedUsers() {
    const [hungpn23, andy, red, rust, martin] = await Promise.all([
      UserEntity.save(
        new UserEntity({
          username: 'hungpn23',
          email: 'hungpn23@gmail.com',
          isEmailVerified: true,
          bio: 'I am Hung',
          password: await argon2.hash('password'),
          role: Role.ADMIN,
        }),
      ),
      UserEntity.save(
        new UserEntity({
          username: 'andy',
          email: 'andy@gmail.com',
          bio: 'I am Andy',
          password: await argon2.hash('password'),
        }),
      ),
      UserEntity.save(
        new UserEntity({
          username: 'red',
          email: 'red@gmail.com',
          bio: 'I am Red',
          password: await argon2.hash('password'),
        }),
      ),
      UserEntity.save(
        new UserEntity({
          username: 'rust',
          email: 'rust@gmail.com',
          bio: 'I am Rust',
          password: await argon2.hash('password'),
        }),
      ),
      UserEntity.save(
        new UserEntity({
          username: 'martin',
          email: 'martin@gmail.com',
          bio: 'I am Martin',
          password: await argon2.hash('password'),
        }),
      ),
    ]);

    return [hungpn23, andy, red, rust, martin];
  }
}
