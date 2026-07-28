import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth';

@ApiTags('ready')
@Controller('ready')
export class ReadyController {
  /** Public liveness for proxy checks (gateway owns GET /health). */
  @Public()
  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Readiness (proxied via gateway)',
    description: 'Used by `pnpm doctor` hop checks through the gateway proxy.',
  })
  check() {
    return { status: 'ok', service: 'api' };
  }
}
