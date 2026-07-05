import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            email: string;
            id: number;
        };
    }>;
    signIn(signInDto: SignInDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
        };
    }>;
    findOne(id: number): Promise<{
        email: string;
        id: number;
    }>;
}
