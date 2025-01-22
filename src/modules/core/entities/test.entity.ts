import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Expose()
@Entity('test')
export class TestEntity extends AbstractEntity {
  constructor(data?: Partial<TestEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;
}
