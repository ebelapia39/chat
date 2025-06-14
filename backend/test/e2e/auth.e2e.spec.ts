import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let authService: AuthService;

  const newUser = { phone: '79999999999', password: '12345', nickname: 'test' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);

    app = moduleFixture.createNestApplication();
    await app.init();
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
      await authService.register(newUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          phone: newUser.phone,
          password: newUser.password,
        })
        .expect(201);
    });
  });

  describe('auth/register (POST)', () => {
    it('check success registration', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);
    });
  });
});
