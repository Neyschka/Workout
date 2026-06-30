// Lever — unified exercise library (V1 draft, authored for review)
// ---------------------------------------------------------------------------
// Single source of truth. Replaces the old WORKOUTS / SKILL_TREE / EXERCISE_DETAILS
// blobs. The plan references exercise ids; the radar + tracks are COMPUTED from this.
//
// See DATA-REVIEW.md for every tier judgement call and every invented exercise.
// See PLAN.md for the model.
//
// Schema per exercise:
//   id, name, icon
//   group     : primary muscle group → which track it lives in
//   tier       : 1..5 difficulty within the group
//   axes       : weighted radar contribution { push, pull, legs, core, shoulders, grip }
//   muscles    : specific muscles worked (display / future filtering)
//   equipment  : array from EQUIPMENT keys
//   defaultSets, defaultReps : curated defaults (strings, matching existing style)
//   skill, skillStep : if part of a skill quest (see skillQuests.js)
//   prereq[], unlocks[] : progression edges (exercise ids, same group unless skill)
//   details    : { steps[], cues[], mistakes[], shoulder?, search }
//   invented   : true if NOT in the original app data (flag for your review)
// ---------------------------------------------------------------------------

export const GROUPS = {
  push:      { id: "push",      name: "Push",      icon: "💪", color: "#4A90A4", blurb: "Pressing strength — chest, triceps, front delts." },
  pull:      { id: "pull",      name: "Pull",      icon: "⬆️", color: "#7B6FA0", blurb: "Pulling strength — back, biceps, rear delts." },
  legs:      { id: "legs",      name: "Legs",      icon: "🦵", color: "#A06B4A", blurb: "Lower body — quads, glutes, hamstrings." },
  core:      { id: "core",      name: "Core",      icon: "🌙", color: "#5B8C5A", blurb: "Midsection control — the base of every skill." },
  shoulders: { id: "shoulders", name: "Shoulders", icon: "🤸", color: "#C28A3A", blurb: "Overhead strength + health — delts, rotator cuff, handstand line." },
  grip:      { id: "grip",      name: "Grip",      icon: "✊", color: "#6B8FA8", blurb: "Hold and hang strength — the quiet multiplier behind every pull." },
};

// Radar axes (Grip is radar-only — no dedicated track in V1; see DATA-REVIEW.md Q2)
export const AXES = ["push", "pull", "legs", "core", "shoulders", "grip"];
export const AXIS_LABEL = { push: "Push", pull: "Pull", legs: "Legs", core: "Core", shoulders: "Shoulders", grip: "Grip" };

export const EQUIPMENT = {
  floor:       "Floor / none",
  bar:         "Pull-up bar",
  rings:       "Gymnastic rings",
  dumbbell:    "Dumbbells",
  band:        "Resistance band",
  bench:       "Bench / box",
  parallettes: "Parallettes / dip bars",
  wall:        "Wall",
  pole:        "Vertical pole",
};

// Difficulty tier labels (used as track rung headings)
export const TIERS = {
  1: "Foundation",
  2: "Developing",
  3: "Intermediate",
  4: "Advanced",
  5: "Elite",
};

