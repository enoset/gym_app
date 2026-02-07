# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build
npm start         # Run production build
```

No test framework, linter, or formatter is configured.

## Architecture

**Kettlebell Workout Recommender** — a Next.js 14 App Router application (TypeScript, React 18) for generating and tracking kettlebell workouts. Mobile-first dark theme UI (max-width 480px). No authentication, no external database.

### Data Flow

1. User selects a workout goal (strength, muscle_building, fat_loss, endurance) on the home page
2. POST `/api/workouts` calls the generator algorithm in `src/lib/generator.ts`
3. Generator selects exercises ensuring variety (no repeats from last workout), full-body coverage, and at least one compound movement
4. Generated workout is saved to `data/workouts.json` via `src/lib/storage.ts` (file-based JSON persistence)
5. User tracks weights and completion on the workout page, which PUTs updates back to the API
6. History page reads all past workouts via GET `/api/workouts`

### Key Modules

- **`src/lib/types.ts`** — All TypeScript interfaces (Exercise, Workout, WorkoutGoal, GoalConfig, etc.)
- **`src/lib/exercises.ts`** — Static database of 23 kettlebell exercises with muscle group mappings
- **`src/lib/generator.ts`** — Workout generation algorithm with goal-specific configs (reps, rounds, rest times, exercise count) and smart selection logic (muscle group coverage, compound inclusion, history-aware variety)
- **`src/lib/storage.ts`** — File I/O layer reading/writing `data/workouts.json` (git-ignored)
- **`src/app/api/workouts/`** — REST API routes (GET all, POST generate, GET/PUT by id)

### Conventions

- Path alias: `@/*` maps to `./src/*`
- All pages are client components (`'use client'`)
- Weights stored in lbs, rest times in seconds, timestamps as ISO strings
- `data/` directory must exist and be writable at runtime (git-ignored)
