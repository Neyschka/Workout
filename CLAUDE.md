# CLAUDE.md

Project context for Claude Code. Loaded at the start of every session.

## What this is

A personal training web app ("Lever"). Single-page React app, built with Vite,
deployed to GitHub Pages. It's a user-editable 3-day-a-week gym workout plan (preloaded
with `GYM_PLAN`, editable from a curated exercise library) with per-set weight logging,
plus a skill-progression tracker, with progress saved per-device in the browser.

This is a personal project for one user, not a product. Favour simplicity and
readability over abstraction. Default to no new dependencies, frameworks, state
libraries, routing, or component-splitting refactors — if one seems like it would
genuinely help, raise it and check in rather than doing it unprompted.

## Commands

- `npm install` — install dependencies (run once after cloning)
- `npm run dev` — local dev server with live reload (usually http://localhost:5173)
- `npm run build` — production build into `dist/`
- `npm run preview` — preview the production build locally

Before pushing a change, run `npm run build` and confirm it completes without errors.

## Deployment

- Pushing to the `main` branch triggers `.github/workflows/deploy.yml`, which builds
  and publishes to GitHub Pages automatically. No manual deploy step.
- The live site is https://neyschka.github.io/Workout/
- GitHub Pages **Source** is set to "GitHub Actions" (not "Deploy from a branch").
- `vite.config.js` sets `base: "/Workout/"`. This has to match the repository name —
  if the repo is renamed, update `base` to `/<new-name>/` or the deployed site breaks.
- The user commits and pushes via GitHub Desktop, so there's normally no need to run
  git commands — check in first if one seems necessary.

## Architecture

Everything lives in `src/App.jsx`. There is intentionally no component library or
CSS file — styling is inline via `style={{ ... }}` objects, dark theme throughout.
Shared exercise/skill data lives in `src/data/exerciseLibrary.js` (the full exercise
list, grouped by `GROUPS`/`AXES`, tiered, with equipment tags) and
`src/data/skillQuests.js` (multi-step skill goals like the muscle-up or handstand).

Key data structures and helpers, all near the top of `src/App.jsx`:

- `WORKOUTS` — the original curated Foundation/Build/Skills phase plan (kept as
  reference data; see `DEFAULT_PLAN` below).
- `DEFAULT_PLAN` — `WORKOUTS.foundation` reshaped into the 3-day (A/B/C) plan shape.
  Old reference data, no longer shown.
- `GYM_PLAN` — the current curated beginner full-body A/B/C gym plan, and what a new
  device starts with. `loadPlan()` falls back to it when `cal_plan` is empty or
  `cal_plan_version` doesn't match `PLAN_VERSION`. Bumping `PLAN_VERSION` replaces the
  saved plan on every device on next load (and marks all equipment owned, clears
  `cal_days`). Its balance is also `RECOMMENDED_COUNTS`, the muscle-coverage guide
  shown while editing.
- `EMPTY_PLAN` — same Day A/B/C shape with no exercises (the empty-plan UI shows if
  the user removes everything).
- The user's actual plan is `plan` (React state, persisted to `cal_plan`), editable
  in place via "Edit plan" mode — swap/add/remove/reorder exercises per day, drawing
  from `src/data/exerciseLibrary.js`.
- `EXERCISE_DETAILS` — ordered array of per-exercise instructions (steps, cues,
  mistakes, optional `shoulder` caution and/or general `tip`), matched to exercises
  by name.
- `getDetails(name)` — returns the EXERCISE_DETAILS entry whose `match` is the
  **longest** matching substring of the exercise name. This longest-match rule is
  deliberate: it stops e.g. "Handstand Push-Up" matching the generic "Push-Up" entry.
  When adding exercises, keep this in mind.
- `ytSearch(...)` — builds a YouTube search URL for the "Watch demonstration" button.
- `buildCalendarWeeks(weeksBack)` — builds the Sun→Sat week columns for the History
  tab's GitHub-style contribution grid.

UI: three bottom tabs — **Workout** (the editable plan, day picker, session runner),
**Skills** (radar chart + muscle-group tracks + skill quests, driven by the shared
exercise library), and **History** (a calendar of training days; tapping a green day
lists the sets logged that day, no commentary by design). Tapping an exercise opens a centred, scrollable detail
modal. Progress persists to `localStorage`: `cal_plan` (the user's plan),
`cal_mastered` (id → date mastered), `cal_days` (which of Day A/B/C have ever been
completed), `cal_session_dates` (calendar dates a session was completed — powers
History), `cal_equipment` (owned equipment, used to grey out exercises you can't
do), `cal_log` (weight log: exercise id → `[{ date, sets: [{ kg, reps }] }]`, one entry
per exercise per day), `cal_plan_version`.

Session runner (modelled on gym apps like Strong/Hevy): a whole-session clock in the
header; each set is a row prefilled with last time's kg/reps, and ticking it saves it
to `cal_log` immediately (only ticked sets are saved) and starts a rest countdown
(`restSecondsFor`: 90s main lifts, 60s core/2-set accessories) in a bar pinned to the
bottom, with ±15s/Skip (no sound by design; a vibrate where supported, not iOS). Timed holds (rep range ending in "s") get a hold
stopwatch that fills and ticks the next set. Timing is timestamp-based so it survives
the phone sleeping. It suggests adding weight once every set hit the top of the rep
range last time (`assisted: true` exercises log assistance, so less = harder). Holding the "Lever." logo for 5s triggers a hidden factory-reset confirm that
clears all of the above and reloads — the escape hatch back to a brand-new install.

## Conventions / gotchas

- Default to the inline-style approach — raise it rather than switching to Tailwind,
  CSS modules, or styled-components unprompted.
- Keep the iOS safe-area handling: the header padding and main container use
  `env(safe-area-inset-*)`. Removing it brings back content hiding behind the iPhone
  status bar in home-screen (standalone) mode.
- Avoid reintroducing in-browser Babel or a single-file HTML build. Vite compiles the
  JSX now; an earlier in-browser-Babel version caused hard-to-debug load failures.
- `index.html` is the Vite entry and just loads `src/main.jsx`. App code does not go here.

## Training context (why the plan is the way it is)

This shapes any change to exercises, sets/reps, or progressions. If asked to modify
the plan, respect these unless the user says otherwise:

- The user is a beginner with very low starting strength who has joined a gym with
  full equipment (machines, cables, dumbbells, bars, rings). Sessions are 30–45 min,
  3x/week, full body. Cardio is handled separately, so leave it out unless asked.
- Current goals (as of Oct 2026): build strength and muscle and lose stomach fat
  (~1 stone overweight) until happy with body shape. Calisthenics skills (handstand,
  muscle-up, L-sit) come after that; assisted pull-ups/dips in the plan bridge to them.
- Plan structure: fill movement patterns (vertical/horizontal push and pull, squat,
  hinge, plus core), one exercise per slot, progressed with small weight increases
  once the top of the rep range is hit on every set. Machines and assisted versions are
  preferred while strength is low.
- The user still enjoys calisthenics-style training, so lean that way where it
  doesn't conflict with the goals above.

## Health-advice guardrail

This is a fitness app, not medical advice. When changing training content avoid aggressive progressions
that could cause injury
