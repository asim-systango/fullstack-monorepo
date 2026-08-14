import {
  Controller,
  Get,
  Post,
  Body,
  Query,
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
import { GetContactsDto } from './dto/get-contacts.dto';
import { User } from '../../database/entities/user.entity';
import { RoleName } from '../../database/entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/auth';
import { SwaggerCreateContact } from './decorators/swagger/create-contact.decorator';
import { SwaggerGetContacts } from './decorators/swagger/get-contacts.decorator';
import { CONTACTS_ERRORS, CONTACTS_MESSAGES } from './constants/contacts.constants';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('api/v1/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SwaggerGetContacts()
  async getContacts(@CurrentUser() user: User, @Query() query: GetContactsDto) {
    try {
      const result = await this.contactsService.getContacts(
        user.id,
        user.organizationId as string,
        user.role?.name as RoleName,
        query,
      );
      return { message: CONTACTS_MESSAGES.CONTACTS_RETRIEVED, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // eslint-disable-next-line sonarjs/no-small-switch
      switch (message) {
        case CONTACTS_ERRORS.USER_NO_ORG:
          throw new ForbiddenException(message);
        default:
          console.error('Error in getContacts:', error);
          throw new InternalServerErrorException(CONTACTS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @SwaggerCreateContact()
  async createContact(
    @Body() createContactDto: CreateContactDto,
    @CurrentUser() user: User,
  ) {
    try {
      const contact = await this.contactsService.createContact(createContactDto, user);

      return {
        message: CONTACTS_MESSAGES.CONTACT_CREATED,
        data: contact,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      switch (message) {
        case CONTACTS_ERRORS.USER_NO_ORG:
          throw new ForbiddenException(message);
        case CONTACTS_ERRORS.EMAIL_EXISTS:
        case CONTACTS_ERRORS.PHONE_EXISTS:
          throw new ConflictException(message);
        default:
          console.error('Error in createContact:', error);
          throw new InternalServerErrorException(CONTACTS_ERRORS.UNEXPECTED_ERROR);
      }
    }
  }
}
