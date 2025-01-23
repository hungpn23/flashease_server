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
import { PracticeEntity } from './practice.entity';

@Expose()
@Entity('progress')
@Unique(['practice', 'card'])
export class ProgressEntity extends AbstractEntity {
  constructor(data?: Partial<ProgressEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'correct_count', nullable: true })
  correctCount?: number;

  @ManyToOne(() => PracticeEntity, (practice) => practice.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'practice_id', referencedColumnName: 'id' })
  practice: Relation<PracticeEntity>;

  @ManyToOne(() => CardEntity, (card) => card.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  card: Relation<CardEntity>;
}
