import { AbstractEntity } from '@/database/entities/abstract.entity';
import { CardEntity } from '@/modules/set/entities/card.entity';
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
import { SavedSetEntity } from '../set/entities/saved-set.entity';

@Expose()
@Entity('progress')
@Unique(['savedSet', 'card'])
export class ProgressEntity extends AbstractEntity {
  constructor(data?: Partial<ProgressEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'correct_count', nullable: true })
  correctCount?: number;

  @ManyToOne(() => SavedSetEntity, (savedSet) => savedSet.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'saved_set_id', referencedColumnName: 'id' })
  savedSet: Relation<SavedSetEntity>;

  @ManyToOne(() => CardEntity, (card) => card.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  card: Relation<CardEntity>;
}
