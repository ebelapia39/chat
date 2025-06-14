import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.truncateAllTables();
  });

  afterAll(async () => {
    await prismaService.truncateAllTables();
    await prismaService.$disconnect();
  });

  describe('auth', () => {
    describe('auth/register (POST)', () => {
      it('check success registration', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({ phone: '79912345678', password: '12345', nickname: 'test' })
          .expect(201);
      });
    });
  });
});
