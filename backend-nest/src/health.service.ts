import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

type DependencyHealth = {
  status: 'up' | 'down';
  details?: string;
};

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly appDataSource: DataSource,
    @InjectDataSource('business')
    private readonly businessDataSource: DataSource,
  ) {}

  async getStatus() {
    const [appDatabase, businessDatabase] = await Promise.all([
      this.checkDataSource(this.appDataSource),
      this.checkDataSource(this.businessDataSource),
    ]);

    const status =
      appDatabase.status === 'up' && businessDatabase.status === 'up'
        ? 'ok'
        : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      dependencies: {
        appDatabase,
        businessDatabase,
      },
    };
  }

  private async checkDataSource(dataSource: DataSource): Promise<DependencyHealth> {
    try {
      await dataSource.query('SELECT 1');
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
