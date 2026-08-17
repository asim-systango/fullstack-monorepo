import { Public, Roles } from './decorators';
import { IS_PUBLIC_KEY, ROLES_KEY } from './keys';

describe('Auth Decorators', () => {
  it('Public sets IS_PUBLIC_KEY metadata', () => {
    class TestController {
      @Public()
      handler() {}
    }
    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.handler);
    expect(metadata).toBe(true);
  });

  it('Roles sets ROLES_KEY metadata', () => {
    class TestController {
      @Roles('admin', 'user')
      handler() {}
    }
    const metadata = Reflect.getMetadata(ROLES_KEY, TestController.prototype.handler);
    expect(metadata).toEqual(['admin', 'user']);
  });
});
