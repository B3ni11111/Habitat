import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from './habit.entity';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepo: Repository<Habit>,
  ) {}

  findAll(): Promise<Habit[]> {
    return this.habitRepo.find({ order: { name: 'ASC' } });
  }
}
