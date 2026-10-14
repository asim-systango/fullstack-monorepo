import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CompaniesService } from './companies.service';
import { CreateCompanyDTO } from './dto/create-company.dto';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me')
  @Roles('staff', 'admin')
  @ApiOperation({ summary: 'Get the current user company profile' })
  me(@CurrentUser() user: JwtUser) {
    return this.companiesService.findByUserIdOrThrow(user.id);
  }

  @Post()
  @Roles('staff')
  @ApiOperation({ summary: 'Create a company profile for the current user' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateCompanyDTO) {
    return this.companiesService.create(user.id, dto);
  }
}
