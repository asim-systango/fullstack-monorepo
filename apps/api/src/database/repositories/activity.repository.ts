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

  async findAllActivities(
    organizationId: string,
    createdBy?: string,
  ): Promise<Activity[]> {
    const query = this.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.lead', 'lead')
      .leftJoinAndSelect('activity.deal', 'deal')
      .leftJoinAndSelect('activity.creator', 'creator')
      .where('activity.organizationId = :organizationId', { organizationId });

    if (createdBy) {
      query.andWhere('activity.createdBy = :createdBy', { createdBy });
    }

    return query.orderBy('activity.createdAt', 'DESC').getMany();
  }
}
