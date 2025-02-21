import { AbstractEntity } from '@/database/entities/abstract.entity';
import { FolderEntity } from '@/modules/folder/folder.entity';
import { CardEntity } from '@/modules/set/entities/card.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProgressEntity } from '../../progress/entities/progress.entity';
import { EditableBy, VisibleTo } from '../set.enum';

@Expose()
@Entity('set')
export class SetEntity extends AbstractEntity {
  constructor(data?: Partial<SetEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

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

  @ApiHideProperty()
  @Exclude()
  @Column({ name: 'visible_to_password', nullable: true })
  visibleToPassword?: string; // if visibleTo is set to PEOPLE_WITH_A_PASSWORD

  @Column({
    name: 'editable_by',
    type: 'enum',
    enum: EditableBy,
    default: EditableBy.JUST_ME,
  })
  editableBy: EditableBy;

  @ApiHideProperty()
  @Exclude()
  @Column({ name: 'editable_by_password', nullable: true })
  editableByPassword?: string; // if editableBy is set to PEOPLE_WITH_A_PASSWORD

  @OneToMany(() => CardEntity, (card) => card.set, { cascade: true })
  cards: Relation<CardEntity[]>;

  @OneToMany(() => ProgressEntity, (progresses) => progresses.set, {
    cascade: true,
  })
  progresses: Relation<ProgressEntity[]>;

  @ManyToOne(() => FolderEntity, (folder) => folder.sets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'folder_id', referencedColumnName: 'id' })
  folder: Relation<FolderEntity>;
}
