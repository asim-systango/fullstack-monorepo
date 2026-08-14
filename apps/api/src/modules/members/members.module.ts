import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fine } from '../fines/fine.entity';
import { Loan } from '../loans/loan.entity';
import { SettingsModule } from '../settings/settings.module';
import { MemberProfile } from './member-profile.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberProfile, Loan, Fine]), SettingsModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService, TypeOrmModule],
})
export class MembersModule {}
