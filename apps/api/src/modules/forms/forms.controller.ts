import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { SubmitOnboardingRequestDto } from './dto/submit-onboarding-request.dto';
import { SubmitOnboardingRequestSwagger } from './decorators/swagger/submit-onboarding-request.decorator';
import { FORMS_ERRORS } from './constants/forms.constants';

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
}
