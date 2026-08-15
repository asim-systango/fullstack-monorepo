import 'reflect-metadata';
import { ROLES_KEY } from '@shared/http/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesController } from './articles.controller';

const STAFF = [Role.Editor, Role.Admin];

describe('ArticlesController publish authorization', () => {
  it('keeps immediate publish staff-only', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, ArticlesController.prototype.publishArticle),
    ).toEqual(STAFF);
  });

  it('keeps schedule publish staff-only', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, ArticlesController.prototype.schedulePublish),
    ).toEqual(STAFF);
  });

  it('keeps run-due jobs staff-only', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, ArticlesController.prototype.runDueSchedules),
    ).toEqual(STAFF);
  });
});
