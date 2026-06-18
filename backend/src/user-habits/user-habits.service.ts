import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHabit } from './user-habit.entity';
import { CreateUserHabitDto } from './dto/create-user-habit.dto';
import { UpdateUserHabitDto } from './dto/update-user-habit.dto';

const MOCK_USER_ID = '9198967e-8909-4055-8ab8-60f0f7e24294';

@Injectable()
export class UserHabitsService {
  constructor(
    @InjectRepository(UserHabit)
    private readonly userHabitRepo: Repository<UserHabit>,
  ) {}

  findAll(): Promise<UserHabit[]> {
    return this.userHabitRepo.find({
      where: { userId: MOCK_USER_ID, isActive: true },
      relations: ['habit'],
      order: { createdAt: 'ASC' },
    });
  }

  create(dto: CreateUserHabitDto): Promise<UserHabit> {
    const userHabit = this.userHabitRepo.create({
      userId: MOCK_USER_ID,
      habitId: dto.habitId,
      customTarget: dto.customTarget,
      isActive: true,
    });
    return this.userHabitRepo.save(userHabit);
  }

  async update(id: string, dto: UpdateUserHabitDto): Promise<UserHabit> {
    const userHabit = await this.userHabitRepo.findOne({
      where: { id, userId: MOCK_USER_ID },
      relations: ['habit'],
    });
    if (!userHabit) throw new NotFoundException('User habit not found');
    if (dto.customTarget !== undefined) userHabit.customTarget = dto.customTarget ?? undefined;
    return this.userHabitRepo.save(userHabit);
  }

  async remove(id: string): Promise<void> {
    const userHabit = await this.userHabitRepo.findOne({
      where: { id, userId: MOCK_USER_ID },
    });
    if (!userHabit) throw new NotFoundException('User habit not found');
    await this.userHabitRepo.remove(userHabit);
  }
}
