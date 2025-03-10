import { Role } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { SessionEntity } from './session.entity';

@Expose()
@Entity('user')
export class UserEntity extends AbstractEntity {
  constructor(data?: Partial<UserEntity>) {
    super();
    Object.assign(this, data);
  }

  @ApiProperty({ type: () => String })
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => SessionEntity, (session) => session.user, { cascade: true })
  sessions: Relation<SessionEntity[]>;

  @OneToMany(() => SetEntity, (set) => set.user, {
    cascade: true,
  })
  sets: Relation<SetEntity[]>;
}
