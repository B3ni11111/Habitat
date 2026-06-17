import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHabit } from './user-habit.entity';
import { UserHabitsService } from './user-habits.service';
import { UserHabitsController } from './user-habits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserHabit])],
  providers: [UserHabitsService],
  controllers: [UserHabitsController],
})
export class UserHabitsModule {}
