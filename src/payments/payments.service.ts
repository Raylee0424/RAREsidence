import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async findByTenant(tenantId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const tenant = await this.prisma.user.findUnique({
      where: { id: createPaymentDto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const unit = await this.prisma.unit.findUnique({
      where: { id: createPaymentDto.unitId },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return this.prisma.payment.create({
      data: {
        tenantId: createPaymentDto.tenantId,
        unitId: createPaymentDto.unitId,
        amountCents: createPaymentDto.amountCents,
        type: createPaymentDto.type,
        dueDate: new Date(`${createPaymentDto.dueDate}T00:00:00.000Z`),
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

  // Admin only: the single place a payment can become PAID.
  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const isPaid = updatePaymentDto.status === 'PAID';
    const data: Prisma.PaymentUpdateInput = {
      status: updatePaymentDto.status,
      paidAt: isPaid
        ? updatePaymentDto.paidAt
          ? new Date(updatePaymentDto.paidAt)
          : new Date()
        : null,
    };

    return this.prisma.payment.update({
      where: { id },
      data,
      include: this.paymentInclude,
    });
  }

  // Tenant only: flags their own payment for an admin to confirm.
  async reportPaid(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    // Treat other tenants' payments as missing so ids can't be probed.
    if (!payment || payment.tenantId !== tenantId) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== 'PENDING' && payment.status !== 'OVERDUE') {
      throw new BadRequestException(
        'Only pending or overdue payments can be reported as paid',
      );
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: this.paymentInclude,
    });
  }

  private readonly paymentInclude = {
    tenant: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    unit: {
      select: {
        id: true,
        name: true,
        address: true,
      },
    },
  } satisfies Prisma.PaymentInclude;
}
