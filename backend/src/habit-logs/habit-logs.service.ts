import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitLog } from './habit-log.entity';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';

const MOCK_USER_ID = '9198967e-8909-4055-8ab8-60f0f7e24294';

const toDateStr = (val: unknown): string => {
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val).slice(0, 10);
};

@Injectable()
export class HabitLogsService {
  constructor(
    @InjectRepository(HabitLog)
    private readonly logRepo: Repository<HabitLog>,
  ) {}

  findByDate(date: string): Promise<HabitLog[]> {
    return this.logRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.userHabit', 'uh')
      .leftJoinAndSelect('uh.habit', 'habit')
      .where('uh.userId = :userId', { userId: MOCK_USER_ID })
      .andWhere('log.date = :date', { date })
      .getMany();
  }

  async upsertLog(dto: CreateHabitLogDto): Promise<HabitLog> {
    const existing = await this.logRepo.findOne({
      where: { userHabitId: dto.userHabitId, date: dto.date },
    });

    if (existing) {
      existing.value = dto.value ?? existing.value;
      existing.completed = dto.completed;
      existing.xpEarned = dto.xpEarned ?? existing.xpEarned;
      return this.logRepo.save(existing);
    }

    const log = this.logRepo.create({
      userHabitId: dto.userHabitId,
      date: dto.date,
      value: dto.value,
      completed: dto.completed,
      xpEarned: dto.xpEarned ?? 0,
    });
    return this.logRepo.save(log);
  }

  async getHeatmap(): Promise<{ date: string; completions: number }[]> {
    const start = new Date();
    start.setDate(start.getDate() - 90);
    const startStr = start.toISOString().split('T')[0];

    const rows = await this.logRepo
      .createQueryBuilder('log')
      .leftJoin('log.userHabit', 'uh')
      .select('log.date', 'date')
      .addSelect('COUNT(*) FILTER (WHERE log.completed = true)', 'completions')
      .where('uh.userId = :userId', { userId: MOCK_USER_ID })
      .andWhere('log.date >= :start', { start: startStr })
      .groupBy('log.date')
      .orderBy('log.date', 'ASC')
      .getRawMany<{ date: unknown; completions: string }>();

    return rows.map(r => ({
      date: toDateStr(r.date),
      completions: parseInt(r.completions, 10),
    }));
  }

  async getStreak(): Promise<{ streak: number }> {
    // Only count days where every active habit was completed
    const rows = await this.logRepo
      .createQueryBuilder('log')
      .leftJoin('log.userHabit', 'uh')
      .select('log.date', 'date')
      .where('uh.userId = :userId', { userId: MOCK_USER_ID })
      .groupBy('log.date')
      .having(
        `COUNT(*) FILTER (WHERE log.completed = true) >= (
          SELECT COUNT(*) FROM user_habits WHERE user_id = :userId AND is_active = true
        )`,
        { userId: MOCK_USER_ID },
      )
      .getRawMany<{ date: unknown }>();

    if (rows.length === 0) return { streak: 0 };

    const dateSet = new Set(rows.map(r => toDateStr(r.date)));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = new Date(today);
    if (!dateSet.has(toDateStr(current))) {
      current.setDate(current.getDate() - 1);
    }

    let streak = 0;
    while (dateSet.has(toDateStr(current))) {
      streak++;
      current.setDate(current.getDate() - 1);
    }

    return { streak };
  }
}
