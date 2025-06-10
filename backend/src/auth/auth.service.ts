/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterBody } from './interfaces/register.interface';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);

    if (user && user.password === password) {
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  login(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '2h' }),
    };
  }

  register(body: RegisterBody) {
    return this.usersService.createUser({
      phone: body.phone,
      password: body.password,
      nickname: body.nickname,
    });
  }
}
