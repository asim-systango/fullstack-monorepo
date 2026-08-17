import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [DatabaseModule, MailModule, AuthModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, RoutePermissionGuard],
  exports: [OrganizationService],
})
export class OrganizationModule {}
