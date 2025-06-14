import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  truncateTableUsers() {
    return this.$queryRawUnsafe('TRUNCATE "User" CASCADE');
  }

  truncateAllTables() {
    return Promise.all([this.truncateTableUsers()]);
  }
}
