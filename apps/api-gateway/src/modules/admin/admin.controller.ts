import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users';
import { AuthService } from '../auth/auth.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@ApiTags('admin')
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('staff')
  @ApiOperation({
    summary:
      'Provision a staff account (temp password returned once, plaintext never stored)',
  })
  createStaff(@Body() dto: CreateStaffDto) {
    return this.authService.createStaff(dto);
  }
}
