import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Public } from '../auth/decorators/index.js';
import { Roles } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/index.js';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // Public and unauthenticated, so cap how often one client can submit.
  @Public()
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateBookingDto);
  }
}
