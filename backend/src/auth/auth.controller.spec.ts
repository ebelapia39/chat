import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import jwtConfig from '../../config/jwt.config';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { INestApplication } from '@nestjs/common';
import { ResponseLogin } from './interfaces/response-login.interface';
// import { PrismaService } from '../prisma.service';

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;
  // let prismaService: PrismaService;
  const validUser = {
    phone: '79999999999',
    password: '12345',
  };
  const invalidUser = {
    phone: '79999999999',
    password: '123456',
  };

  // beforeEach(async () => {
  //   await prismaService.$executeRawUnsafe(`TRUNCATE TABLE users`);
  // });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
      ],
      controllers: [AuthController],
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    controller = module.get(AuthController);
    // prismaService = module.get(PrismaService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST auth/login', () => {
    it('check success authentication', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(validUser)
        .expect(201);
    });

    it('check response access/refresh token', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validUser)
        .expect(201);

      const body = result.body as ResponseLogin;

      expect(body.access_token).toBeDefined();
      expect(body.refresh_token).toBeDefined();
    });

    it('check failed authentication', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidUser)
        .expect(401);
    });
  });

  // describe('POST auth/register', () => {
  //   it('check success registration', () => {
  //     return request(app.getHttpServer())
  //       .post('/auth/register')
  //       .send({ phone: '79912345678', password: '12345', nickname: 'test' })
  //       .expect(201);
  //   });
  // });

  describe('GET auth/me', () => {});
});
