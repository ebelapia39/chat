import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { ResponseLogin } from '../../src/auth/interfaces/response-login.interface';
import { UsersService } from '../../src/users/users.service';
import { AuthService } from '../../src/auth/auth.service';
import { ErorCodes } from '../../src/errors';
import { getAuthorizeToken } from '../utils/getAuthorizeToken';
import { ResponseMe } from '../../src/auth/interfaces/response-me.interface';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let authService: AuthService;
  let newUser: { phone: string; password: string; nickname: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = moduleFixture.get(PrismaService);
    usersService = moduleFixture.get(UsersService);
    authService = moduleFixture.get(AuthService);

    app = moduleFixture.createNestApplication();
    await app.init();

    newUser = {
      phone: '79999999999',
      password: await authService.generatePasswordHash('12345'),
      nickname: 'test',
    };
  });

  beforeEach(async () => {
    await prismaService.truncateAllTables();
  });

  afterAll(async () => {
    await prismaService.truncateAllTables();
    await prismaService.$disconnect();
  });

  describe('auth/login (POST)', () => {
    it('check success authentication', async () => {
      await usersService.createUser(newUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: newUser.phone,
          password: '12345',
        })
        .expect(201);
    });

    it('check valid response authentication', async () => {
      await usersService.createUser(newUser);

      const result: { body: ResponseLogin } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: newUser.phone,
          password: '12345',
        })
        .expect(201);

      expect(result.body.access_token).toBeDefined();
      expect(result.body.refresh_token).toBeDefined();
    });

    it('check failed authentication with not valid password', async () => {
      await usersService.createUser(newUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: newUser.phone,
          password: 'not walid password',
        })
        .expect(401);
    });

    it('check failed authentication with not valid phone', async () => {
      await usersService.createUser(newUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: 'not valid phone',
          password: newUser.password,
        })
        .expect(401);
    });
  });

  describe('auth/register (POST)', () => {
    it('check success registration', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);
    });

    it('check failed registration with existing phone', async () => {
      await usersService.createUser(newUser);

      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: newUser.phone,
          password: newUser.password,
          nickname: 'not_existing',
        })
        .expect(409);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.body.message).toEqual(ErorCodes.UserWithPhoneAlreadyExist);
    });

    it('check failed registration with existing nickname', async () => {
      await usersService.createUser(newUser);

      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: 'not existing',
          password: newUser.password,
          nickname: newUser.nickname,
        })
        .expect(409);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.body.message).toEqual(
        ErorCodes.UserWithNicknameAlreadyExist,
      );
    });
  });

  describe('auth/me (GET)', () => {
    it('get 401 status without Bearer token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('get 200 status with Bearer token', async () => {
      const auth = await getAuthorizeToken(app, {
        services: { authService, usersService },
        userOptions: {
          phone: '79999999999',
          nickname: 'test',
          password: '12345',
        },
      });

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${auth.tokens.access_token}`)
        .expect(200);
    });

    it('check response without password', async () => {
      const auth = await getAuthorizeToken(app, {
        services: { authService, usersService },
        userOptions: {
          phone: '79999999999',
          nickname: 'test',
          password: '12345',
        },
      });

      const result: { body: ResponseMe } = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${auth.tokens.access_token}`)
        .expect(200);

      expect(result.body.user).toBeDefined();
      expect(result.body.user.id).toEqual(auth.user.id);
      expect(result.body.user.name).toEqual(auth.user.name);
      expect(result.body.user.nickname).toEqual(auth.user.nickname);
      expect(result.body.user.password).toBeUndefined();
    });

    it('check valid response user', async () => {
      const auth = await getAuthorizeToken(app, {
        services: { authService, usersService },
        userOptions: {
          phone: '79999999999',
          nickname: 'test',
          password: '12345',
        },
      });

      const result: { body: ResponseMe } = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${auth.tokens.access_token}`)
        .expect(200);

      expect(result.body.user).toBeDefined();
      expect(result.body.user.id).toEqual(auth.user.id);
      expect(result.body.user.name).toEqual(auth.user.name);
      expect(result.body.user.nickname).toEqual(auth.user.nickname);
      expect(Object.keys(result.body.user).length).toEqual(3);
    });
  });
});
