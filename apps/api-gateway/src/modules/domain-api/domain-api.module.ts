import { Module } from '@nestjs/common';
import { DomainApiClient } from './domain-api.client';

@Module({
  providers: [DomainApiClient],
  exports: [DomainApiClient],
})
export class DomainApiModule {}
