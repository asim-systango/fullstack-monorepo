import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Domain API liveness' })
  check() {
    return { status: 'ok' };
  }
}
