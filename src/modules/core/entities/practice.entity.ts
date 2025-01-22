import { AbstractEntity } from '@/database/entities/abstract.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Expose } from 'class-transformer';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { SetEntity } from '../../set/entities/set.entity';

@Expose()
@Entity('user_set_practice')
export class PracticeEntity extends AbstractEntity {
  constructor(data?: Partial<PracticeEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.practices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<UserEntity>;

  @ManyToOne(() => SetEntity, (set) => set.practices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'set_id', referencedColumnName: 'id' })
  set: Relation<SetEntity>;
}
