/* eslint-disable @typescript-eslint/no-unused-vars */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ResponseLogin } from './interfaces/response-login.interface';
import { ErorCodes } from '../errors';
import { RegisterDto } from './dto/register.dto.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    const compared = user ? bcrypt.compareSync(password, user.password) : false;

    if (user && compared) {
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  login(user: User): ResponseLogin {
    const payload = { id: user.id, nickname: user.nickname, name: user.name };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '2h' }),
    };
  }

  generatePasswordHash(password: string, rounds = 10) {
    return bcrypt.hash(password, rounds);
  }

  async register(body: RegisterDto) {
    const existingUserByPhone = await this.usersService.findByPhone(body.phone);

    if (existingUserByPhone) {
      throw new HttpException(
        ErorCodes.UserWithPhoneAlreadyExist,
        HttpStatus.CONFLICT,
      );
    }

    const existingUserByNickname = await this.usersService.findByNickname(
      body.nickname,
    );

    if (existingUserByNickname) {
      throw new HttpException(
        ErorCodes.UserWithNicknameAlreadyExist,
        HttpStatus.CONFLICT,
      );
    }

    return this.usersService.createUser({
      phone: body.phone,
      password: await this.generatePasswordHash(body.password),
      nickname: body.nickname,
    });
  }
}
