import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: Record<string, string>): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
    }>;
}
