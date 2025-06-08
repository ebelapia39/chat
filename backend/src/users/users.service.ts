import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: UserEntity[] = [
    {
      id: 1,
      phone: '79999999999',
      password: '12345',
    },
    {
      id: 2,
      phone: '78888888888',
      password: '12345',
    },
  ];

  findByPhone(phone: string) {
    return this.users.find((user) => user.phone === phone);
  }
}
