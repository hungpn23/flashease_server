import { AbstractEntity } from '@/database/entities/abstract.entity';
import { UUID } from '@/types/branded.type';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { SetEntity } from '../set/entities/set.entity';

@Entity('folder')
export class FolderEntity extends AbstractEntity {
  constructor(data?: Partial<FolderEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => SetEntity, (set) => set.folder, { cascade: true })
  sets: Relation<SetEntity[]>;
}
