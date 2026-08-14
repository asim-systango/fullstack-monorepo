import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth';

@ApiTags('meta')
@Controller()
export class RootController {
  @Public()
  @Get()
  @ApiOperation({
    summary: 'API index',
    description: 'Use the web app on :3000; this service exposes JSON API routes only.',
  })
  index() {
    return {
      name: 'Splitter API',
      status: 'ok',
      links: {
        docs: '/docs',
        health: '/health',
        ready: '/ready',
        auth: '/auth',
      },
      webApp: 'http://localhost:3000',
    };
  }
}
