import { AbstractEntity } from '@/database/entities/abstract.entity';
import { CardEntity } from '@/modules/set/entities/card.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';

@Expose()
@Entity('progress')
@Unique(['user', 'set', 'card'])
export class ProgressEntity extends AbstractEntity {
  constructor(data?: Partial<ProgressEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'correct_count', nullable: true })
  correctCount?: number;

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

  @ManyToOne(() => CardEntity, (card) => card.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  card: Relation<CardEntity>;
}
