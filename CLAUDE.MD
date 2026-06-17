# Habit Tracker - Claude Code Guidelines

## Project Overview
Full stack habit tracker app. React + NestJS + PostgreSQL.
Goal: learn DevOps and deploy to Oracle Cloud (OCI).
GitHub: https://github.com/B3ni11111/Habitat

## Stack
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS (port 5173)
- Backend: NestJS + TypeScript + TypeORM (port 3000)
- Database: PostgreSQL (localhost:5432, db: habit_tracking, user: postgres)
- Auth: Oracle IAM (planned for OCI deploy) — no auth in local dev
- Deployment target: OCI VM + Docker Compose + Nginx

## Project Structure
```
habit-tracker/
├── frontend/
│   ├── src/
│   │   ├── api/axios.ts          ← bare axios instance, no auth headers
│   │   ├── components/Navbar.tsx  ← pastel sticky nav, Dashboard + My Habits links
│   │   └── pages/
│   │       ├── DashboardPage.tsx  ← real API data, 3-column desktop grid
│   │       └── HabitsPage.tsx     ← catalog browser + user-habits management
│   ├── .env.example
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── users/
│   │   ├── habits/                ← catalog (read-only)
│   │   ├── user-habits/           ← user ↔ catalog join table
│   │   └── habit-logs/            ← daily check-ins
│   ├── .env.example
│   └── Dockerfile
└── docker-compose.yml
```

## Database Schema
- habits (id UUID PK, name, icon varchar, unit varchar, type ENUM numeric|boolean, xp_value int, category varchar) — seed catalog, never modified by users
- users (id UUID PK, name, avatar_url, created_at) — minimal, auth comes later from Oracle IAM
- user_habits (id UUID PK, user_id FK→users, habit_id FK→habits, custom_target numeric, is_active boolean, created_at) — UNIQUE(user_id, habit_id)
- habit_logs (id UUID PK, user_habit_id FK→user_habits, date DATE, value numeric, completed boolean, xp_earned int, created_at) — UNIQUE(user_habit_id, date)

Key design decisions:
- habits is a fixed catalog (like products in a shop) — users pick from it, never create habits
- users pick habits from the catalog and set their own custom_target per habit
- user_habits is the join table between a user and their chosen habits
- habit_logs stores daily check-ins, drives heatmap and streak calculation
- TypeORM synchronize: false — tables already exist in DB, do NOT recreate

## Environment Variables
Backend .env (never commit, use .env.example as reference):
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- PORT (default 3000)

Frontend .env:
- VITE_API_URL=http://localhost:3000/api

## Code Style
- Always use TypeScript, never plain JS
- Use async/await, never .then()
- DTOs for all API inputs (class-validator decorators)
- Descriptive variable names in English
- Keep components small and focused
- No comments unless the WHY is non-obvious

## Backend Rules
- TypeORM entities must match the schema above exactly
- Use ConfigService for all env variables, never hardcode
- All routes are public for now — no auth guards (temporary until Oracle IAM integration)
- Hardcoded mock user_id for all queries: `9198967e-8909-4055-8ab8-60f0f7e24294`
  ⚠️ TEMPORARY: replaced by real Oracle IAM user ID at deploy time — do NOT build auth logic around this

