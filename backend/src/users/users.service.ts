import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

const MOCK_USER_ID = '9198967e-8909-4055-8ab8-60f0f7e24294';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getMe(): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: MOCK_USER_ID } });
    if (!user) throw new NotFoundException('Mock user not found in DB');
    return user;
  }
}
