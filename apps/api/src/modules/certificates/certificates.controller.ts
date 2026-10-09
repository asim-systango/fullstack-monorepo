import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles, CurrentUser } from '../../common/auth';
import { CertificatesService } from './certificates.service';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Roles('user')
  @Get('my')
  @ApiOperation({ summary: 'Get current user certificates' })
  findMyCertificates(@CurrentUser() user: JwtUser) {
    return this.certificatesService.findByStudent(user.id);
  }
}