## Frontend Rules
- All API calls go through src/api/axios.ts (central instance, no auth headers)
- Use React Router for navigation
- Tailwind only for styling — EXCEPTION: exact hex colors not in Tailwind palette
  (e.g. #FF8C69 coral for streak/header accent) may use inline style={{}}
- No class-based React components

## Auth Flow
- Auth is intentionally skipped for now — all routes are public
- Future plan: Oracle IAM (similar to AWS Cognito) will issue JWTs; backend will validate them
- Do NOT implement custom JWT/Passport auth — it will be replaced entirely by Oracle IAM
- Frontend AuthContext/LoginPage/RegisterPage files still exist but are unused — will be replaced by Oracle IAM

## Dashboard Design (current)
- Route "/" and "/dashboard" go directly to DashboardPage — no auth guard
- All data is real: fetches /users/me, /user-habits, /habit-logs, /habit-logs/streak, /habit-logs/heatmap on mount
- Color palette: background #faf8f5 (warm off-white), accent #FF8C69 (peach-coral), completions #4ade80 (mint green)
- Layout: sticky pastel Navbar + max-w-[1400px] content area
- Desktop 3-column grid: [280px Streak card | 1fr Today's Habits | 320px Heatmap]
  - Streak card: live streak number, weekly row (heatmap data for past days, live logs for today), X/Y done
  - Today's Habits: boolean → toggle button; numeric → number input + Log button (marks done when value ≥ target)
  - Heatmap: 13-week GitHub-style grid fed from real API data
- Daily quote: seeded by day-of-year so it rotates daily without being random

## API Endpoints
All routes are public (no auth for now). Mock user_id hardcoded in services.

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users/me | Return mock user info |
| GET | /api/habits/catalog | Return all habits from the catalog table |
| GET | /api/user-habits | User's active habits joined with catalog info (name, icon, unit, type, xp_value, custom_target) |
| POST | /api/user-habits | Add a habit to user's list `{ habit_id, custom_target }` |
| DELETE | /api/user-habits/:id | Remove a habit from user's list |
| GET | /api/habit-logs?date=YYYY-MM-DD | All logs for mock user on a specific date |
| POST | /api/habit-logs | Upsert a log `{ userHabitId, date, value, completed, xpEarned }` |
| GET | /api/habit-logs/heatmap | Last 90 days of logs grouped by date with total completions |
| GET | /api/habit-logs/streak | Current streak (consecutive days with ≥1 completion) |

## What NOT to do
- Don't add a Postgres container to docker-compose — local Postgres is used in dev
- Don't use class-based React components
- Don't use `any`, always type everything
- Don't create unnecessary abstractions
- Don't hardcode env variables — always use ConfigService
- Don't put real credentials in .env.example
- Don't let users create or modify habits in the catalog — it's read-only seed data
- Don't set TypeORM synchronize: true — tables already exist, synchronize will corrupt them
- Don't build any JWT/Passport auth logic — Oracle IAM will handle auth at deploy time

## Current State
- [x] Project scaffolded (NestJS backend + React/Vite frontend)
- [x] Docker Compose configured (backend + frontend, no Postgres container)
- [x] Dashboard redesigned (mock data, pastel UI, streak + heatmap)
- [x] Pushed to GitHub (https://github.com/B3ni11111/Habitat)
- [x] New DB schema designed (habits catalog + user_habits + habit_logs)
- [x] Backend refactored to new schema (entities, services, controllers, modules)
- [x] All 9 API endpoints implemented (catalog, user-habits CRUD, habit-logs with heatmap + streak)
- [x] auth/ and categories/ modules removed — all routes are public
- [x] Frontend wired to real API (no more mock data anywhere)
- [x] DashboardPage: real user, user-habits, logs, streak, heatmap from API
- [x] HabitsPage: catalog browser + user-habits management (add/remove)
- [x] Desktop-first layout (max-w-[1400px], 3-column grid on dashboard)
- [x] Numeric habits show input+Log button; boolean habits show toggle
- [x] AuthContext, AuthProvider, auth routes removed from App.tsx
- [x] Navbar redesigned: pastel white, active route underline, no auth UI
- [ ] Deploy to OCI VM

## What's Next
1. Deploy to OCI: set up VM, install Docker, clone repo, create .env, run docker-compose up
2. Seed the habits catalog table with real habit data
3. Wire Oracle IAM for real auth (replace hardcoded mock user_id)

## Decisions Made
- TypeORM synchronize: false — tables already exist in DB, do not recreate
- habits table is a fixed catalog (seed data) — users cannot create/modify habits
- user_habits is the join table; custom_target is per-user, per-habit
- habit_logs.date is type DATE — one log per day per user_habit (enforced by UNIQUE constraint)
- All routes public for now — Oracle IAM will handle auth at OCI deploy time
- Hardcoded mock user_id `9198967e-8909-4055-8ab8-60f0f7e24294` used in all services temporarily
- Dashboard bypasses auth — easier to design/iterate without login flow
- Heatmap is fed from real API data (GET /habit-logs/heatmap); no more mock hash generation
- Daily quote uses day-of-year seed so it rotates daily without being random per render
