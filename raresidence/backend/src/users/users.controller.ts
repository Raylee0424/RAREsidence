import { Body, Controller, Delete, Get, Param, Post, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { User } from './fakedatabase';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(): User[] {
    return this.usersService.getAllUsers();
  }

  @Get('getById/:id')
  getUserById(@Param('id') id: number): User | undefined {
    const userID = Number(id);
    return this.usersService.findById(userID);
  }

  @Post()
  create(@Body() user: Partial<User>): User {
    const userData = user;

    if (!user.name) {
      throw new BadRequestException('Name is required!');
    }

    return this.usersService.create(userData);
  }
}
