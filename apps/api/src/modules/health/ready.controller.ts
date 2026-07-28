import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/auth.decorators';

@ApiTags('ready')
@Controller('ready')
export class ReadyController {
  /** Public liveness for proxy checks (gateway owns GET /health). */
  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'api' };
  }
}
