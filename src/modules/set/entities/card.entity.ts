import { AbstractEntity } from '@/database/entities/abstract.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
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

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  term: string;

  @Column()
  definition: string;

  // TODO: image upload feature
  // @Column({ nullable: true })
  // image?: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'set_id', referencedColumnName: 'id' })
  set: Relation<SetEntity>;
}
