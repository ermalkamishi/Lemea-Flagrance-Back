import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /** Creates a user. The plain-text password is always hashed here. */
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.usersRepository.save(newUser);
    const { password, ...result } = saved;
    return result;
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Explicitly select password for auth validation
  findOneByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: UpdateUserDto = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }
    return this.usersRepository.update(id, data);
  }

  async remove(id: string) {
    await this.usersRepository.delete(id);
  }
}
