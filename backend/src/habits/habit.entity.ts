import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type HabitType = 'numeric' | 'boolean';

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'varchar' })
  type: HabitType;

  @Column({ name: 'xp_value', default: 10 })
  xpValue: number;

  @Column({ nullable: true })
  category: string;
}
