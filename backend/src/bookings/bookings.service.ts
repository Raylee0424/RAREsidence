import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

const MAX_DAYS_AHEAD = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

// Turns "YYYY-MM-DD" into a Date at UTC midnight after checking it's a real
// date, not in the past, and not absurdly far out.
function parseViewingDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  // Rejects impossible dates like 2026-02-31, which Date would roll forward.
  if (Number.isNaN(date.getTime()) || toDateString(date) !== value) {
    throw new BadRequestException('preferredDate is not a valid date');
  }

  // The server doesn't know the guest's time zone. A date is only "past" if
  // it's past everywhere, i.e. before today in UTC-12, the last zone on Earth.
  const now = Date.now();
  const earliestToday = toDateString(new Date(now - 12 * 60 * 60 * 1000));
  if (value < earliestToday) {
    throw new BadRequestException(
      'Please choose a date that is not in the past',
    );
  }
  if (value > toDateString(new Date(now + MAX_DAYS_AHEAD * DAY_MS))) {
    throw new BadRequestException(
      'Please choose a date within the next 12 months',
    );
  }
  return date;
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    const preferredDate = parseViewingDate(createBookingDto.preferredDate);

    const unit = await this.prisma.unit.findUnique({
      where: { id: createBookingDto.unitId },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    if (unit.status !== 'AVAILABLE') {
      throw new ConflictException(
        `${unit.name} isn't available for viewings right now`,
      );
    }

    const guestEmail = createBookingDto.guestEmail.toLowerCase();
    const existing = await this.prisma.booking.findFirst({
      where: { unitId: unit.id, guestEmail, status: 'PENDING' },
    });
    if (existing) {
      throw new ConflictException(
        `You already have a pending viewing request for ${unit.name}. We'll be in touch soon.`,
      );
    }

    return this.prisma.booking.create({
      data: {
        unitId: unit.id,
        guestName: createBookingDto.guestName,
        guestEmail,
        guestPhone: createBookingDto.guestPhone,
        preferredDate,
        message: createBookingDto.message || null,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: updateBookingDto.status,
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }
}
