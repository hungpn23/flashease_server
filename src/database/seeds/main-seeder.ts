import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  async run(
    _dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {}
}
