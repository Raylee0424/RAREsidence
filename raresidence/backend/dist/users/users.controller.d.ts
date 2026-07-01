import { UsersService } from './users.service';
import type { User } from './fakedatabase';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): User[];
    getUserById(id: number): User | undefined;
    create(user: Partial<User>): User;
}
