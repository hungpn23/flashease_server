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
import { ProgressEntity } from './progress.entity';

@Expose()
@Entity('item')
@Unique(['progress', 'card'])
export class ProgressItemEntity extends AbstractEntity {
  constructor(data?: Partial<ProgressItemEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'correct_count', nullable: true })
  correctCount?: number;

  @ManyToOne(() => ProgressEntity, (progress) => progress.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'progress_id', referencedColumnName: 'id' })
  progress: Relation<ProgressEntity>;

  @ManyToOne(() => CardEntity, (card) => card.progressItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  card: Relation<CardEntity>;
}
