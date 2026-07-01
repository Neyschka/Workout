# Lever — Adaptive Progression Tree (Feature Plan)

> Status: **planning + V1 data authoring**. This doc is the source of truth for the
> Skill Tree rebuild. Edit freely — it's meant to persist across sessions.

## The problem

The current **Skill Tree** tab is a static, decorative graph. It doesn't *do* anything —
you can't act on it, and it doesn't change the plan. Meanwhile the **Workout Plan** is a
fixed list that was generated once and never adapts. The app is otherwise a fairly generic
workout tracker.

## The idea (the USP)

Turn the Skill Tree into a real **adaptive progression system** that is the unique,
calisthenics-flavoured heart of the app:

1. Every exercise is categorised by **muscle group**, **difficulty tier (1–5)**, and the
   **muscles** it works.
2. The screen becomes **visual**: a **radar chart** (muscle balance — "am I balanced?")
   sitting above **progression tracks** (per-group ladders — "what's next?"), plus
   **skill quests** (linear calisthenics goals like Handstand, Muscle-Up — the fun layer).
3. The plan stops being static: when an exercise is **too easy / too hard**, the app
   suggests stepping up/down the same track and — on your confirmation — swaps it into
   your plan. A **"Choose for me"** button keeps the hand-holding for people who just want
   to be told what to do.

This stays **100% offline, free, static PWA**. No AI, no backend (see "Why no AI").

## Core model decisions (agreed)

- **Visualisation:** radar overview on top + tappable progression tracks below. *(agreed)*
- **Difficulty:** **tiers within each track** (1→5), not a global score. *(agreed)*
- **Tracks = muscle groups, not single-exercise chains.** Each group is a *pool*; each
  tier in a group can hold **several** exercises (variety). Climbing tiers = progression;
  multiple exercises per tier = choice. *(agreed — resolves the "chains are too limiting"
  worry)*
- **Skills = a separate linear layer.** Handstand / Muscle-Up / L-Sit / Front Lever /
  Planche / Human Flag are genuine step-by-step chains that cut across muscle groups.
  These stay explicit linear quests with an unlock payoff (this is what the old SKILL_TREE
  was — repurposed). Keeps the satisfying "tech tree" feel without a messy 2D graph on a
  phone. *(agreed)*
- **Radar axes = the muscle groups** (Push, Pull, Legs, Core, Shoulders, Grip). *(agreed)*
- **Feedback:** explicit **Easy / Just-right / Hard** rating, plus dedicated
  **too-easy / too-hard** controls on the exercise card (passive, always available).
  *(agreed)*
- **Swaps:** **suggest, user confirms** before the plan changes — with a **"Choose for me"**
  shortcut and 2–3 alternatives. *(agreed)*
- **Plan structure:** keep **A / B / C days** and keep a **curated pre-built plan** (you
  like being told what to do). Each exercise becomes a **slot** (group + target tier)
  pre-filled by the curated plan but swappable. *Adjustable number of days = later.* *(agreed)*
