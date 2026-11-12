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
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { AssignUnitDto } from './dto/assign-unit.dto.js';
import { Roles } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/index.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async assignUnit(
    @Param('id') id: string,
    @Body() assignUnitDto: AssignUnitDto,
  ) {
    return this.usersService.assignUnit(id, assignUnitDto);
  }
}
