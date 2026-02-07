# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build (static export to out/)
```

No test framework, linter, or formatter is configured.

## Deployment

The app is deployed as a static PWA to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to `main` triggers a build and deploy.

**IMPORTANT:** When deploying changes, bump the `CACHE_NAME` version in `public/sw.js` (e.g., `kettlebell-v2` → `kettlebell-v3`). This forces the service worker to purge the old cache and download fresh assets. Without this, users will keep seeing the old cached version.

## Architecture

**Kettlebell Workout Recommender** — a Next.js 14 App Router application (TypeScript, React 18) deployed as a fully offline PWA. Mobile-first dark theme UI (max-width 480px). No authentication, no external database, no server — runs entirely in the browser.

### Data Flow

1. User selects a workout goal (strength, muscle_building, fat_loss, endurance) on the home page
2. `generateWorkout()` from `src/lib/generator.ts` is called directly client-side
3. Generator selects exercises ensuring variety (no repeats from last workout), full-body coverage, and at least one compound movement
4. Generated workout is saved to `localStorage` via `src/lib/storage.ts`
5. User tracks weights and completion on the workout page, which updates localStorage directly
6. History page reads all past workouts from localStorage

### Key Modules

- **`src/lib/types.ts`** — All TypeScript interfaces (Exercise, Workout, WorkoutGoal, GoalConfig, etc.)
- **`src/lib/exercises.ts`** — Static database of 23 kettlebell exercises with muscle group mappings
- **`src/lib/generator.ts`** — Workout generation algorithm with goal-specific configs (reps, rounds, rest times, exercise count) and smart selection logic (muscle group coverage, compound inclusion, history-aware variety)
- **`src/lib/storage.ts`** — localStorage wrapper (read/write workout history as JSON)
- **`public/sw.js`** — Service worker for offline caching (cache-first strategy)
- **`public/manifest.json`** — PWA manifest

### Conventions

- Path alias: `@/*` maps to `./src/*`
- All pages are client components (`'use client'`)
- Weights stored in lbs, rest times in seconds, timestamps as ISO strings
- Static export with `basePath: '/gym_app'` — all URLs are relative to `/gym_app/`
- Raw `<img>` src paths must be prefixed with `BASE_PATH` (`/gym_app`); `<Link>` handles basePath automatically
- `useSearchParams()` requires wrapping the component in `<Suspense>`
