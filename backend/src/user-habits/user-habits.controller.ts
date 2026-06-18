import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { UserHabitsService } from './user-habits.service';
import { CreateUserHabitDto } from './dto/create-user-habit.dto';
import { UpdateUserHabitDto } from './dto/update-user-habit.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserHabitDto) {
    return this.userHabitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userHabitsService.remove(id);
  }
}
