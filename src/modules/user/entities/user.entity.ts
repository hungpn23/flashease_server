import { Role } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { ProgressEntity } from '@/modules/progress/entities/progress.entity';
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
  id: number;

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
  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => SessionEntity, (session) => session.user, { cascade: true })
  sessions: Relation<SessionEntity[]>;

  @OneToMany(() => ProgressEntity, (progresses) => progresses.user, {
    cascade: true,
  })
  progresses: Relation<ProgressEntity[]>;
}
