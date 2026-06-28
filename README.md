# Skill Unlocks — Calisthenics Plan

A personal calisthenics training app (Vite + React), deployed to GitHub Pages.

## One-time setup

1. Install **Node.js** (LTS version) from https://nodejs.org and **Git** from https://git-scm.com
2. Clone your repo and enter it:
   ```bash
   git clone https://github.com/wibbles790/Workout.git
   cd Workout
   ```
3. Copy all the files from this project into the repo folder (including the hidden
   `.github` folder and `.gitignore`).
4. Install dependencies:
   ```bash
   npm install
   ```

## Develop locally

```bash
npm run dev
```

Open the URL it prints (usually http://localhost:5173). Edits to `src/App.jsx`
update live in the browser. No build step needed while developing.

## Deploy

Just commit and push to the `main` branch:

```bash
git add .
git commit -m "Update plan"
git push
```

The GitHub Action (`.github/workflows/deploy.yml`) builds the app and publishes it
automatically. Watch progress under the **Actions** tab on GitHub.

## IMPORTANT: switch Pages to GitHub Actions (one time)

On GitHub: **Settings → Pages → Build and deployment → Source → "GitHub Actions"**
(instead of "Deploy from a branch"). This only needs doing once.

## Notes

- The site is served at https://wibbles790.github.io/Workout/ — the `base: "/Workout/"`
  line in `vite.config.js` must match the repo name. If you rename the repo, update it.
- Your progress (completed sessions, unlocked skills) is saved in the browser via
  localStorage, per device.
- All the plan content lives in `src/App.jsx` near the top (the `WORKOUTS`,
  `SKILL_TREE`, and `EXERCISE_DETAILS` data) if you want to tweak exercises yourself.
