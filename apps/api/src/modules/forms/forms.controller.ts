import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { SubmitOnboardingRequestDto } from './dto/submit-onboarding-request.dto';
import { GetFormSubmissionsQueryDto } from './dto/get-form-submissions-query.dto';
import { UpdateFormSubmissionStatusDto } from './dto/update-form-submission-status.dto';
import { SubmitOnboardingRequestSwagger } from './decorators/swagger/submit-onboarding-request.decorator';
import { GetFormSubmissionsSwagger } from './decorators/swagger/get-form-submissions.decorator';
import { UpdateFormSubmissionStatusSwagger } from './decorators/swagger/update-form-submission-status.decorator';
import { FORMS_ERRORS } from './constants/forms.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutePermissionGuard } from '../../common/guards/route-permission.guard';
import { CurrentUser, type JwtUser } from '../../common/auth';

@ApiTags('Public Forms')
@Controller('api/v1/forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post('onboarding-request')
  @HttpCode(HttpStatus.CREATED)
  @SubmitOnboardingRequestSwagger()
  async submitOnboardingRequest(@Body() dto: SubmitOnboardingRequestDto) {
    try {
      return await this.formsService.submitOnboardingRequest(dto);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case FORMS_ERRORS.TOO_MANY_REQUESTS_PER_EMAIL:
          case FORMS_ERRORS.ACTIVE_EMAIL_COMPANY_REQUEST_EXISTS:
          case FORMS_ERRORS.ACTIVE_COMPANY_REQUEST_EXISTS:
          case FORMS_ERRORS.ORGANIZATION_ALREADY_EXISTS:
            throw new ConflictException(error.message);
          default:
            throw new InternalServerErrorException(error.message);
        }
      }
      throw new InternalServerErrorException(FORMS_ERRORS.UNEXPECTED_ERROR);
    }
  }

  @Get('submissions')
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.OK)
  @GetFormSubmissionsSwagger()
  async findAllSubmissions(@Query() query: GetFormSubmissionsQueryDto) {
    try {
      return await this.formsService.findAllSubmissions(query);
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(FORMS_ERRORS.UNEXPECTED_ERROR);
    }
  }

  @Patch('submissions/:id/status')
  @UseGuards(JwtAuthGuard, RoutePermissionGuard)
  @HttpCode(HttpStatus.OK)
  @UpdateFormSubmissionStatusSwagger()
  async updateSubmissionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFormSubmissionStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    try {
      return await this.formsService.updateSubmissionStatus(id, dto, user.id);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === FORMS_ERRORS.SUBMISSION_NOT_FOUND) {
          throw new NotFoundException(error.message);
        }
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException(FORMS_ERRORS.UNEXPECTED_ERROR);
    }
  }
}
