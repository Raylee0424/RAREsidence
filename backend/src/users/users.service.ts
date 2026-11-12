import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { AssignUnitDto } from './dto/assign-unit.dto.js';

const tenantSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  unitId: true,
  unit: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: 'TENANT' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        unitId: true,
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        unitId: true,
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const unitId = createUserDto.unitId ?? null;

    // Creating the account and moving into the unit succeed or fail together.
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          name: createUserDto.name,
          phone: createUserDto.phone,
          role: 'TENANT',
        },
      });
      await this.moveTenant(tx, user.id, null, unitId);
      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: tenantSelect,
      });
    });
  }

  async assignUnit(id: string, assignUnitDto: AssignUnitDto) {
    const unitId = assignUnitDto.unitId ?? null;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.role !== 'TENANT') {
        throw new BadRequestException('Only tenants can be assigned to units');
      }

      await this.moveTenant(tx, id, user.unitId, unitId);
      return tx.user.findUniqueOrThrow({ where: { id }, select: tenantSelect });
    });
  }

  // The one place a tenant's unit changes, so unit status can't drift:
  // the new unit becomes OCCUPIED and an emptied unit becomes AVAILABLE.
  private async moveTenant(
    tx: Prisma.TransactionClient,
    tenantId: string,
    fromUnitId: string | null,
    toUnitId: string | null,
  ) {
    if (fromUnitId === toUnitId) {
      return;
    }

    if (toUnitId) {
      const unit = await tx.unit.findUnique({
        where: { id: toUnitId },
        include: {
          tenants: { where: { id: { not: tenantId } }, select: { name: true } },
        },
      });
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      if (unit.status === 'MAINTENANCE') {
        throw new ConflictException(
          `${unit.name} is under maintenance and can't be assigned`,
        );
      }
      if (unit.tenants.length > 0) {
        throw new ConflictException(
          `${unit.name} is already occupied by ${unit.tenants[0].name}. Unassign them first.`,
        );
      }
    }

    await tx.user.update({
      where: { id: tenantId },
      data: { unitId: toUnitId },
    });

    if (toUnitId) {
      await tx.unit.update({
        where: { id: toUnitId },
        data: { status: 'OCCUPIED' },
      });
    }

    if (fromUnitId) {
      // Leave MAINTENANCE alone; only an occupied unit with nobody left frees up.
      await tx.unit.updateMany({
        where: {
          id: fromUnitId,
          status: 'OCCUPIED',
          tenants: { none: {} },
        },
        data: { status: 'AVAILABLE' },
      });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        unitId: true,
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
            priceCents: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
