import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { Roles } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/index.js';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('my')
  async findMyPayments(@Request() req: any) {
    return this.paymentsService.findByTenant(req.user.id);
  }

  @Get('my-payments')
  async findMyPaymentsAlias(@Request() req: any) {
    return this.paymentsService.findByTenant(req.user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  // A tenant reports that they've paid; an admin confirms it via PATCH.
  @Post(':id/report')
  async reportPaid(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.reportPaid(id, req.user.id);
  }
}
