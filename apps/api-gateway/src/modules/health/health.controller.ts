import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/auth';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Gateway liveness' })
  check() {
    return { status: 'ok' };
  }
}
