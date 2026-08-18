import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles, CurrentUser, Public } from '../../common/auth';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'List quizzes' })
  @ApiOkResponse({ description: 'Quiz list returned' })
  findAll(@Query('courseId') courseId?: string) {
    return this.quizzesService.findAll(courseId);
  }

  @Public()
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get quiz details' })
  @ApiOkResponse({ description: 'Quiz details returned' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Roles('staff', 'admin')
  @Post()
  @HttpCode(201)
  @ApiBody({ type: CreateQuizDto })
  @ApiOperation({ summary: 'Create a quiz' })
  @ApiCreatedResponse({ description: 'Quiz created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() dto: CreateQuizDto, @CurrentUser() user: JwtUser) {
    return this.quizzesService.create(dto, user);
  }

  @Roles('staff', 'admin')
  @Patch(':id')
  @HttpCode(200)
  @ApiBody({ type: UpdateQuizDto })
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiOkResponse({ description: 'Quiz updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.quizzesService.update(id, dto, user);
  }

  @Roles('staff', 'admin')
  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiOkResponse({ description: 'Quiz deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.quizzesService.remove(id, user);
  }
}
