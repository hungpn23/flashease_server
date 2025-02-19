import { AbstractEntity } from '@/database/entities/abstract.entity';
import { ProgressEntity } from '@/modules/progress/progress.entity';
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
@Entity('saved_set')
@Unique(['user', 'set'])
export class SavedSetEntity extends AbstractEntity {
  constructor(data?: Partial<SavedSetEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.savedSets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<UserEntity>;

  @ManyToOne(() => SetEntity, (set) => set.savedSets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'set_id', referencedColumnName: 'id' })
  set: Relation<SetEntity>;

  @OneToMany(() => ProgressEntity, (progress) => progress.savedSet, {
    cascade: true,
  })
  progresses: Relation<ProgressEntity[]>;
}
