import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/expense.entity';
import { Share } from '../expenses/share.entity';
import { GroupMember } from '../groups/group-member.entity';
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups';
import { Settlement } from '../settlements/settlement.entity';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember, Expense, Share, Settlement]),
    GroupsModule,
  ],
  controllers: [BalancesController],
  providers: [BalancesService],
})
export class BalancesModule {}
