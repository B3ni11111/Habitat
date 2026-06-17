import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { UserHabitsService } from './user-habits.service';
import { CreateUserHabitDto } from './dto/create-user-habit.dto';

@Controller('user-habits')
export class UserHabitsController {
  constructor(private readonly userHabitsService: UserHabitsService) {}

  @Get()
  findAll() {
    return this.userHabitsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserHabitDto) {
    return this.userHabitsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userHabitsService.remove(id);
  }
}
