import { Injectable } from '@nestjs/common';
import { User, users} from './fakedatabase';

@Injectable()
export class UsersService {
  getAllUsers(): User[] {
    return users;
  }

  findById(userId: number): User | undefined {
    return users.find((user) => user.id === userId);
  }

  create(user: Partial<User>): User {
    const newID = users[users.length-1].id + 1
    const newUser = {...user, id: newID} as User;

    users.push(newUser);
    return newUser;
  }
}