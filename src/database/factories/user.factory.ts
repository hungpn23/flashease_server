import { UserEntity } from '@/modules/user/entities/user.entity';
import argon2 from 'argon2';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(UserEntity, async (faker) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const user = new UserEntity();

  user.username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  user.email = faker.internet.email({ provider: 'gmail.com' }).toLowerCase();
  user.password = await argon2.hash('11111111');
  user.avatar = faker.image.avatar();
  user.bio = faker.lorem.sentence();

  return user;
});
