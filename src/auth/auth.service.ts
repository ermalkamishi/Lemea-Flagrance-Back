import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Compared against when the email doesn't exist (never matches a real password)
const DUMMY_HASH = bcrypt.hashSync('lemea-timing-equalizer-not-a-password', 10);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    // Always run bcrypt, even for unknown emails, so the response time doesn't
    // reveal which emails have an account.
    const passwordMatches = await bcrypt.compare(pass, user?.password || DUMMY_HASH);
    if (user && user.password && passwordMatches) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    // UsersService.create hashes the password and strips it from the result
    return this.usersService.create(createUserDto);
  }
}
