import { AbstractEntity } from '@/database/entities/abstract.entity';
import { ProgressItemEntity } from '@/modules/progress/entities/progress-item.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Expose } from 'class-transformer';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

@Expose()
@Entity('progress')
@Unique(['user', 'set'])
export class ProgressEntity extends AbstractEntity {
  constructor(data?: Partial<ProgressEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<UserEntity>;

  @ManyToOne(() => SetEntity, (set) => set.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'set_id', referencedColumnName: 'id' })
  set: Relation<SetEntity>;

  @OneToMany(() => ProgressItemEntity, (item) => item.progress, {
    cascade: true,
  })
  items: Relation<ProgressItemEntity[]>;
}
