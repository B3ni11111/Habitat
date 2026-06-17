# Habit Tracker - Claude Code Guidelines

## Project Overview
Full stack habit tracker app. React + NestJS + PostgreSQL.
Goal: learn DevOps and deploy to Oracle Cloud (OCI).

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript + TypeORM
- Database: PostgreSQL (local: localhost:5432, db: habit_tracking)
- Auth: JWT
- Deployment target: OCI VM + Docker Compose + Nginx

## Project Structure
habit-tracker/
├── frontend/   (React + Vite)
├── backend/    (NestJS)
└── docker-compose.yml

## Database Schema
- users (id UUID, email, password_hash, name, avatar_url, created_at)
- categories (id SERIAL, name, icon) — seed data, don't modify
- habits (id UUID, user_id FK, category_id FK, name, target, unit, frequency)
- habit_logs (id UUID, habit_id FK, date, value, completed, created_at)
- UNIQUE constraint on (habit_id, date) in habit_logs

## Code Style
- Always use TypeScript, never plain JS
- Use async/await, never .then()
- DTOs for all API inputs
- Descriptive variable names in English
- Keep components small and focused

## Backend Rules
- TypeORM entities must match the schema exactly
- Use ConfigService for all env variables, never hardcode
- All routes protected with JWT guard except /auth/register and /auth/login
- Return consistent response shapes: { data, message }

## Frontend Rules
- All API calls go through a central axios instance (src/api/axios.ts)
- Store JWT token in localStorage
- Use React Router for navigation
- Tailwind only for styling, no inline styles

## Key Features to Build (MVP)
1. Register / Login
2. Create a habit (name, target, unit, category, frequency)
3. Daily check-in (log value for today)
4. Streak counter
5. GitHub-style heatmap (green squares per day)

## What NOT to do
- Don't add a Postgres container to docker-compose — local Postgres is used in dev
- Don't use class-based React components
- Don't use any, always type everything
- Don't create unnecessary abstractions


## Claude Code Self-Update Rules
- After every significant feature completed, update this file
- Update the "Current State" section with what was built
- Add any new patterns or decisions made during development
- Add any bugs found and how they were solved
- Keep the "What's Next" section current

## Current State
- [ ] Project scaffolded
- [ ] Database created and tables migrated
- [ ] Auth working
- [ ] Habits CRUD working
- [ ] Daily check-in working
- [ ] Streak logic working
- [ ] Heatmap working

## What's Next
- scaffold the full stack project