import { Injectable } from '@nestjs/common';
import { UsersRepository } from './user.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  findByPhone(phone: string) {
    return this.userRepository.user({ phone });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.userRepository.createUser(data);
  }
}
