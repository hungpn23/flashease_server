import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Expose()
@Entity('progress')
export class ProgressEntity extends AbstractEntity {
  constructor(data?: Partial<ProgressEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;
}
