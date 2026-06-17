import {
  Controller, Get, Post, Body, Param, Delete,
  UseGuards, Request, Query,
} from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('habit-logs')
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @Get()
  findAll(@Request() req, @Query('habitId') habitId?: string) {
    return this.habitLogsService.findAll(req.user.id, habitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.habitLogsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateHabitLogDto, @Request() req) {
    return this.habitLogsService.create(dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.habitLogsService.remove(id, req.user.id);
  }
}
