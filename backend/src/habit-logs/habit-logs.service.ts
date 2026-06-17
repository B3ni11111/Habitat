import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitLog } from './habit-log.entity';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';

@Injectable()
export class HabitLogsService {
  constructor(
    @InjectRepository(HabitLog)
    private readonly logRepo: Repository<HabitLog>,
  ) {}

  findAll(userId: string, habitId?: string) {
    const where: any = { userId };
    if (habitId) where.habitId = habitId;
    return this.logRepo.find({ where, relations: ['habit'], order: { completedAt: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const log = await this.logRepo.findOne({ where: { id } });
    if (!log) throw new NotFoundException('Habit log not found');
    if (log.userId !== userId) throw new ForbiddenException();
    return log;
  }

  create(dto: CreateHabitLogDto, userId: string) {
    const log = this.logRepo.create({ ...dto, userId });
    return this.logRepo.save(log);
  }

  async remove(id: string, userId: string) {
    const log = await this.findOne(id, userId);
    return this.logRepo.remove(log);
  }
}
