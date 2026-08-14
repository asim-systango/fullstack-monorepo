import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Activity | null> {
    return this.findOne({ where: { id } });
  }

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    const newActivity = this.create(activity);
    return this.save(newActivity);
  }
}
