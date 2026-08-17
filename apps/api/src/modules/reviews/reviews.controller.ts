import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser, Public, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('hotels/:hotelId/reviews')
  @Public()
  findByHotel(@Param('hotelId', ParseUUIDPipe) hotelId: string) {
    return this.reviewsService.findByHotel(hotelId);
  }

  @Post('reviews')
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: JwtUser) {
    return this.reviewsService.create(dto, user.id);
  }

  @Delete('reviews/:id')
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
