import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { CurrentUser, JwtUser, Roles } from '../../common/auth';

@ApiTags('Insurance Claims')
@Controller('insurance-claims')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an insurance claim for a completed appointment' })
  @ApiResponse({ status: 201, description: 'Claim submitted successfully' })
  async create(
    @CurrentUser() user: JwtUser | undefined,
    @Body() dto: CreateInsuranceClaimDto,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.insuranceService.createClaim(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List insurance claims (Patient scoped or Admin hospital-wide)',
  })
  @ApiResponse({ status: 200, description: 'List of insurance claims' })
  async findAll(@CurrentUser() user: JwtUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.insuranceService.findAll(user);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Process insurance claim status and update coverage (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Insurance claim status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
    @Body() body: { status: string; notes?: string; coveredAmount?: number },
  ) {
    return this.insuranceService.updateStatus(
      id,
      user,
      body.status,
      body.notes,
      body.coveredAmount,
    );
  }
}
