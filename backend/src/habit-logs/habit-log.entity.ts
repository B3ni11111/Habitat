import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { UserHabit } from '../user-habits/user-habit.entity';

@Entity('habit_logs')
@Unique(['userHabitId', 'date'])
export class HabitLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_habit_id' })
  userHabitId: string;

  @ManyToOne(() => UserHabit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_habit_id' })
  userHabit: UserHabit;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'numeric', nullable: true })
  value: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ name: 'xp_earned', default: 0 })
  xpEarned: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
