import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { InternalMemberProfilesController } from './internal-member-profiles.controller';
import { InternalTokenGuard } from './internal-token.guard';

@Module({
  imports: [MembersModule],
  controllers: [InternalMemberProfilesController],
  providers: [InternalTokenGuard],
})
export class InternalModule {}