export const EXERCISES = [
  // ======================= PUSH =======================
  {
    id: "wallpushup", name: "Wall Push-Up", icon: "💪", group: "push", tier: 1,
    axes: { push: 1 }, muscles: ["chest", "triceps", "front delts"],
    equipment: ["wall"], defaultSets: "3", defaultReps: "8–12",
    prereq: [], unlocks: ["inclinepushup"], invented: true,
    details: {
      steps: [
        "Stand arm's length from a wall, hands flat at shoulder height and width.",
        "Brace your core so your body is one straight line from head to heels.",
        "Bend the elbows to bring your chest toward the wall.",
        "Press back to straight arms. Step further from the wall to make it harder.",
      ],
      cues: ["Keep the body rigid like a moving plank", "Elbows back at ~45°, not flared"],
      mistakes: ["Letting the hips sag or pike", "Standing too close so there's no range"],
      search: "wall push up beginner form",
    },
  },
  {
    id: "inclinepushup", name: "Incline Push-Up", icon: "💪", group: "push", tier: 1,
    axes: { push: 1, core: 0.2 }, muscles: ["chest", "triceps", "front delts"],
    equipment: ["bench"], defaultSets: "3", defaultReps: "8–12",
    prereq: ["wallpushup"], unlocks: ["pushup"], invented: false,
    details: {
      steps: [
        "Place your hands slightly wider than shoulders on a bench or box.",
        "Brace your core so your body is one straight line.",
        "Lower your chest toward the surface, elbows at roughly 45°.",
        "Press back up to straight arms. Lower the surface over time to progress.",
      ],
      cues: ["Squeeze glutes and brace the core", "Elbows back at ~45°, not flared"],
      mistakes: ["Sagging hips", "Flaring elbows straight out to the sides"],
      search: "incline push up beginner form",
    },
  },
  {
    id: "kneepushup", name: "Knee Push-Up", icon: "💪", group: "push", tier: 1,
    axes: { push: 1, core: 0.2 }, muscles: ["chest", "triceps", "front delts"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "8–12",
    prereq: ["wallpushup"], unlocks: ["pushup"], invented: true,
    details: {
      steps: [
        "Kneel and place hands slightly wider than shoulders on the floor.",
        "Form a straight line from knees to head — hips not piked up.",
        "Lower your chest toward the floor, elbows at ~45°.",
        "Press back up to straight arms.",
      ],
      cues: ["Keep a straight line knee-to-head", "Don't let the hips lift"],
      mistakes: ["Piking the hips to shorten the range", "Flaring the elbows wide"],
      search: "knee push up form",
    },
  },
  {
    id: "pushup", name: "Push-Up", icon: "💪", group: "push", tier: 2,
    axes: { push: 1, core: 0.3 }, muscles: ["chest", "triceps", "front delts", "core"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "8–15",
    prereq: ["inclinepushup", "kneepushup"], unlocks: ["feetelevatedpushup", "diamondpushup", "dips"], invented: false,
    details: {
      steps: [
        "Hands slightly wider than shoulders, body in one straight line.",
        "Brace your core so your body is one straight line.",
        "Lower your chest toward the floor, elbows at roughly 45°.",
        "Press back up to straight arms.",
      ],
      cues: ["Squeeze glutes and brace the core", "Elbows back at ~45°, not flared"],
      mistakes: ["Sagging hips", "Flaring elbows straight out to the sides"],
      search: "push up proper form",
    },
  },
  {
    id: "feetelevatedpushup", name: "Feet-Elevated Push-Up", icon: "💪", group: "push", tier: 2,
    axes: { push: 1, shoulders: 0.3, core: 0.3 }, muscles: ["upper chest", "front delts", "triceps"],
    equipment: ["bench", "floor"], defaultSets: "4", defaultReps: "8–12",
    prereq: ["pushup"], unlocks: ["dips", "pikepushup"], invented: false,
    details: {
      steps: [
        "Place your feet on a bench, hands on the floor wider than shoulders.",
        "Brace your core into one straight line, head to heels.",
        "Lower your chest toward the floor — this emphasises the upper chest.",
        "Press back up to straight arms.",
      ],
      cues: ["Keep the body rigid", "Elbows back at ~45°"],
      mistakes: ["Letting the hips sag", "Flaring elbows wide"],
      search: "feet elevated push up upper chest",
    },
  },
  {
    id: "diamondpushup", name: "Diamond Push-Up", icon: "💎", group: "push", tier: 3,
    axes: { push: 1, core: 0.3 }, muscles: ["triceps", "inner chest"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "6–12",
    prereq: ["pushup"], unlocks: ["archerpushup"], invented: true,
    details: {
      steps: [
        "Form a diamond with thumbs and index fingers under your chest.",
        "Body in one straight line, core braced.",
        "Lower your chest to your hands, elbows tucking close to the body.",
        "Press back up. Triceps-dominant, so expect lower reps.",
      ],
      cues: ["Keep elbows tucked, not flared", "Stay in a straight line"],
      mistakes: ["Letting elbows flare wide", "Sagging hips"],
      search: "diamond push up triceps form",
    },
  },
  {
    id: "dips", name: "Dips (assisted → full)", icon: "⬇️", group: "push", tier: 3,
    axes: { push: 1, shoulders: 0.3 }, muscles: ["chest", "triceps", "front delts"],
    equipment: ["parallettes"], defaultSets: "4", defaultReps: "6–10",
    prereq: ["pushup", "feetelevatedpushup"], unlocks: ["ringdip"], invented: false,
    details: {
      steps: [
        "Grip the dip handles and support yourself with straight arms.",
        "Keep feet on the floor early on to assist as much as needed.",
        "Bend the elbows to lower your chest toward the handles.",
        "Press back up. Use less foot assistance over the weeks.",
      ],
      cues: ["Lean the torso slightly forward", "Keep elbows from flaring out wide"],
      mistakes: ["Dropping too deep before you're ready", "Shrugging the shoulders up"],
      shoulder: "Go shallow at first. Front-of-shoulder discomfort means you've gone too deep — shorten the range.",
      search: "parallel bar dips assisted beginner",
    },
  },
  {
    id: "pikepushup", name: "Pike Push-Up", icon: "🔺", group: "push", tier: 3,
    axes: { push: 0.7, shoulders: 0.8 }, muscles: ["front delts", "triceps", "upper chest"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "6–10",
    skill: "handstand", skillStep: 3,
    prereq: ["feetelevatedpushup"], unlocks: ["deficitpikepushup"], invented: false,
    details: {
      steps: [
        "Start in a downward-dog shape: hips high, hands and feet on the floor.",
        "Bend the elbows to lower the top of your head toward the floor.",
        "Keep the path vertical, like a standing overhead press upside down.",
        "Press back up to straight arms.",
      ],
      cues: ["Stack hips over shoulders for more load", "Elbows track slightly forward, not flared"],
      mistakes: ["Turning it into a normal push-up by dropping the hips", "Flaring elbows wide"],
      shoulder: "This loads the shoulder overhead, so only introduce it once your Phase 1 cuff work feels solid and pain-free.",
      search: "pike push up handstand progression",
    },
  },
  {
    id: "archerpushup", name: "Archer Push-Up", icon: "🏹", group: "push", tier: 4,
    axes: { push: 1, core: 0.3 }, muscles: ["chest", "triceps"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "5–8 each",
    prereq: ["diamondpushup", "pushup"], unlocks: ["oneArmPushupNeg"], invented: true,
    details: {
      steps: [
        "Take a wide hand position, body in a straight line.",
        "Lower toward one hand, keeping the other arm straight out to the side.",
        "Press back up, then alternate to the other side.",
        "The straight arm assists less as you get stronger — a step toward one-arm push-ups.",
      ],
      cues: ["Keep the 'archer' arm straight", "Stay rigid through the core"],
      mistakes: ["Letting the hips rotate", "Bending the straight arm to cheat"],
      search: "archer push up progression",
    },
  },
  {
    id: "deficitpikepushup", name: "Deficit Pike Push-Up", icon: "🔺", group: "push", tier: 4,
    axes: { push: 0.6, shoulders: 0.9 }, muscles: ["front delts", "triceps"],
    equipment: ["floor", "parallettes"], defaultSets: "4", defaultReps: "8–10",
    skill: "handstand", skillStep: 4,
    prereq: ["pikepushup"], unlocks: ["wallhspushup"], invented: false,
    details: {
      steps: [
        "Set up as a pike push-up but with hands on books, plates, or parallettes.",
        "The raised hands let your head travel below hand level for more range.",
        "Lower under control, then press back up.",
        "A direct strength builder toward handstand push-ups.",
      ],
      cues: ["Keep hips stacked over shoulders", "Control the deeper range"],
      mistakes: ["Bouncing out of the bottom", "Dropping the hips"],
      shoulder: "Deeper overhead range — only progress here once standard pike push-ups feel strong.",
      search: "deficit pike push up progression",
    },
  },
  {
    id: "oneArmPushupNeg", name: "One-Arm Push-Up (negative)", icon: "✊", group: "push", tier: 5,
    axes: { push: 1, core: 0.5 }, muscles: ["chest", "triceps", "core"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "3–5 each",
    prereq: ["archerpushup"], unlocks: [], invented: true,
    details: {
      steps: [
        "Take a wide stance with feet for stability, one hand behind your back.",
        "Lower as slowly as you can under control on the working arm.",
        "Reset (push with both / step up) rather than pressing the full rep early on.",
        "Build the lowering strength before attempting full reps.",
      ],
      cues: ["Resist the whole way down", "Brace hard against the body rotating"],
      mistakes: ["Dropping fast instead of resisting", "Narrow feet making it unstable"],
      search: "one arm push up negative progression",
    },
  },
  {
    id: "planchetuck", name: "Planche Tuck Hold", icon: "✈️", group: "push", tier: 5,
    axes: { push: 1, shoulders: 0.6, core: 0.6 }, muscles: ["front delts", "chest", "core"],
    equipment: ["floor", "parallettes"], defaultSets: "5", defaultReps: "10–15s",
    skill: "planche", skillStep: 3,
    prereq: ["dips", "ringsupport"], unlocks: [], invented: false,
    details: {
      steps: [
        "Start in a push-up or support position on the floor or parallettes.",
        "Lean your shoulders forward past your hands.",
        "Tuck the knees and shift weight until your feet lift off.",
        "Hold the lean, then lower. Even a partial lean builds strength.",
      ],
      cues: ["Protract — push the floor away and round the upper back", "Lean further forward to increase difficulty"],
      mistakes: ["Not leaning far enough forward", "Letting the shoulders shrug up"],
      shoulder: "Big demand on the front of the shoulder. Progress in small increments of lean.",
      search: "tuck planche lean progression",
    },
  },

  // ======================= PULL =======================
  {
    id: "deadhang", name: "Dead Hang", icon: "🔱", group: "grip", tier: 1,
    axes: { pull: 0.4, grip: 1 }, muscles: ["forearms", "grip", "lats"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "20–30s",
    skill: "muscleup", skillStep: 1,
    prereq: [], unlocks: ["activehang", "negpullup"], invented: false,
    details: {
      steps: [
        "Reach up and grip the pull-up bar with both hands, shoulder-width apart.",
        "Let your feet leave the floor so you hang at full stretch.",
        "Keep a slight engagement in the shoulders — don't hang totally limp.",
        "Hold for time, breathing steadily, then lower your feet down.",
      ],
      cues: ["Gently pull the shoulders down away from the ears", "Relax the lower body"],
      mistakes: ["Holding your breath", "Gripping so hard your forearms fail before the time is up"],
      shoulder: "Gentle decompression that's usually very friendly to recovering shoulders. If hanging fully is uncomfortable, keep a toe on the floor to take some weight.",
      search: "dead hang pull up bar beginner",
    },
  },
  {
    id: "activehang", name: "Active Hang", icon: "🔱", group: "grip", tier: 2,
    axes: { pull: 0.6, grip: 0.9 }, muscles: ["lats", "forearms", "grip"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "10–20s",
    prereq: ["deadhang"], unlocks: ["negpullup", "weighteddeadhang"], invented: true,
    details: {
      steps: [
        "Start in a dead hang from the bar.",
        "Without bending the elbows, pull your shoulder blades down and back.",
        "Your body should rise slightly as the shoulders engage.",
        "Hold the active position, then relax. This 'switches on' the back for pulling.",
      ],
      cues: ["Depress and retract the shoulder blades", "Keep arms straight"],
      mistakes: ["Bending the elbows (that's a pull-up)", "Shrugging up instead of pulling down"],
      shoulder: "Builds the scapular control that protects the shoulder in all pulling.",
      search: "active hang scapular pull up",
    },
  },
  {
    id: "weighteddeadhang", name: "Weighted Dead Hang", icon: "🏋️", group: "grip", tier: 3,
    axes: { grip: 1, pull: 0.3 }, muscles: ["forearms", "grip", "lats"],
    equipment: ["bar", "dumbbell"], defaultSets: "3", defaultReps: "15–20s",
    prereq: ["activehang"], unlocks: ["singlearmhangassisted"], invented: true,
    details: {
      steps: [
        "Hang a light dumbbell from a belt, or hold one between your feet.",
        "Grip the bar and hang at full stretch, shoulders gently engaged.",
        "Hold for time, keeping the swing under control.",
        "Add weight progressively once 20s feels easy bodyweight-only.",
      ],
      cues: ["Keep the hips still — don't let the weight swing you", "Breathe steadily"],
      mistakes: ["Using so much weight your grip fails in a few seconds", "Letting the body twist"],
      search: "weighted dead hang grip strength",
    },
  },
  {
    id: "singlearmhangassisted", name: "Single-Arm Hang (assisted)", icon: "✊", group: "grip", tier: 4,
    axes: { grip: 1, pull: 0.4 }, muscles: ["forearms", "grip", "lats"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "8–12s each",
    prereq: ["weighteddeadhang"], unlocks: ["onearmhang"], invented: true,
    details: {
      steps: [
        "Hang from the bar with both hands.",
        "Shift most of your weight onto one arm, letting the other hand rest lightly on the bar for balance only.",
        "Hold, keeping the shoulder of the working arm packed down.",
        "Switch sides. Reduce how much the assisting hand helps over time.",
      ],
      cues: ["Treat the second hand as a spotter, not a load-bearer", "Keep the working shoulder pulled down"],
      mistakes: ["Leaning on the assisting hand too much", "Letting the body swing"],
      search: "single arm hang progression",
    },
  },
  {
    id: "onearmhang", name: "One-Arm Hang", icon: "✊", group: "grip", tier: 5,
    axes: { grip: 1, pull: 0.5 }, muscles: ["forearms", "grip", "lats"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "5–10s each",
    prereq: ["singlearmhangassisted"], unlocks: [], invented: true,
    details: {
      steps: [
        "Grip the bar with one hand, shoulder packed down and back.",
        "Lift the feet and hang with full bodyweight on the one arm.",
        "Hold for time without swinging, then step down under control.",
        "Switch arms. A genuine grip-strength milestone.",
      ],
      cues: ["Pack the shoulder down before lifting the feet", "Keep the free arm relaxed at your side"],
      mistakes: ["Shrugging the working shoulder up toward the ear", "Kicking or swinging for momentum"],
      search: "one arm hang grip strength",
    },
  },
  {
    id: "ringrowupright", name: "Ring Row (upright)", icon: "💍", group: "pull", tier: 1,
    axes: { pull: 1, core: 0.2 }, muscles: ["upper back", "rear delts", "biceps"],
    equipment: ["rings"], defaultSets: "3", defaultReps: "8–12",
    prereq: [], unlocks: ["ringrowhorizontal", "negpullup"], invented: false,
    details: {
      steps: [
        "Set the rings to roughly hip height and grab a handle in each hand.",
        "Walk your feet forward so your body is leaning back, straight as a plank.",
        "Pull your chest toward the rings, driving elbows back.",
        "Lower slowly. Stay more upright to keep it easier.",
      ],
      cues: ["Keep hips up — don't let them sag", "Squeeze shoulder blades at the top"],
      mistakes: ["Letting the hips drop", "Shrugging the shoulders up toward the ears"],
      shoulder: "A shoulder-friendly horizontal pull. Start more upright and lower your body angle gradually as you get stronger.",
      search: "ring row inverted row beginner form",
    },
  },
  {
    id: "negpullup", name: "Negative Pull-Up", icon: "⬆️", group: "pull", tier: 2,
    axes: { pull: 1, grip: 0.4 }, muscles: ["lats", "biceps", "upper back"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "3–5",
    prereq: ["activehang", "ringrowupright"], unlocks: ["pullup"], invented: false,
    details: {
      steps: [
        "Use a box or jump to get your chin above the bar.",
        "Hold the top position for a second, chest tall.",
        "Lower yourself as slowly as you can — aim for 3–5 seconds.",
        "Step back up and repeat; don't rep out the lowering fast.",
      ],
      cues: ["Fight gravity the whole way down", "Keep shoulder blades pulling down"],
      mistakes: ["Dropping quickly instead of resisting", "Shrugging at the top"],
      search: "negative pull up progression beginner",
    },
  },
  {
    id: "ringrowhorizontal", name: "Ring Row (horizontal)", icon: "💍", group: "pull", tier: 2,
    axes: { pull: 1, rear: 0.4, core: 0.3 }, muscles: ["upper back", "rear delts", "biceps"],
    equipment: ["rings"], defaultSets: "4", defaultReps: "8–10",
    prereq: ["ringrowupright"], unlocks: ["pullup"], invented: false,
    details: {
      steps: [
        "Lower the rings or walk your feet further forward so your body is more horizontal.",
        "Keep a straight plank line from head to heels.",
        "Pull your chest to the rings, elbows driving back.",
        "Lower slowly. More horizontal = harder.",
      ],
      cues: ["Keep hips up", "Squeeze shoulder blades at the top"],
      mistakes: ["Hips sagging", "Shrugging the shoulders"],
      shoulder: "Excellent rear-delt and upper-back work that balances all the pressing.",
      search: "horizontal ring row rear delt",
    },
  },
  {
    id: "dumbbellrow", name: "Dumbbell Row", icon: "🏋️", group: "pull", tier: 2,
    axes: { pull: 1 }, muscles: ["lats", "mid back", "biceps"],
    equipment: ["dumbbell", "bench"], defaultSets: "3", defaultReps: "10 each",
    prereq: [], unlocks: ["pullup"], invented: false,
    details: {
      steps: [
        "Place one hand and knee on a bench, other foot on the floor.",
        "Let the dumbbell hang at arm's length below you.",
        "Pull the dumbbell up toward your hip, driving the elbow back.",
        "Squeeze the back, then lower slowly.",
      ],
      cues: ["Pull to the hip, not the shoulder", "Keep the back flat and still"],
      mistakes: ["Rotating the torso to heave the weight", "Shrugging the shoulder"],
      search: "one arm dumbbell row form",
    },
  },
  {
    id: "pullup", name: "Pull-Up", icon: "⬆️", group: "pull", tier: 3,
    axes: { pull: 1, grip: 0.4 }, muscles: ["lats", "biceps", "upper back"],
    equipment: ["bar", "band"], defaultSets: "4", defaultReps: "4–8",
    skill: "muscleup", skillStep: 2,
    prereq: ["negpullup", "ringrowhorizontal", "dumbbellrow"], unlocks: ["weightedpullup", "archerpullup", "tuckfrontlever"], invented: false,
    details: {
      steps: [
        "Grip the bar slightly wider than shoulders, palms facing away.",
        "Start from a dead hang, then pull your shoulder blades down and back.",
        "Drive your elbows down to bring your chin over the bar.",
        "Lower under control to a full hang. Use a band looped over the bar to assist.",
      ],
      cues: ["Lead with the chest, not the chin", "Imagine pulling the bar down to you"],
      mistakes: ["Kipping/swinging for momentum", "Not going all the way to a full hang each rep"],
      search: "pull up proper form band assisted",
    },
  },
  {
    id: "archerpullup", name: "Archer Pull-Up", icon: "🏹", group: "pull", tier: 4,
    axes: { pull: 1, grip: 0.4 }, muscles: ["lats", "biceps"],
    equipment: ["bar"], defaultSets: "4", defaultReps: "4–6 each",
    prereq: ["pullup"], unlocks: ["oneArmPullupNeg"], invented: true,
    details: {
      steps: [
        "Take a wide grip on the bar.",
        "Pull up toward one hand, keeping the other arm straight out along the bar.",
        "The straight arm assists less over time — a step toward one-arm pull-ups.",
        "Lower under control and alternate sides.",
      ],
      cues: ["Pull mostly with one arm", "Keep the assisting arm straight"],
      mistakes: ["Bending the straight arm to cheat", "Swinging for momentum"],
      search: "archer pull up progression",
    },
  },
  {
    id: "weightedpullup", name: "Weighted Pull-Up", icon: "⬆️", group: "pull", tier: 4,
    axes: { pull: 1, grip: 0.5 }, muscles: ["lats", "biceps", "upper back"],
    equipment: ["bar", "dumbbell"], defaultSets: "4", defaultReps: "5–6",
    prereq: ["pullup"], unlocks: ["muscleup"], invented: false,
    details: {
      steps: [
        "Hold a dumbbell between your feet or in a belt.",
        "Perform a strict pull-up with the added load.",
        "Full range — dead hang to chin over bar.",
        "Build the raw pulling strength that muscle-ups demand.",
      ],
      cues: ["Strict form, no kipping", "Full range each rep"],
      mistakes: ["Shortening the range with the added weight", "Swinging"],
      search: "weighted pull up strength",
    },
  },
  {
    id: "oneArmPullupNeg", name: "One-Arm Pull-Up (negative)", icon: "✊", group: "pull", tier: 5,
    axes: { pull: 1, grip: 0.7 }, muscles: ["lats", "biceps", "forearms"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "2–4 each",
    prereq: ["archerpullup", "weightedpullup"], unlocks: [], invented: true,
    details: {
      steps: [
        "Get your chin over the bar with one hand (jump or assist up).",
        "Release the other hand and lower as slowly as you can.",
        "Control the descent fully — this builds the strength for the full move.",
        "Reset and repeat. Expect very low reps.",
      ],
      cues: ["Resist the whole way down", "Keep the shoulder engaged, not dumping"],
      mistakes: ["Dropping fast", "Letting the shoulder shrug up at the top"],
      shoulder: "Extremely demanding on the shoulder and elbow — build slowly.",
      search: "one arm pull up negative progression",
    },
  },
  {
    id: "muscleup", name: "Muscle-Up", icon: "👑", group: "pull", tier: 5,
    axes: { pull: 1, push: 0.5, grip: 0.5 }, muscles: ["lats", "chest", "triceps", "core"],
    equipment: ["bar", "rings"], defaultSets: "5", defaultReps: "3–5",
    skill: "muscleup", skillStep: 5,
    prereq: ["weightedpullup", "ringdip"], unlocks: ["ringmuscleup"], invented: false,
    details: {
      steps: [
        "Start with a strong false-grip hang (wrists over the rings/bar).",
        "Pull explosively, bringing your chest high toward the rings.",
        "As you reach the top, roll the wrists and lean forward through the transition.",
        "Press out of the dip to lockout. Use a band or jump to assist early on.",
      ],
      cues: ["Pull high before transitioning", "Keep the rings/bar close to the body"],
      mistakes: ["Trying to transition too low", "Chicken-winging one arm through"],
      shoulder: "Demanding on the shoulder through the transition. A genuine goal exercise — build pull-ups and dips solidly first.",
      search: "muscle up progression beginner false grip",
    },
  },

  // ======================= LEGS =======================
  {
    id: "glutebridge", name: "Glute Bridge", icon: "🍑", group: "legs", tier: 1,
    axes: { legs: 1 }, muscles: ["glutes", "hamstrings"],
    equipment: ["floor", "dumbbell"], defaultSets: "3", defaultReps: "12–15",
    prereq: [], unlocks: ["singlelegglutebridge", "bulgarianbw"], invented: false,
    details: {
      steps: [
        "Lie on your back, knees bent, feet flat and hip-width apart.",
        "Drive through your heels to lift your hips.",
        "Squeeze the glutes hard at the top, body in a straight line.",
        "Lower slowly. Rest a dumbbell across the hips to add load.",
      ],
      cues: ["Push through the heels", "Squeeze the glutes, don't arch the lower back"],
      mistakes: ["Overarching the lower back at the top", "Pushing through the toes"],
      search: "glute bridge exercise form",
    },
  },
  {
    id: "bodyweightsquat", name: "Bodyweight Squat", icon: "🦵", group: "legs", tier: 1,
    axes: { legs: 1 }, muscles: ["quads", "glutes"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "12–20",
    prereq: [], unlocks: ["bulgarianbw", "walkinglunge"], invented: true,
    details: {
      steps: [
        "Stand with feet shoulder-width, toes slightly out.",
        "Push your hips back and bend the knees to lower down.",
        "Go as deep as you can with a flat back — aim for thighs parallel or below.",
        "Drive through the heels to stand back up.",
      ],
      cues: ["Knees track over the toes", "Keep the chest up and back flat"],
      mistakes: ["Knees caving inward", "Heels lifting off the floor"],
      search: "bodyweight squat form",
    },
  },
  {
    id: "singlelegglutebridge", name: "Single-Leg Glute Bridge", icon: "🍑", group: "legs", tier: 2,
    axes: { legs: 1, core: 0.2 }, muscles: ["glutes", "hamstrings"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "10–12 each",
    prereq: ["glutebridge"], unlocks: ["romaniandeadlift"], invented: true,
    details: {
      steps: [
        "Set up as a glute bridge, then extend one leg straight.",
        "Drive through the planted heel to lift the hips.",
        "Keep the hips level — don't let one side drop.",
        "Lower with control and repeat, then switch legs.",
      ],
      cues: ["Keep the hips square", "Squeeze the glute of the working leg"],
      mistakes: ["Letting the hips tilt", "Pushing through the toes"],
      search: "single leg glute bridge form",
    },
  },
  {
    id: "walkinglunge", name: "Walking Lunge", icon: "🚶", group: "legs", tier: 2,
    axes: { legs: 1 }, muscles: ["quads", "glutes", "hamstrings"],
    equipment: ["floor", "dumbbell"], defaultSets: "3", defaultReps: "10 each",
    prereq: ["bodyweightsquat"], unlocks: ["bulgarianweighted"], invented: true,
    details: {
      steps: [
        "Step forward into a lunge, lowering the back knee toward the floor.",
        "Keep the front shin roughly vertical.",
        "Drive through the front heel to step the back foot through into the next lunge.",
        "Hold dumbbells to add load.",
      ],
      cues: ["Stay tall through the torso", "Control the descent of the back knee"],
      mistakes: ["Front knee caving in", "Leaning too far forward"],
      search: "walking lunge form",
    },
  },
  {
    id: "bulgarianbw", name: "Bulgarian Split Squat (bodyweight)", icon: "🦵", group: "legs", tier: 2,
    axes: { legs: 1, core: 0.2 }, muscles: ["quads", "glutes"],
    equipment: ["bench"], defaultSets: "3", defaultReps: "8–10 each",
    prereq: ["glutebridge", "bodyweightsquat"], unlocks: ["bulgarianweighted"], invented: false,
    details: {
      steps: [
        "Stand a stride in front of a bench. Place the top of one foot behind you on it.",
        "Keep most of your weight on the front foot.",
        "Lower straight down until the front thigh is roughly parallel.",
        "Drive up through the front heel.",
      ],
      cues: ["Keep the front shin fairly vertical", "Stay tall through the torso"],
      mistakes: ["Front knee caving inward", "Leaning too far forward and loading the back leg"],
      search: "bulgarian split squat proper form",
    },
  },
  {
    id: "romaniandeadlift", name: "Romanian Deadlift (dumbbells)", icon: "🦿", group: "legs", tier: 2,
    axes: { legs: 1 }, muscles: ["hamstrings", "glutes", "lower back"],
    equipment: ["dumbbell"], defaultSets: "3", defaultReps: "10–12",
    prereq: ["singlelegglutebridge"], unlocks: ["bulgarianweighted"], invented: false,
    details: {
      steps: [
        "Hold a dumbbell in each hand in front of your thighs.",
        "With a slight knee bend, push your hips back and hinge forward.",
        "Let the weights track down close to your legs until you feel a hamstring stretch.",
        "Drive your hips forward to stand back up.",
      ],
      cues: ["Hinge at the hips, don't squat", "Keep the back flat and weights close to the legs"],
      mistakes: ["Rounding the lower back", "Turning it into a squat by bending the knees too much"],
      search: "dumbbell romanian deadlift form",
    },
  },
  {
    id: "bulgarianweighted", name: "Bulgarian Split Squat (weighted)", icon: "🦵", group: "legs", tier: 3,
    axes: { legs: 1, core: 0.2 }, muscles: ["quads", "glutes", "hamstrings"],
    equipment: ["bench", "dumbbell"], defaultSets: "4", defaultReps: "8–10 each",
    prereq: ["bulgarianbw", "walkinglunge", "romaniandeadlift"], unlocks: ["pistolprogression"], invented: false,
    details: {
      steps: [
        "Set up as a bodyweight Bulgarian split squat, holding dumbbells.",
        "Keep most of your weight on the front foot.",
        "Lower until the front thigh is roughly parallel.",
        "Drive up through the front heel. Increase weight progressively.",
      ],
      cues: ["Keep the front shin fairly vertical", "Increase load when 10 reps feels easy"],
      mistakes: ["Front knee caving in", "Loading the back leg too much"],
      search: "weighted bulgarian split squat",
    },
  },
  {
    id: "pistolprogression", name: "Pistol Squat Progression", icon: "🔫", group: "legs", tier: 4,
    axes: { legs: 1, core: 0.3 }, muscles: ["quads", "glutes"],
    equipment: ["floor", "bench"], defaultSets: "4", defaultReps: "5–8 each",
    prereq: ["bulgarianweighted"], unlocks: ["pistolsquat"], invented: true,
    details: {
      steps: [
        "Stand on one leg with the other extended in front.",
        "Lower to a box or bench behind you (raise it to make it easier).",
        "Lightly touch and stand back up on the one leg.",
        "Lower the box over time to build toward a full pistol.",
      ],
      cues: ["Keep the extended leg off the floor", "Control the descent"],
      mistakes: ["Crashing onto the box", "Letting the knee cave"],
      search: "pistol squat box progression",
    },
  },
  {
    id: "pistolsquat", name: "Pistol Squat", icon: "🔫", group: "legs", tier: 5,
    axes: { legs: 1, core: 0.4 }, muscles: ["quads", "glutes", "ankles"],
    equipment: ["floor"], defaultSets: "4", defaultReps: "3–6 each",
    prereq: ["pistolprogression"], unlocks: [], invented: true,
    details: {
      steps: [
        "Stand on one leg, the other extended straight in front.",
        "Lower all the way down under control, keeping the heel planted.",
        "Pause at the bottom, then drive back up to standing.",
        "Full single-leg strength, balance, and mobility in one.",
      ],
      cues: ["Keep the heel down", "Arms forward to counterbalance"],
      mistakes: ["Heel lifting", "Collapsing at the bottom"],
      search: "pistol squat full form",
    },
  },

  // ======================= CORE =======================
  {
    id: "plank", name: "Plank Hold", icon: "⬜", group: "core", tier: 1,
    axes: { core: 1 }, muscles: ["abs", "obliques"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "20–30s",
    prereq: [], unlocks: ["sideplank", "hollowbody"], invented: false,
    details: {
      steps: [
        "Set up on your forearms and toes, elbows under shoulders.",
        "Form a straight line from head to heels.",
        "Brace your core and squeeze your glutes.",
        "Hold for time, breathing steadily.",
      ],
      cues: ["Tuck the ribs down and tilt the pelvis slightly under", "Don't let the hips rise or sag"],
      mistakes: ["Hips creeping up into a peak", "Letting the lower back sag"],
      search: "plank hold proper form",
    },
  },
  {
    id: "hollowbody", name: "Hollow Body Hold", icon: "🌙", group: "core", tier: 1,
    axes: { core: 1 }, muscles: ["abs", "hip flexors"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "15–20s",
    skill: "lsit", skillStep: 1,
    prereq: [], unlocks: ["hollowrock", "tuckLsit"], invented: false,
    details: {
      steps: [
        "Lie on your back, arms overhead, legs straight.",
        "Press your lower back firmly into the floor.",
        "Lift your shoulders and legs a few inches off the ground.",
        "Hold the dish shape. Bend the knees or lower the arms to make it easier.",
      ],
      cues: ["Lower back stays glued to the floor the whole time", "Keep it tight, not floppy"],
      mistakes: ["Lower back arching off the floor", "Lifting too high so it becomes easy"],
      search: "hollow body hold gymnastics core",
    },
  },
  {
    id: "deadbug", name: "Dead Bug", icon: "🐛", group: "core", tier: 1,
    axes: { core: 1 }, muscles: ["abs", "deep core"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "8 each side",
    prereq: [], unlocks: ["hollowbody"], invented: false,
    details: {
      steps: [
        "Lie on your back, arms pointing at the ceiling, knees bent at 90°.",
        "Press your lower back into the floor.",
        "Slowly extend one arm overhead and the opposite leg out straight.",
        "Return and repeat on the other side.",
      ],
      cues: ["Move slowly and keep the lower back pinned", "Exhale as you extend"],
      mistakes: ["Letting the back arch as the limbs extend", "Rushing the reps"],
      search: "dead bug core exercise form",
    },
  },
  {
    id: "sideplank", name: "Side Plank", icon: "📐", group: "core", tier: 2,
    axes: { core: 1 }, muscles: ["obliques"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "20–30s each",
    skill: "humanflag", skillStep: 1,
    prereq: ["plank"], unlocks: ["hangingkneeraise"], invented: true,
    details: {
      steps: [
        "Lie on your side, elbow under your shoulder, legs stacked.",
        "Lift your hips so your body is a straight line.",
        "Hold, keeping the top hip from sagging or rotating.",
        "Switch sides. A foundation for the human flag.",
      ],
      cues: ["Stack the shoulders and hips", "Push the floor away through the elbow"],
      mistakes: ["Letting the hips sag", "Rotating forward"],
      search: "side plank oblique form",
    },
  },
  {
    id: "hollowrock", name: "Hollow Rock", icon: "🌙", group: "core", tier: 2,
    axes: { core: 1 }, muscles: ["abs", "hip flexors"],
    equipment: ["floor"], defaultSets: "3", defaultReps: "10–15",
    prereq: ["hollowbody"], unlocks: ["tuckLsit"], invented: true,
    details: {
      steps: [
        "Start in a hollow body hold position.",
        "Keeping the dish shape rigid, rock back and forth from shoulders to hips.",
        "The movement comes from the whole body, not bending in the middle.",
        "Maintain the hollow throughout.",
      ],
      cues: ["Stay rigid like a banana", "Rock from the shoulders, don't pike"],
      mistakes: ["Losing the hollow shape", "Bending at the hips"],
      search: "hollow rock core gymnastics",
    },
  },
  {
    id: "hangingkneeraise", name: "Hanging Knee Raise", icon: "🦵", group: "core", tier: 2,
    axes: { core: 1, grip: 0.4 }, muscles: ["lower abs", "hip flexors", "grip"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "10–12",
    prereq: ["hollowbody", "deadhang"], unlocks: ["hanglegraise", "tuckLsit"], invented: true,
    details: {
      steps: [
        "Hang from the bar in an active hang.",
        "Without swinging, raise your knees toward your chest.",
        "Pause, then lower under control.",
        "Avoid using momentum — the slower the better.",
      ],
      cues: ["Curl the pelvis up slightly at the top", "No swinging"],
      mistakes: ["Kipping/swinging for reps", "Just lifting the legs without the pelvis"],
      search: "hanging knee raise core form",
    },
  },
  {
    id: "tuckLsit", name: "Tuck L-Sit", icon: "✈️", group: "core", tier: 3,
    axes: { core: 1, push: 0.3 }, muscles: ["abs", "hip flexors", "triceps"],
    equipment: ["parallettes", "floor"], defaultSets: "3", defaultReps: "10–15s",
    skill: "lsit", skillStep: 2,
    prereq: ["hollowrock", "hangingkneeraise"], unlocks: ["onelegLsit", "Lsit"], invented: false,
    details: {
      steps: [
        "Support yourself on parallettes, the floor, or dip handles, arms straight.",
        "Lift your knees up into a tuck (easiest version).",
        "Hold, keeping shoulders pushed down and chest tall.",
        "Progress by extending the legs over time.",
      ],
      cues: ["Push the floor away to depress the shoulders", "Round the lower back slightly into a hollow"],
      mistakes: ["Letting the shoulders shrug up", "Leaning too far back"],
      search: "L-sit progression tuck beginner",
    },
  },
  {
    id: "onelegLsit", name: "One-Leg L-Sit", icon: "✈️", group: "core", tier: 3,
    axes: { core: 1, push: 0.3 }, muscles: ["abs", "hip flexors", "triceps"],
    equipment: ["parallettes", "floor"], defaultSets: "3", defaultReps: "8–12s",
    skill: "lsit", skillStep: 3,
    prereq: ["tuckLsit"], unlocks: ["Lsit"], invented: true,
    details: {
      steps: [
        "From a tuck L-sit, extend one leg straight out in front.",
        "Keep the other knee tucked.",
        "Hold, then switch which leg is extended.",
        "A halfway point between tuck and full L-sit.",
      ],
      cues: ["Keep the shoulders depressed", "Hold the extended leg up to height"],
      mistakes: ["Dropping the extended leg", "Shrugging the shoulders"],
      search: "one leg L-sit progression",
    },
  },
  {
    id: "Lsit", name: "Full L-Sit", icon: "🚀", group: "core", tier: 4,
    axes: { core: 1, push: 0.4, grip: 0.3 }, muscles: ["abs", "hip flexors", "triceps", "quads"],
    equipment: ["parallettes", "floor"], defaultSets: "4", defaultReps: "10–15s",
    skill: "lsit", skillStep: 4,
    prereq: ["onelegLsit"], unlocks: ["vsit", "tuckfrontlever"], invented: false,
    details: {
      steps: [
        "Support on parallettes or the floor, arms straight, shoulders down.",
        "Extend both legs straight out, parallel to the ground.",
        "Hold the L-shape, toes pointed, chest tall.",
        "Keep the shoulders pushed down throughout.",
      ],
      cues: ["Push the floor away hard", "Squeeze the quads to keep legs straight"],
      mistakes: ["Letting the legs drop below parallel", "Shoulders shrugging up"],
      search: "full L-sit hold form",
    },
  },
  {
    id: "hanglegraise", name: "Hanging Leg Raise", icon: "🦵", group: "core", tier: 4,
    axes: { core: 1, grip: 0.4 }, muscles: ["lower abs", "hip flexors", "grip"],
    equipment: ["bar"], defaultSets: "3", defaultReps: "8–12",
    prereq: ["hangingkneeraise"], unlocks: ["vsit"], invented: true,
    details: {
      steps: [
        "Hang from the bar in an active hang.",
        "Keeping the legs straight, raise them up toward the bar.",
        "Aim for toes-to-bar over time; pause and lower under control.",
        "No swinging — strict and slow.",
      ],
      cues: ["Curl the pelvis at the top", "Keep the legs straight"],
      mistakes: ["Swinging for momentum", "Bending the knees"],
      search: "hanging leg raise strict form",
    },
  },
  {
    id: "vsit", name: "V-Sit", icon: "🚀", group: "core", tier: 5,
    axes: { core: 1, push: 0.4 }, muscles: ["abs", "hip flexors", "triceps"],
    equipment: ["parallettes", "floor"], defaultSets: "4", defaultReps: "5–10s",
    skill: "lsit", skillStep: 5,
    prereq: ["Lsit"], unlocks: [], invented: true,
    details: {
      steps: [
        "From a full L-sit, push the hips up and raise the legs higher than the L.",
        "Aim for the legs to rise toward a V shape above parallel.",
        "Requires strong compression and straight-arm strength.",
        "Hold as long as control allows.",
      ],
      cues: ["Push down hard to lift the hips", "Compress the legs up"],
      mistakes: ["Bending the arms", "Legs dropping back to an L"],
      search: "V-sit hold progression",
    },
  },
  {
    id: "tuckfrontlever", name: "Tuck Front Lever", icon: "🎯", group: "core", tier: 5,
    axes: { core: 1, pull: 0.7, grip: 0.4 }, muscles: ["lats", "abs", "core"],
    equipment: ["bar", "rings"], defaultSets: "5", defaultReps: "10–15s",
    skill: "frontlever", skillStep: 2,
    prereq: ["Lsit", "pullup"], unlocks: ["straddlefrontlever"], invented: false,
    details: {
      steps: [
        "Hang from the bar and pull your shoulder blades down and back.",
        "Tuck your knees and lift your body until your back is horizontal.",
        "Keep the arms straight and the body tucked tight.",
        "Hold, then lower under control. The first real front-lever step.",
      ],
      cues: ["Keep the arms dead straight", "Pull the shoulders down and protract slightly"],
      mistakes: ["Bending the arms", "Letting the hips drop below the shoulders"],
      shoulder: "Demands strong straight-arm scapular control — build pulling strength first.",
      search: "tuck front lever progression",
    },
  },

  // ======================= SHOULDERS (incl. handstand line + prehab) =======================
  {
    id: "bandexternalrotation", name: "Band External Rotation", icon: "🩹", group: "shoulders", tier: 1,
    axes: { shoulders: 1 }, muscles: ["rotator cuff", "rear delt"],
    equipment: ["band"], defaultSets: "3", defaultReps: "15–20",
    prereq: [], unlocks: ["facepull", "lateralraise"], invented: false,
    details: {
      steps: [
        "Anchor a light band at elbow height, or hold it in both hands.",
        "Tuck your working elbow into your side, bent at 90°, forearm across your stomach.",
        "Keeping the elbow pinned to your ribs, rotate your forearm outward.",
        "Pause briefly at the end, then return slowly under control.",
      ],
      cues: ["Keep a rolled towel between elbow and ribs to keep the elbow still", "Move from the shoulder, not the wrist"],
      mistakes: ["Letting the elbow drift away from the body", "Using a band so heavy you shrug or twist your torso"],
      shoulder: "This is the cornerstone of rotator cuff rehab. Stay light and pain-free — you should feel the muscles behind the shoulder working, never a pinch.",
      search: "band external rotation rotator cuff exercise",
    },
  },
  {
    id: "facepull", name: "Band Face Pull", icon: "🎯", group: "shoulders", tier: 1,
    axes: { shoulders: 1, pull: 0.3 }, muscles: ["rear delt", "rotator cuff", "upper back"],
    equipment: ["band"], defaultSets: "3", defaultReps: "15–20",
    prereq: ["bandexternalrotation"], unlocks: ["wallhandstand"], invented: false,
    details: {
      steps: [
        "Anchor the band at roughly head height (over the pull-up bar works).",
        "Hold the band with both hands, arms extended toward the anchor.",
        "Pull the band toward your face, splitting your hands apart as you go.",
        "Finish with elbows high and wide, hands beside your ears. Return slowly.",
      ],
      cues: ["Think 'pull the band apart', not just back", "Squeeze the shoulder blades together at the end"],
      mistakes: ["Letting the elbows drop low (turns it into a row)", "Using momentum instead of control"],
      shoulder: "One of the best exercises for shoulder health — it strengthens the rear delt and cuff stabilisers that pressing neglects. This is why it appears in every phase.",
      search: "band face pull rear delt exercise form",
    },
  },
  {
    id: "lateralraise", name: "Dumbbell Lateral Raise", icon: "🩹", group: "shoulders", tier: 2,
    axes: { shoulders: 1 }, muscles: ["side delt"],
    equipment: ["dumbbell"], defaultSets: "3", defaultReps: "12–15",
    prereq: ["bandexternalrotation"], unlocks: [], invented: false,
    details: {
      steps: [
        "Stand with a light dumbbell in each hand at your sides.",
        "With a soft bend in the elbows, raise the weights out to the sides.",
        "Stop when your arms reach shoulder height — no higher.",
        "Lower slowly over 2–3 seconds.",
      ],
      cues: ["Lead with the elbows, not the hands", "Imagine pouring a jug of water at the top"],
      mistakes: ["Swinging the weights up with momentum", "Raising above shoulder height, which can aggravate the shoulder"],
      shoulder: "Builds the side delt for shoulder width. Keep it light given your cuff — controlled reps matter far more than weight here.",
      search: "dumbbell lateral raise proper form",
    },
  },
  {
    id: "ringsupport", name: "Ring Support Hold", icon: "💍", group: "shoulders", tier: 2,
    axes: { shoulders: 1, push: 0.5 }, muscles: ["shoulders", "stabilisers", "triceps"],
    equipment: ["rings"], defaultSets: "3", defaultReps: "10–15s",
    prereq: ["facepull"], unlocks: ["ringdip"], invented: false,
    details: {
      steps: [
        "Hold a ring in each hand and press down to lift yourself off the floor.",
        "Lock the arms straight, rings pressed against the sides of your hips.",
        "Turn the rings slightly outward and squeeze everything tight.",
        "Hold for time, staying hollow and stable.",
      ],
      cues: ["Push the rings down and into your sides", "Keep shoulders down, away from the ears"],
      mistakes: ["Bent arms", "Letting the rings drift wide and wobble"],
      shoulder: "Excellent for rebuilding shoulder stability. If full support is too much, keep a foot lightly on the floor and build up.",
      search: "ring support hold beginner",
    },
  },
  {
    id: "wallhandstand", name: "Wall Handstand (chest to wall)", icon: "🧱", group: "shoulders", tier: 2,
    axes: { shoulders: 1, core: 0.3 }, muscles: ["shoulders", "triceps", "core"],
    equipment: ["wall"], defaultSets: "5", defaultReps: "20–30s",
    skill: "handstand", skillStep: 1,
    prereq: ["facepull"], unlocks: ["handstandshouldertaps", "handstandwallrun"], invented: false,
    details: {
      steps: [
        "Face the wall, hands on the floor a hand-span from it.",
        "Walk your feet up the wall as you walk your hands closer in.",
        "Aim for a tall, straight body with chest toward the wall.",
        "Hold for time, then walk back down under control.",
      ],
      cues: ["Push the floor away through straight arms", "Squeeze glutes and point the toes"],
      mistakes: ["Arching the lower back into a banana shape", "Bending the arms"],
      shoulder: "This puts a lot of weight overhead. Introduce it gradually and skip it on any day your shoulder feels off.",
      search: "wall handstand hold beginner chest to wall",
    },
  },
  {
    id: "ringdip", name: "Ring Dip", icon: "💍", group: "shoulders", tier: 3,
    axes: { shoulders: 0.5, push: 1 }, muscles: ["chest", "triceps", "shoulders", "stabilisers"],
    equipment: ["rings"], defaultSets: "4", defaultReps: "8–10",
    skill: "muscleup", skillStep: 3,
    prereq: ["ringsupport", "dips"], unlocks: ["muscleup"], invented: false,
    details: {
      steps: [
        "Begin in a straight-arm ring support, rings beside your hips.",
        "Bend the elbows to lower, keeping the rings close to your torso.",
        "Lower to about 90° at the elbow (or less early on).",
        "Press back up and turn the rings slightly outward at the top.",
      ],
      cues: ["Control the wobble — slow tempo", "Keep elbows pointing back, not flaring wide"],
      mistakes: ["Bouncing out of the bottom", "Allowing the rings to swing"],
      shoulder: "Heavy on the shoulders — keep depth conservative and stop if you feel any pinching at the front of the shoulder.",
      search: "ring dip proper form",
    },
  },
  {
    id: "handstandshouldertaps", name: "Handstand Shoulder Taps (wall)", icon: "👋", group: "shoulders", tier: 3,
    axes: { shoulders: 1, core: 0.4 }, muscles: ["shoulders", "core", "stabilisers"],
    equipment: ["wall"], defaultSets: "3", defaultReps: "5 each side",
    skill: "handstand", skillStep: 2,
    prereq: ["wallhandstand"], unlocks: ["freehandstandkickup"], invented: false,
    details: {
      steps: [
        "Get into a wall handstand, stable and tall.",
        "Shift your weight slightly onto one hand.",
        "Briefly lift the other hand to tap the opposite shoulder.",
        "Replace it and repeat on the other side.",
      ],
      cues: ["Tiny weight shift, not a big lean", "Stay tight through the core"],
      mistakes: ["Collapsing to one side", "Rushing the taps"],
      search: "handstand shoulder taps wall",
    },
  },
  {
    id: "handstandwallrun", name: "Handstand Wall Run", icon: "🧱", group: "shoulders", tier: 3,
    axes: { shoulders: 1, core: 0.4 }, muscles: ["shoulders", "core"],
    equipment: ["wall"], defaultSets: "3", defaultReps: "5",
    skill: "handstand", skillStep: 2,
    prereq: ["wallhandstand"], unlocks: ["freehandstandkickup"], invented: false,
    details: {
      steps: [
        "Start in a push-up position with feet against the base of a wall.",
        "Walk your feet up the wall while walking your hands toward it.",
        "Go as far as your control allows, building toward vertical.",
        "Walk back down with control.",
      ],
      cues: ["Move slowly and stay braced", "Keep arms straight and strong"],
      mistakes: ["Letting the lower back sag", "Rushing up and losing control"],
      shoulder: "Loads the shoulders overhead — ease into how far up you walk.",
      search: "handstand wall walk drill",
    },
  },
  {
    id: "freehandstandkickup", name: "Freestanding Handstand", icon: "🤸", group: "shoulders", tier: 4,
    axes: { shoulders: 1, core: 0.5 }, muscles: ["shoulders", "core", "stabilisers"],
    equipment: ["floor"], defaultSets: "10 attempts", defaultReps: "max hold",
    skill: "handstand", skillStep: 5,
    prereq: ["handstandshouldertaps", "handstandwallrun"], unlocks: ["wallhspushup"], invented: false,
    details: {
      steps: [
        "From a lunge, place hands shoulder-width on the floor.",
        "Kick your back leg up and follow with the other to find balance.",
        "Use small finger and wrist pressure to balance (press fingers to stop falling over).",
        "Bail safely by cartwheeling out if you overbalance.",
      ],
      cues: ["Look at the floor between your hands", "Balance with the fingertips, not the whole arm"],
      mistakes: ["Kicking up too hard and flipping over", "Holding your breath"],
      shoulder: "The most demanding overhead position in the plan. Only progress here once wall handstands feel strong and pain-free.",
      search: "freestanding handstand kick up balance",
    },
  },
  {
    id: "wallhspushup", name: "Handstand Push-Up (wall)", icon: "💥", group: "shoulders", tier: 5,
    axes: { shoulders: 1, push: 0.7, core: 0.4 }, muscles: ["shoulders", "triceps", "core"],
    equipment: ["wall"], defaultSets: "4", defaultReps: "3–6",
    skill: "handstand", skillStep: 6,
    prereq: ["freehandstandkickup", "deficitpikepushup"], unlocks: [], invented: false,
    details: {
      steps: [
        "Kick up into a wall handstand, hands a little wider than shoulders.",
        "Bend the elbows to lower the top of your head toward the floor.",
        "Lightly touch the floor, then press back up to straight arms.",
        "Reduce range (use a cushion stack) if full depth is too much.",
      ],
      cues: ["Keep the body tight and vertical", "Press evenly through both hands"],
      mistakes: ["Arching to cheat the press", "Flaring the elbows wide"],
      shoulder: "Very heavy overhead pressing. This is a late-plan goal — make sure the shoulder is genuinely strong first.",
      search: "wall handstand push up progression",
    },
  },

  // ======================= cross-listed skill end-goals =======================
  {
    id: "ringmuscleup", name: "Ring Muscle-Up", icon: "💍", group: "pull", tier: 5,
    axes: { pull: 1, push: 0.6, grip: 0.5 }, muscles: ["lats", "chest", "triceps", "core"],
    equipment: ["rings"], defaultSets: "5 attempts", defaultReps: "max",
    skill: "muscleup", skillStep: 6,
    prereq: ["muscleup"], unlocks: [], invented: false,
    details: {
      steps: [
        "From a false-grip hang on the rings, pull explosively and high.",
        "Roll the wrists and lean through the transition.",
        "Press out of the deep ring dip to a straight-arm support.",
        "The rings are less forgiving than the bar — the true skill goal.",
      ],
      cues: ["Maintain the false grip", "Keep the rings close through the transition"],
      mistakes: ["Losing the false grip", "Transitioning too low"],
      shoulder: "The most shoulder-intensive move here — build the bar muscle-up solidly first.",
      search: "ring muscle up progression",
    },
  },
  {
    id: "humanflagintro", name: "Human Flag (intro lean)", icon: "🚩", group: "core", tier: 5,
    axes: { core: 1, shoulders: 0.6, pull: 0.4 }, muscles: ["obliques", "lats", "shoulders"],
    equipment: ["pole"], defaultSets: "3", defaultReps: "5s",
    skill: "humanflag", skillStep: 2,
    prereq: ["sideplank", "pullup"], unlocks: [], invented: false,
    details: {
      steps: [
        "Grip a vertical pole with hands stacked vertically.",
        "Top hand pulls, bottom hand pushes — like a press and pull together.",
        "Start by just holding a slight lean off vertical with feet supported.",
        "Build toward lifting the feet and raising the body toward horizontal.",
      ],
      cues: ["Press hard with the bottom arm", "Keep the body tight as a board"],
      mistakes: ["Relying only on the pulling arm", "Rushing toward the full hold"],
      shoulder: "Loads the shoulders in an unusual way. Treat this as a fun long-term experiment, not a priority.",
      search: "human flag progression beginner",
    },
  },
  {
    id: "straddlefrontlever", name: "Straddle Front Lever", icon: "🎯", group: "core", tier: 5,
    axes: { core: 1, pull: 0.8, grip: 0.5 }, muscles: ["lats", "abs", "core"],
    equipment: ["bar", "rings"], defaultSets: "5", defaultReps: "5–10s",
    skill: "frontlever", skillStep: 3,
    prereq: ["tuckfrontlever"], unlocks: [], invented: true,
    details: {
      steps: [
        "From a tuck front lever, extend the legs out into a wide straddle.",
        "The wider the straddle, the easier; narrow it over time.",
        "Keep the body horizontal and arms straight.",
        "A step toward the full front lever.",
      ],
      cues: ["Keep arms dead straight", "Hips level with shoulders"],
      mistakes: ["Bending the arms", "Hips sagging"],
      search: "straddle front lever progression",
    },
  },
];

// Quick lookup
export const BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function exercisesByGroup(group) {
  return EXERCISES.filter((e) => e.group === group).sort((a, b) => a.tier - b.tier);
}
export function tiersForGroup(group) {
  const out = {};
  for (const e of exercisesByGroup(group)) (out[e.tier] ||= []).push(e);
  return out; // { 1: [...], 2: [...], ... }
}
