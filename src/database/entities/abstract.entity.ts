import { SYSTEM } from '@/constants/index';
import { getOrder, Order } from '@/decorators/order.decorator';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DataSource,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

// use Active Record pattern
export abstract class AbstractEntity extends BaseEntity {
  @Order(9998)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Order(9998)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Order(9998)
  @Column({
    name: 'created_by',
    default: SYSTEM,
  })
  createdBy: string;

  @Order(9998)
  @Column({
    name: 'updated_by',
    default: null,
  })
  updatedBy: string;

  // issue: https://github.com/typeorm/typeorm/issues/541#issuecomment-2358776943
  static useDataSource(dataSource: DataSource) {
    BaseEntity.useDataSource.call(this, dataSource);
    const meta = dataSource.entityMetadatasMap.get(this);
    const getOrderSafely = (column: ColumnMetadata) => {
      const target = column.target as any;
      if (target && target.prototype) {
        return getOrder(target.prototype, column.propertyName);
      }
      return 9996;
    };
    if (meta != null) {
      meta.columns = [...meta.columns].sort((xColumn, yColumn) => {
        const orderXColumn = getOrderSafely(xColumn);
        const orderYColumn = getOrderSafely(yColumn);
        return orderXColumn - orderYColumn;
      });
    }
  }
}

export abstract class DeletableAbstractEntity extends AbstractEntity {
  @ApiHideProperty()
  @Exclude()
  @Order(9999)
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    default: null,
  })
  deletedAt: Date;

  @ApiHideProperty()
  @Exclude()
  @Order(9999)
  @Column({
    name: 'deleted_by',
    default: null,
  })
  deletedBy: string;
}
