import { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';

export interface RequestUser extends Request {
  user: UserEntity;
}
