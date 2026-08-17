import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalancesModule } from '../balances/balances.module';
import { GroupsModule } from '../groups';
import { Settlement } from './settlement.entity';
import { SettlementsController } from './settlements.controller';
import { SettlementsHubController } from './settlements-hub.controller';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settlement]), GroupsModule, BalancesModule],
  controllers: [SettlementsController, SettlementsHubController],
  providers: [SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
