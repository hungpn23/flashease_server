import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { SetEntity } from '../set/entities/set.entity';

@Expose()
@Entity('folder')
export class FolderEntity extends AbstractEntity {
  constructor(data?: Partial<FolderEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => SetEntity, (set) => set.folder, { cascade: true })
  sets: Relation<SetEntity[]>;
}
