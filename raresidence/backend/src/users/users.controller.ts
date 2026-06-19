import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

// 1. Create an interface to define exactly what a "User" looks like
interface User {
  id: string;
  name: string;
  surname: string;
}

@Controller('users')
export class UsersController {
  // 2. Tell TypeScript: "This is an array of User objects"
  private usersDatabase: User[] = [];

  @Get()
  findAll() {
    return this.usersDatabase;
  }

  @Get('profile/:id')
  findProfile(@Param('id') id: string) {
    console.log('Searching for ID:', id);

    // TypeScript now knows 'user' has an 'id' property!
    const foundUser = this.usersDatabase.find((user) => user.id === id);

    if (!foundUser) {
      return { message: `User with ID ${id} not found!` };
    }

    return foundUser;
  }

  @Post()
  create(@Body() input: any) {
    console.log('Received data from Postman:', input);

    // 3. (Optional but good practice) We can explicitly type this variable too
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: input.name,
      surname: input.surname
    };

    this.usersDatabase.push(newUser);

    return {
      message: 'User created successfully!',
      user: newUser,
    };
  }

  @Delete('reset')
  resetDatabase() {
    this.usersDatabase = [];

    console.log('Database has been reset!');

    return { message: 'Database reset successfully!' };
  }
}