- **Logging:** **optional**. Primary signal stays the easy/hard taps. If you opt in to
  logging reps/holds, suggestions get smarter ("hit the top of the range 3 sessions →
  progress?"). A **history/progress screen** comes with logging — later phase. *(agreed)*
- **Lean:** keep it **calisthenics-first** even as the model generalises (skill progression
  is itself a core calisthenics idea). *(agreed)*

## Why no AI

The reason we author tiers + groups up front is so adaptation is a **deterministic lookup**,
not a judgement call:

- "Too hard" → same group, **tier − 1**, filter to available/equipment → list options.
- "Too easy" → same group, **tier + 1** → list options.
- "Choose for me" → pick the option closest to your current tier with the same equipment.

That's a handful of rules: instant, offline, free, predictable, no API keys, nothing to pay
for. AI would add cost + latency + unpredictability to a problem that is genuinely
rules-based. (The only place AI *could* help is a one-time, design-time assist to draft the
exercise metadata — but that's authored here in the repo, no runtime calls.)

## Data model

One unified library replaces the three current blobs (`WORKOUTS`, `SKILL_TREE`,
`EXERCISE_DETAILS`). See `src/data/exerciseLibrary.js`.

Each **exercise**:

| field | meaning |
|---|---|
| `id` | stable slug |
| `name`, `icon` | display |
| `group` | primary muscle group → which **track** it lives in (`push/pull/legs/core/shoulders`) |
| `tier` | difficulty within the group, **1–5** |
| `axes` | weighted radar contribution, e.g. `{ push: 1, core: 0.3 }` (includes `grip`) |
| `muscles` | specific muscles (for detail + future filtering) |
| `equipment` | `floor / bar / rings / dumbbell / band / bench / parallettes` |
| `defaultSets`, `defaultReps` | curated defaults |
| `skill`, `skillStep` | if part of a skill quest: which quest + its position |
| `prereq[]`, `unlocks[]` | progression edges (exercise ids) |
| `details` | `steps / cues / mistakes / shoulder? / search` (migrated from EXERCISE_DETAILS) |

**Skill quests** (`src/data/skillQuests.js`): an ordered list of exercise ids per quest,
plus a name/icon/goal blurb. The tree + radar are **computed** from the library; the plan
references exercise ids. Get this right and everything downstream is cheap.

## Staging

### V1 — the screen, read-only *(building now)*
Radar (muscle balance) + muscle-group tracks (your current tier + what's next) + skill
quests (current step + goal). **No swapping yet.** Delivers the USP visual immediately and
forces the data model to be right.
- Biggest effort: **authoring the library** (done as a draft for review) + **iterating the
  tree visual** so it's clean on a phone.

### V2 — the adaptive loop
Easy / Just-right / Hard + too-easy / too-hard controls on cards → **suggest-and-confirm**
swaps with "Choose for me". Plan slots become dynamic. Radar updates as you progress.

### V3 — optional logging + history
Per-set logging (reps / holds / weight), a **progress/history screen**, and
logging-informed suggestions. Adjustable number of training days lands around here too.

## Phases dropped — the plan is now user-editable (resolved)

The 12-week Phase 1/2/3 model was removed. Once the user can choose their own
exercises, three fixed pre-authored phase plans stop making sense. Replaced with:

- **One editable A/B/C plan**, seeded from the old Foundation plan and persisted
  (`localStorage` key `cal_plan`). Old phase-scoped completion keys (`foundation-0`)
  migrate to plain day indices (`day-0`).
- **Edit mode** on the Workout Plan screen (“Edit plan” toggle): swap, remove and add
  exercises via a group/tier picker (equipment-greyed). Read mode stays clean — tap a
  card for details, Start Session as before.
- **Single brand accent** (`#4A90A4`) replaces the per-phase colour theming.
- **Guidance survives the change.** The muscle-coverage meter (below) shows **only in
  edit mode** and now reads *yours vs the recommended* per-group counts, so an
  uninformed user is still told how many of each type to include even while choosing
  their own exercises. The recommended distribution = the seed plan's own balance.

## Coverage meter — how "enough" is defined (resolved)

Each day = a fixed number of **slots**, each slot's identity is a **muscle group** (not a
fixed exercise) — exactly the same swappability concept as the adaptive loop, just made
visible. Counting is by **slot count per group**, not weighted by axis fractions (simpler
to read: "2 Push slots done" beats a percentage). The **target is self-referential**: it's
the curated plan's own distribution, not an invented external rule — so as long as swaps
stay within the same group (which V2 enforces anyway), you're always "on track" by
definition. If a future version ever allowed changing a slot's group, the meter would
visibly dip — a useful honesty check, not a punishment. **Weekly only** (per the existing
A/B/C split, not per-day).

## New requirements (added after library review)

- **Equipment filtering.** Every exercise already carries an `equipment` tag. Need: a
  one-time "what do I own" setting (persisted), then filter/grey exercises you can't do —
  in the library/tree view, and eventually in swap suggestions (V2: only suggest swaps you
  can actually perform).
- **Muscle-group coverage reassurance (NEW, distinct from the skill radar).** The skill
  radar answers "how advanced am I per group" (tier reached). This is a different question:
  "does my plan actually balance all muscle groups?" — a **volume check**, not a skill
  check. Computed for free from each exercise's `axes` weights summed across a day/week's
  planned exercises. Proposed home: a small coverage meter on the **Workout Plan** screen
  (per day or per week), separate from the Skill Tree radar, so each screen keeps one job:
  Plan = "am I balanced this week", Skill Tree = "where am I in my progression."
- **Exercise library will keep growing over time** — not urgent, backlog item.

## Tier attainment fixed: earned, not scheduled (resolved)

V1's first cut computed a group's "current tier" from whatever was merely *scheduled*
in the active phase's plan — meaning adding one hard exercise to a day would instantly
inflate the tier with zero evidence. Fixed:

- **Tapping an exercise is view-only now.** Mastery is **earned solely by completing a
  workout** that includes the exercise — that auto-checks it off **with the completion
  date**. There is no manual tap-to-check any more (it let people inflate their tier with
  no evidence). Tapping an exercise or quest step instead opens the **exercise-info
  modal**. One underlying dated "mastered" map (`id → date`), two views on top of it
  (linear quests, grouped tier tracks).
- **Tier = highest tier with ≥1 mastered exercise in that group.** Scheduling something
  in the plan does nothing on its own.
- **Honest backfill, not a blank slate.** Completing a day (retroactively, once, and
  going forward) adds its exercises to "mastered" — real evidence, unlike "it's on my
  calendar." Un-completing a day does not strip mastery back out (no punishing).
  Days completed before dates were tracked backfill undated.
- **The radar moved to the same basis** — it was also reading off the scheduled plan;
  now both views agree, so they can't contradict each other.
- **"Next" removed.** Tapping a track expands the full tier-by-tier breakdown (1→5) for
  that group instead of a partial, under-explained peek.

## Grip — full track or radar-only?

**Resolved: promoted to a full 6th track.** Dead Hang (T1) and Active Hang (now T2, was
T1) moved from Pull into Grip — Pull keeps Ring Row as its T1 anchor, no gap created.
Added 3 new exercises to fill T3–T5: Weighted Dead Hang, Single-Arm Hang (assisted), One-Arm
Hang — all invented, flagged in DATA-REVIEW.md. The weekly balance meter and radar picked
up the 6th group automatically (both already iterate `GROUPS` generically).

## Open questions for the morning

1. Does the **muscle-pool + skill-quest split** match what you pictured, or were you
   imagining skills *as* the muscle tracks? (If the latter, the library still stands — only
   the tree view changes.)
2. **Grip** as a radar axis but **not** a full track (no dedicated ladder) — OK? Or do you
   want a grip ladder too (dead hang → active hang → one-arm hang…)?
3. Tier assignments and any invented exercises need your domain check — see
   `DATA-REVIEW.md`.

## What I drafted overnight

- `src/data/exerciseLibrary.js` — unified, tiered library (migrated + expanded).
- `src/data/skillQuests.js` — the linear skill chains.
- `DATA-REVIEW.md` — every judgement call + every exercise I invented, for fast checking.
- `Library Review.dc.html` — a visual page to eyeball tiers/tracks/quests at a glance.
