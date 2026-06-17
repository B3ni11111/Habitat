import { Controller, Get } from '@nestjs/common';
import { HabitsService } from './habits.service';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get('catalog')
  getCatalog() {
    return this.habitsService.findAll();
  }
}
