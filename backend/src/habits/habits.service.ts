import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from './habit.entity';
import { CreateHabitDto } from './dto/create-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepo: Repository<Habit>,
  ) {}

  findAll(userId: string) {
    return this.habitRepo.find({
      where: { userId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const habit = await this.habitRepo.findOne({ where: { id }, relations: ['category', 'logs'] });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();
    return habit;
  }

  create(dto: CreateHabitDto, userId: string) {
    const habit = this.habitRepo.create({ ...dto, userId });
    return this.habitRepo.save(habit);
  }

  async update(id: string, dto: Partial<CreateHabitDto>, userId: string) {
    const habit = await this.findOne(id, userId);
    Object.assign(habit, dto);
    return this.habitRepo.save(habit);
  }

  async remove(id: string, userId: string) {
    const habit = await this.findOne(id, userId);
    return this.habitRepo.remove(habit);
  }
}
