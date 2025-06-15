import * as request from 'supertest';
import { ResponseLogin } from '../../src/auth/interfaces/response-login.interface';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UsersService } from '../../src/users/users.service';
import { AuthService } from '../../src/auth/auth.service';

export const getAuthorizeToken = async (
  app: INestApplication<App>,
  options: {
    services: { usersService: UsersService; authService: AuthService };
    userOptions: { phone: string; nickname: string; password: string };
  },
) => {
  const password = await options.services.authService.generatePasswordHash(
    options.userOptions.password,
  );

  const user = await options.services.usersService.createUser({
    phone: options.userOptions.phone,
    password,
    nickname: options.userOptions.nickname,
  });

  const result: { body: ResponseLogin } = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      phone: options.userOptions.phone,
      password: options.userOptions.password,
    });

  return { user, tokens: result.body };
};
