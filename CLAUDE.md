# CLAUDE.md

Project context for Claude Code. Loaded at the start of every session.

## What this is

A personal calisthenics training web app ("Skill Unlocks"). Single-page React app,
built with Vite, deployed to GitHub Pages. It shows a 12-week, 3-day-a-week workout
plan and a skill-progression tree, with progress saved per-device in the browser.

This is a personal project for one user, not a product. Favour simplicity and
readability over abstraction. Don't add dependencies, frameworks, state libraries,
routing, or a component-splitting refactor unless explicitly asked.

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
- `vite.config.js` sets `base: "/Workout/"`. This MUST match the repository name.
  If the repo is renamed, update `base` to `/<new-name>/` or the deployed site breaks.
- The user commits and pushes via GitHub Desktop, so just make and verify changes —
  don't run git commands unless asked.

## Architecture

Everything lives in `src/App.jsx`. There is intentionally no component library or
CSS file — styling is inline via `style={{ ... }}` objects, dark theme throughout.

Key data structures, all near the top of `src/App.jsx`:

- `PHASES` — the three 4-week phases (Foundation / Build / Skills), each with a colour.
- `WORKOUTS` — keyed by phase id (`foundation`, `build`, `skills`); each is an array
  of 3 days (A/B/C); each day has an `exercises` array of `{ name, sets, reps, note, icon }`.
- `SKILL_TREE` — the unlockable skills shown on the Skill Tree tab.
- `EXERCISE_DETAILS` — ordered array of per-exercise instructions (steps, cues,
  mistakes, optional `shoulder` note), matched to exercises by name.
- `getDetails(name)` — returns the EXERCISE_DETAILS entry whose `match` is the
  **longest** matching substring of the exercise name. This longest-match rule is
  deliberate: it stops e.g. "Handstand Push-Up" matching the generic "Push-Up" entry.
  When adding exercises, keep this in mind.
- `ytSearch(...)` — builds a YouTube search URL for the "Watch demonstration" button.

UI: two tabs ("Workout Plan" and "Skill Tree"). Tapping an exercise opens a centred,
scrollable detail modal. Progress (completed sessions, unlocked skills) persists to
`localStorage` under keys `cal_days` and `cal_skills`.

## Conventions / gotchas

- Keep inline-style approach; don't introduce Tailwind, CSS modules, or styled-components.
- Preserve the iOS safe-area handling: the header padding and main container use
  `env(safe-area-inset-*)`. Don't remove these — they stop content hiding behind the
  iPhone status bar in home-screen (standalone) mode.
- Don't reintroduce in-browser Babel or a single-file HTML build. Vite compiles the
  JSX now; an earlier in-browser-Babel version caused hard-to-debug load failures.
- `index.html` is the Vite entry and just loads `src/main.jsx`. App code does not go here.

## Training context (why the plan is the way it is)

This shapes any change to exercises, sets/reps, or progressions. If asked to modify
the plan, respect these unless the user says otherwise:

- The user is a returning beginner with currently low strength. Sessions are 30–45 min,
  3x/week. Cardio is done separately — do not add cardio.
- Goals, in priority order: unlocking skills (handstand, muscle-up, L-sit, etc.) and
  building muscle / body shape. Raw strength and lifting heavier are lower priority.
- The plan favours calisthenics and simple movements (push-ups, dips, rings, etc.) —
  the kind of training the user actually enjoys and will stick with.
- **Rotator cuff injury (important):** the user has a weak/recovering rotator cuff.
  Shoulder-loading work must build gradually. Band external rotations and face pulls
  appear in every phase as prehab and should stay. Overhead-loading moves (pike
  push-ups, handstand work, ring dips, muscle-ups) are introduced later and carry
  "shoulder notes" — keep that caution in any new shoulder exercise.
- Legs are covered mainly by Bulgarian split squats (progressively loaded) and
  Romanian deadlifts, since the user has no barbell and dislikes heavy lifting.

## Health-advice guardrail

This is a fitness app, not medical advice. When changing training content, keep
shoulder loading conservative and progressive. Don't push aggressive progressions
that could aggravate the rotator cuff. The user has said they intend to see a physio.
