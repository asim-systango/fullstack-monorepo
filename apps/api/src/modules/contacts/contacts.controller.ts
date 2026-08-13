import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { User } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateContact } from './decorators/swagger/create-contact.decorator';
import { CONTACTS_ERRORS } from './constants/contacts.constants';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('api/v1/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SwaggerCreateContact()
  async createContact(
    @Body() createContactDto: CreateContactDto,
    @CurrentUser() user: User,
  ) {
    try {
      const contact = await this.contactsService.createContact(createContactDto, user);

      return {
        message: 'Contact created successfully',
        data: contact,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case CONTACTS_ERRORS.USER_NO_ORG:
            throw new ForbiddenException(error.message);
          case CONTACTS_ERRORS.EMAIL_EXISTS:
          case CONTACTS_ERRORS.PHONE_EXISTS:
            throw new ConflictException(error.message);
          default:
            throw new InternalServerErrorException(error.message);
        }
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
