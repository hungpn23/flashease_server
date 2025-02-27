import { AbstractEntity } from '@/database/entities/abstract.entity';
import { FolderEntity } from '@/modules/folder/folder.entity';
import { CardEntity } from '@/modules/set/entities/card.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
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
import { VisibleTo } from '../set.enum';

@Expose()
@Entity('set')
export class SetEntity extends AbstractEntity {
  constructor(data?: Partial<SetEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  author: string;

  @Column({
    name: 'visible_to',
    type: 'enum',
    enum: VisibleTo,
    default: VisibleTo.JUST_ME,
  })
  visibleTo: VisibleTo;

  @Column({ name: 'visible_to_password', nullable: true })
  visibleToPassword?: string; // if visibleTo is set to PEOPLE_WITH_A_PASSWORD

  @OneToMany(() => CardEntity, (card) => card.set, { cascade: true })
  cards: Relation<CardEntity[]>;

  @ManyToOne(() => FolderEntity, (folder) => folder.sets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'folder_id', referencedColumnName: 'id' })
  folder: Relation<FolderEntity>;

  @ManyToOne(() => UserEntity, (user) => user.sets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<UserEntity>;
}
