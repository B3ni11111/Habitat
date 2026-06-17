import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';

@Controller('habit-logs')
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  // heatmap and streak must be declared before @Get() to avoid route conflicts
  @Get('heatmap')
  getHeatmap() {
    return this.habitLogsService.getHeatmap();
  }

  @Get('streak')
  getStreak() {
    return this.habitLogsService.getStreak();
  }

  @Get()
  findByDate(@Query('date') date: string) {
    return this.habitLogsService.findByDate(date);
  }

  @Post()
  upsertLog(@Body() dto: CreateHabitLogDto) {
    return this.habitLogsService.upsertLog(dto);
  }
}
