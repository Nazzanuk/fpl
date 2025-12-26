# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
See AGENTS.md for more information on the project structure and patterns.

## Project Overview

FPL Alchemy is a Next.js 16 application for real-time Fantasy Premier League mini-league tracking. It consumes the unofficial FPL API to display live scores during gameweeks, including bonus points and auto-substitutions.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### FPL API Layer (`src/libs/Fpl/`)
- **Data/Client/FPLApiClient.ts**: Low-level API fetching with 60s revalidation and browser User-Agent spoofing
- **Services/FPLEngine.ts**: Business logic for building live league tables (handles the N+1 query problem with `p-limit` concurrency control)
- **Services/AnalyticsEngine.ts**: Statistical analysis, trends, and recommendations
- **Types/**: TypeScript types for FPL API responses and domain models

Key API endpoints consumed:
- `/api/bootstrap-static/` - Player/team metadata and current gameweek
- `/api/leagues-classic/{id}/standings/` - League manager list
- `/api/event/{gw}/live/` - Real-time player scores
- `/api/entry/{id}/event/{gw}/picks/` - Manager team selections

### Component Structure
- **Shared Components** (`src/Components/`): Reusable across pages (LiveTable, PitchView)
- **Pages** (`src/app/`): Next.js App Router with server components

### Patterns (from AGENTS.md)
- Server-first architecture with async Server Components
- Component/Skeleton/Inner pattern for self-contained Suspense boundaries
- Async-at-leaves: fetch data where it's used, not at parent level
- Named exports with arrow functions, no default exports (except Next.js routing files)
- One CSS module per component, camelCase selectors
- Keep files ≤80 lines (hard cap 100)
- Forms use uncontrolled inputs + server actions

### Live Scoring Engine
The `buildLiveTable` function in `Services/FPLEngine.ts`:
1. Fetches current gameweek from bootstrap-static
2. Parallel fetches league standings + live element stats
3. Fetches each manager's picks with concurrency limit (5 concurrent)
4. Calculates live scores locally including captain multipliers and transfer costs

### Implemented Features
All core features and tool tabs are now fully functional:
- **Live Standings**: Real-time league table with rank changes
- **Differentials**: Unique and missing player analysis
- **Ownership**: League-wide player ownership statistics
- **Top Performers**: Global top players by points, form, and value
- **Price Changes**: Rising and falling player prices
- **FDR Planner**: Fixture difficulty ratings for upcoming gameweeks
- **Chip Advisor**: Smart recommendations for Bench Boost, Triple Captain, Free Hit, and Wildcard
- **Best XI**: Optimal squad builder using greedy algorithm
- **Transfer Planner**: Player upgrade recommendations based on form and value
