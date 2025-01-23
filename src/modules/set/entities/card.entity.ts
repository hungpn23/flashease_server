import { AbstractEntity } from '@/database/entities/abstract.entity';
import { ProgressEntity } from '@/modules/core/entities/progress.entity';
import { SetEntity } from '@/modules/set/entities/set.entity';
import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Expose()
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

  @OneToMany(() => ProgressEntity, (progress) => progress.card, {
    cascade: true,
  })
  progresses: Relation<ProgressEntity[]>;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'set_id', referencedColumnName: 'id' })
  set: Relation<SetEntity>;
}
