import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
