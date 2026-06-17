import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitLog } from './habit-log.entity';
import { HabitLogsService } from './habit-logs.service';
import { HabitLogsController } from './habit-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HabitLog])],
  providers: [HabitLogsService],
  controllers: [HabitLogsController],
})
export class HabitLogsModule {}
