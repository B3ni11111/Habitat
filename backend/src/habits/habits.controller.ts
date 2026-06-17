import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Request,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@Request() req) {
    return this.habitsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.habitsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateHabitDto, @Request() req) {
    return this.habitsService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateHabitDto, @Request() req) {
    return this.habitsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.habitsService.remove(id, req.user.id);
  }
}
