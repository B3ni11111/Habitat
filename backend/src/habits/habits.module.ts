import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habit } from './habit.entity';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Habit])],
  providers: [HabitsService],
  controllers: [HabitsController],
})
export class HabitsModule {}
