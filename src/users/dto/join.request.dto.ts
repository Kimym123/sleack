import { PickType } from '@nestjs/mapped-types';
import { Users } from '../../entities/Users';

export class JoinRequestDto extends PickType(Users, [
  'email',
  'nickname',
  'password',
] as const) {}
