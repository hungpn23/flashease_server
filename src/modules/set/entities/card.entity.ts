import { AbstractEntity } from '@/database/entities/abstract.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { UUID } from '@/types/branded.type';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('card')
export class CardEntity extends AbstractEntity {
  constructor(data?: Partial<CardEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  term: string;

  @Column()
  definition: string;

  @Column({ name: 'correct_count', nullable: true })
  correctCount?: number;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'set_id', referencedColumnName: 'id' })
  set: Relation<SetEntity>;
}
