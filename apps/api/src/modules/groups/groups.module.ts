import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/expense.entity';
import { Share } from '../expenses/share.entity';
import { Settlement } from '../settlements/settlement.entity';
import { UsersModule } from '../users';
import { GroupInvitation } from './group-invitation.entity';
import { GroupMember } from './group-member.entity';
import { Group } from './group.entity';
import { GroupsController } from './groups.controller';
import { FriendsController } from './friends.controller';
import { GroupsService } from './groups.service';
import { InvitesController } from './invites.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupInvitation,
      Expense,
      Share,
      Settlement,
    ]),
    UsersModule,
  ],
  controllers: [GroupsController, InvitesController, FriendsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
