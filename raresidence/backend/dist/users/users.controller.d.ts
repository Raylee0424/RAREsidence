interface User {
    id: string;
    name: string;
    surname: string;
}
export declare class UsersController {
    private usersDatabase;
    findAll(): User[];
    findProfile(id: string): User | {
        message: string;
    };
    create(input: any): {
        message: string;
        user: User;
    };
    resetDatabase(): {
        message: string;
    };
}
export {};
