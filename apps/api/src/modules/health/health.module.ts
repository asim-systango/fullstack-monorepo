import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ReadyController } from './ready.controller';
import { RootController } from './root.controller';

@Module({
  controllers: [RootController, HealthController, ReadyController],
})
export class HealthModule {}
