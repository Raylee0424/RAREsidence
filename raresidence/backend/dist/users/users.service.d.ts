import { User } from './fakedatabase';
export declare class UsersService {
    getAllUsers(): User[];
    findById(userId: number): User | undefined;
    create(user: Partial<User>): User;
}
