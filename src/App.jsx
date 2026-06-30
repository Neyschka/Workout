import { useState, useEffect, useRef } from "react";
import { GROUPS, AXES, AXIS_LABEL, EQUIPMENT, BY_ID, exercisesByGroup, TIERS } from "./data/exerciseLibrary";
import { SKILL_QUESTS } from "./data/skillQuests";

function loadSet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set(fallback);
}
function saveSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch (e) {}
}

const PHASES = [
  {
    id: "foundation",
    label: "Phase 1",
    name: "Foundation",
    weeks: "Weeks 1–4",
    color: "#4A90A4",
    accent: "#E8F4F8",
    description: "Build base strength and body awareness. Every skill you want unlocks here.",
  },
  {
    id: "build",
    label: "Phase 2",
    name: "Build",
    weeks: "Weeks 5–8",
    color: "#7B6FA0",
    accent: "#F2EFF8",
    description: "Increase volume and start introducing skill progressions.",
  },
  {
    id: "skills",
    label: "Phase 3",
    name: "Skills",
    weeks: "Weeks 9–12",
    color: "#A06B4A",
    accent: "#F8F0EA",
    description: "Dedicated skill work. Handstand, ring support, L-sit in sight.",
  },
];

const WORKOUTS = {
  foundation: [
    {
      day: "Day A",
      subtitle: "Push + Shoulders + Legs",
      exercises: [
        { name: "Wall Push-Up → Incline Push-Up", sets: "3", reps: "8–12", note: "Start at wall if needed, move to hands on bench", icon: "💪" },
        { name: "Band External Rotation", sets: "3", reps: "15–20", note: "Elbow at side, rotate forearm outward against band. The key rotator cuff rehab move — keep it light and controlled", icon: "🩹" },
        { name: "Dead Hang", sets: "3", reps: "20–30s", note: "Decompresses the shoulder joint and builds grip. Very beneficial for rotator cuff recovery", icon: "🔱" },
        { name: "Bulgarian Split Squat (bodyweight)", sets: "3", reps: "8–10 each", note: "Rear foot on bench, lower back knee toward floor. Single best leg exercise — builds quads, glutes and balance", icon: "🦵" },
        { name: "Plank Hold", sets: "3", reps: "20–30s", note: "Perfect form, breathe steadily", icon: "⬜" },
      ],
    },
    {
      day: "Day B",
      subtitle: "Pull + Posterior + Legs",
      exercises: [
        { name: "Negative Pull-Up", sets: "3", reps: "3–5", note: "Jump to top, lower yourself in 3–5 seconds. Builds pull-up strength fast", icon: "⬆️" },
        { name: "Ring Row (low rings)", sets: "3", reps: "8–12", note: "Body at 45°, pull chest to rings — horizontal pull that hits rear delts safely", icon: "💍" },
        { name: "Band Face Pull", sets: "3", reps: "15–20", note: "Pull band to face, elbows high and wide. Directly targets rear delts and rotator cuff stabilisers — do these every session long term", icon: "🎯" },
        { name: "Glute Bridge", sets: "3", reps: "12–15", note: "Add a dumbbell on hips when easy — hamstrings and glutes", icon: "🍑" },
        { name: "Hollow Body Hold", sets: "3", reps: "15–20s", note: "Lower back pressed into floor, arms overhead — handstand foundation", icon: "🌙" },
      ],
    },
    {
      day: "Day C",
      subtitle: "Full Body + Skills Intro",
      exercises: [
        { name: "Push-Up (standard)", sets: "3", reps: "Max (stop 2 short of failure)", note: "Track your reps each week", icon: "💪" },
        { name: "Ring Support Hold", sets: "3", reps: "10–15s", note: "Arms straight, support yourself on rings — shoulder stability key skill", icon: "💍" },
        { name: "Bulgarian Split Squat (dumbbell)", sets: "3", reps: "8–10 each", note: "Add light dumbbells when bodyweight feels easy", icon: "🦵" },
        { name: "Band External Rotation", sets: "2", reps: "15–20", note: "Repeat from Day A — rotator cuff work belongs in every session this phase", icon: "🩹" },
        { name: "Dead Bug", sets: "3", reps: "8 each side", note: "Core control — crucial for handstand balance", icon: "🐛" },
      ],
    },
  ],
  build: [
    {
      day: "Day A",
      subtitle: "Push + Shoulders + Legs",
      exercises: [
        { name: "Push-Up (feet elevated)", sets: "4", reps: "8–12", note: "Feet on bench for upper chest emphasis", icon: "💪" },
        { name: "Dips (assisted → full)", sets: "4", reps: "6–10", note: "Use less foot assistance each week", icon: "⬇️" },
        { name: "Pike Push-Up", sets: "3", reps: "6–10", note: "Hips high, head toward floor — direct shoulder builder for handstand. Only add this once Phase 1 shoulder work felt comfortable", icon: "🔺" },
        { name: "Bulgarian Split Squat (weighted)", sets: "4", reps: "8–10 each", note: "Increase dumbbell weight progressively — this is your main leg builder", icon: "🦵" },
        { name: "L-Sit Progression", sets: "3", reps: "10s", note: "Tuck L-sit on floor — work up to extending one leg", icon: "✈️" },
      ],
    },
    {
      day: "Day B",
      subtitle: "Pull + Rear Delts + Legs",
      exercises: [
        { name: "Pull-Up (band assisted or full)", sets: "4", reps: "4–8", note: "Use your resistance band looped over the bar — reduce assistance each week", icon: "⬆️" },
        { name: "Ring Row (body horizontal)", sets: "4", reps: "8–10", note: "More horizontal = harder — excellent rear delt and upper back work", icon: "💍" },
        { name: "Band Face Pull", sets: "3", reps: "15–20", note: "Still doing these every session — non-negotiable for shoulder health alongside the heavier pressing you're now doing", icon: "🎯" },
        { name: "Dumbbell Row", sets: "3", reps: "10 each", note: "One arm, lean on bench — mid-back thickness", icon: "🏋️" },
        { name: "Romanian Deadlift (dumbbells)", sets: "3", reps: "10–12", note: "Hinge at hips, slight knee bend, weights track down legs — hamstrings and glutes without loading the spine heavily", icon: "🦿" },
      ],
    },
    {
      day: "Day C",
      subtitle: "Skill Day",
      exercises: [
        { name: "Wall Handstand (chest to wall)", sets: "5", reps: "20–30s", note: "Chest facing wall is harder but better form practice", icon: "🤸" },
        { name: "Handstand Shoulder Taps (wall)", sets: "3", reps: "5 each side", note: "Lift one hand briefly — balance training", icon: "👋" },
        { name: "Ring Support + Dip", sets: "4", reps: "5–8", note: "Full ring dips — major upper body strength + ring skill", icon: "💍" },
        { name: "Dumbbell Lateral Raise", sets: "3", reps: "12–15", note: "Light weight, controlled — builds the medial delt for shoulder width and supports rotator cuff strength", icon: "🩹" },
        { name: "Bulgarian Split Squat (weighted)", sets: "3", reps: "10 each", note: "Third session of legs this week — keep adding load when 10 reps feels manageable", icon: "🦵" },
      ],
    },
  ],
  skills: [
    {
      day: "Day A",
      subtitle: "Handstand + Legs",
      exercises: [
        { name: "Freestanding Handstand Kick-Up", sets: "10 attempts", reps: "Max hold", note: "You're aiming for 5 seconds freestanding by end of phase", icon: "🤸" },
        { name: "Handstand Wall Run", sets: "3", reps: "5", note: "Walk hands toward wall from floor — builds control", icon: "🧱" },
        { name: "Pike Push-Up (deficit)", sets: "4", reps: "8–10", note: "Hands on books/plates, lower head below hands", icon: "🔺" },
        { name: "Bulgarian Split Squat (heavy)", sets: "4", reps: "6–8 each", note: "Heavier dumbbells, lower reps — strength phase for legs", icon: "🦵" },
        { name: "L-Sit (parallel bars / rings)", sets: "4", reps: "10–15s", note: "Full L-sit target — legs parallel to ground", icon: "✈️" },
      ],
    },
    {
      day: "Day B",
      subtitle: "Ring Skills + Posterior",
      exercises: [
        { name: "Muscle-Up Progression", sets: "5", reps: "3–5", note: "Start with banded or jumping muscle-up — the king of ring skills", icon: "👑" },
        { name: "Pull-Up (weighted or archer)", sets: "4", reps: "5–6", note: "Add dumbbell between feet, or archer (one arm extended)", icon: "⬆️" },
        { name: "Ring Dip", sets: "4", reps: "8–10", note: "Full control, pause at bottom", icon: "💍" },
        { name: "Band Face Pull", sets: "3", reps: "15–20", note: "Still here — shoulder prehab never stops, especially now you're doing muscle-ups and heavy pressing", icon: "🎯" },
        { name: "Romanian Deadlift (heavy)", sets: "4", reps: "8–10", note: "Increase weight from Phase 2 — strong posterior chain supports every skill", icon: "🦿" },
      ],
    },
    {
      day: "Day C",
      subtitle: "Unlock Day",
      exercises: [
        { name: "Planche Tuck Hold", sets: "5", reps: "10–15s", note: "Lean onto straight arms, feet off ground in tuck", icon: "✈️" },
        { name: "Handstand Push-Up (wall)", sets: "4", reps: "3–6", note: "Full handstand push-up against wall — combining HS + press strength", icon: "🤸" },
        { name: "Human Flag Intro (side lean)", sets: "3", reps: "5s", note: "Push/pull on vertical pole or tower upright", icon: "🚩" },
        { name: "Ring Muscle-Up", sets: "5 attempts", reps: "Max", note: "This is your Phase 3 unlock goal", icon: "💍" },
        { name: "Dumbbell Lateral Raise + External Rotation", sets: "3", reps: "12 each", note: "Superset: lateral raises then band external rotations. Shoulder strength and health in one go", icon: "🩹" },
      ],
    },
  ],
};

// Equipment you can own/not-own. Floor + wall are excluded — always assumed available.
const ALL_EQUIPMENT_KEYS = Object.keys(EQUIPMENT).filter((k) => k !== "floor" && k !== "wall");

// The old Skill Tree used different ids. Map them so unlocked skills already saved
// on a device migrate transparently to the unified library's ids.
const OLD_TO_NEW_SKILL_ID = {
  wallhs: "wallhandstand",
  freehs: "freehandstandkickup",
  hspushup: "wallhspushup",
  lsittuck: "tuckLsit",
  lsit: "Lsit",
  frontlever: "tuckfrontlever",
};

// The plan (WORKOUTS) predates the unified library and uses slightly different
// display names — this maps each plan exercise's free-text name to its stable
// library id, so the plan can be tagged with group/tier/equipment without
// rewriting WORKOUTS itself.
const PLAN_TO_LIBRARY_ID = {
  "Wall Push-Up → Incline Push-Up": "inclinepushup",
  "Band External Rotation": "bandexternalrotation",
  "Dead Hang": "deadhang",
  "Bulgarian Split Squat (bodyweight)": "bulgarianbw",
  "Plank Hold": "plank",
  "Negative Pull-Up": "negpullup",
  "Ring Row (low rings)": "ringrowupright",
  "Band Face Pull": "facepull",
  "Glute Bridge": "glutebridge",
  "Hollow Body Hold": "hollowbody",
  "Push-Up (standard)": "pushup",
  "Ring Support Hold": "ringsupport",
  "Bulgarian Split Squat (dumbbell)": "bulgarianbw",
  "Dead Bug": "deadbug",
  "Push-Up (feet elevated)": "feetelevatedpushup",
  "Dips (assisted → full)": "dips",
  "Pike Push-Up": "pikepushup",
  "Bulgarian Split Squat (weighted)": "bulgarianweighted",
  "L-Sit Progression": "tuckLsit",
  "Pull-Up (band assisted or full)": "pullup",
  "Ring Row (body horizontal)": "ringrowhorizontal",
  "Dumbbell Row": "dumbbellrow",
  "Romanian Deadlift (dumbbells)": "romaniandeadlift",
  "Wall Handstand (chest to wall)": "wallhandstand",
  "Handstand Shoulder Taps (wall)": "handstandshouldertaps",
  "Ring Support + Dip": "ringdip",
  "Dumbbell Lateral Raise": "lateralraise",
  "Freestanding Handstand Kick-Up": "freehandstandkickup",
  "Handstand Wall Run": "handstandwallrun",
  "Pike Push-Up (deficit)": "deficitpikepushup",
  "Bulgarian Split Squat (heavy)": "bulgarianweighted",
  "L-Sit (parallel bars / rings)": "Lsit",
  "Muscle-Up Progression": "muscleup",
  "Pull-Up (weighted or archer)": "weightedpullup",
  "Ring Dip": "ringdip",
  "Romanian Deadlift (heavy)": "romaniandeadlift",
  "Planche Tuck Hold": "planchetuck",
  "Handstand Push-Up (wall)": "wallhspushup",
  "Human Flag Intro (side lean)": "humanflagintro",
  "Ring Muscle-Up": "ringmuscleup",
  "Dumbbell Lateral Raise + External Rotation": "lateralraise",
};

// Ordered most-specific-first. getDetails() returns the first whose `match` the exercise name contains.
const EXERCISE_DETAILS = [
  {
    match: "External Rotation",
    search: "band external rotation rotator cuff exercise",
    steps: [
      "Anchor a light band at elbow height, or hold it in both hands.",
      "Tuck your working elbow into your side, bent at 90°, forearm across your stomach.",
      "Keeping the elbow pinned to your ribs, rotate your forearm outward.",
      "Pause briefly at the end, then return slowly under control.",
    ],
    cues: ["Keep a rolled towel between elbow and ribs to keep the elbow still", "Move from the shoulder, not the wrist"],
    mistakes: ["Letting the elbow drift away from the body", "Using a band so heavy you shrug or twist your torso"],
    shoulder: "This is the cornerstone of rotator cuff rehab. Stay light and pain-free — you should feel the muscles behind the shoulder working, never a pinch.",
  },
  {
    match: "Lateral Raise",
    search: "dumbbell lateral raise proper form",
    steps: [
      "Stand with a light dumbbell in each hand at your sides.",
      "With a soft bend in the elbows, raise the weights out to the sides.",
      "Stop when your arms reach shoulder height — no higher.",
      "Lower slowly over 2–3 seconds.",
    ],
    cues: ["Lead with the elbows, not the hands", "Imagine pouring a jug of water at the top"],
    mistakes: ["Swinging the weights up with momentum", "Raising above shoulder height, which can aggravate the shoulder"],
    shoulder: "Builds the side delt for shoulder width. Keep it light given your cuff — controlled reps matter far more than weight here.",
  },
  {
    match: "Face Pull",
    search: "band face pull rear delt exercise form",
    steps: [
      "Anchor the band at roughly head height (over the pull-up bar works).",
      "Hold the band with both hands, arms extended toward the anchor.",
      "Pull the band toward your face, splitting your hands apart as you go.",
      "Finish with elbows high and wide, hands beside your ears. Return slowly.",
    ],
    cues: ["Think 'pull the band apart', not just back", "Squeeze the shoulder blades together at the end"],
    mistakes: ["Letting the elbows drop low (turns it into a row)", "Using momentum instead of control"],
    shoulder: "One of the best exercises for shoulder health — it strengthens the rear delt and cuff stabilisers that pressing neglects. This is why it appears in every phase.",
  },
  {
    match: "Dead Hang",
    search: "dead hang pull up bar beginner",
    steps: [
      "Reach up and grip the pull-up bar with both hands, shoulder-width apart.",
      "Let your feet leave the floor so you hang at full stretch.",
      "Keep a slight engagement in the shoulders — don't hang totally limp.",
      "Hold for time, breathing steadily, then lower your feet down.",
    ],
    cues: ["Gently pull the shoulders down away from the ears", "Relax the lower body"],
    mistakes: ["Holding your breath", "Gripping so hard your forearms fail before the time is up"],
    shoulder: "Gentle decompression that's usually very friendly to recovering shoulders. If hanging fully is uncomfortable, keep a toe on the floor to take some weight.",
  },
  {
    match: "Negative Pull-Up",
    search: "negative pull up progression beginner",
    steps: [
      "Use a box or jump to get your chin above the bar.",
      "Hold the top position for a second, chest tall.",
      "Lower yourself as slowly as you can — aim for 3–5 seconds.",
      "Step back up and repeat; don't rep out the lowering fast.",
    ],
    cues: ["Fight gravity the whole way down", "Keep shoulder blades pulling down"],
    mistakes: ["Dropping quickly instead of resisting", "Shrugging at the top"],
  },
  {
    match: "Pull-Up",
    search: "pull up proper form band assisted",
    steps: [
      "Grip the bar slightly wider than shoulders, palms facing away.",
      "Start from a dead hang, then pull your shoulder blades down and back.",
      "Drive your elbows down to bring your chin over the bar.",
      "Lower under control to a full hang. Use a band looped over the bar and under your feet/knee to assist.",
    ],
    cues: ["Lead with the chest, not the chin", "Imagine pulling the bar down to you"],
    mistakes: ["Kipping/swinging for momentum", "Not going all the way to a full hang each rep"],
  },
  {
    match: "Ring Row",
    search: "ring row inverted row beginner form",
    steps: [
      "Set the rings to roughly hip height and grab a handle in each hand.",
      "Walk your feet forward so your body is leaning back, straight as a plank.",
      "Pull your chest toward the rings, driving elbows back.",
      "Lower slowly. The more horizontal your body, the harder it is.",
    ],
    cues: ["Keep hips up — don't let them sag", "Squeeze shoulder blades at the top"],
    mistakes: ["Letting the hips drop", "Shrugging the shoulders up toward the ears"],
    shoulder: "A shoulder-friendly horizontal pull. Start more upright and lower your body angle gradually as you get stronger.",
  },
  {
    match: "Ring Support + Dip",
    search: "ring dip progression support hold",
    steps: [
      "Start in a ring support hold — arms straight, rings pressed to your sides.",
      "Lower under control by bending the elbows, keeping rings close to your body.",
      "Descend only as far as is comfortable, especially early on.",
      "Press back up to the straight-arm support and turn the rings out at the top.",
    ],
    cues: ["Keep the rings tucked close, not flaring out", "Stay hollow through the body"],
    mistakes: ["Going too deep too soon", "Letting the rings drift away from the body"],
    shoulder: "Ring dips load the shoulder heavily. Build the support hold solidly first, and only add depth when it's completely pain-free.",
  },
  {
    match: "Ring Dip",
    search: "ring dip proper form",
    steps: [
      "Begin in a straight-arm ring support, rings beside your hips.",
      "Bend the elbows to lower, keeping the rings close to your torso.",
      "Lower to about 90° at the elbow (or less early on).",
      "Press back up and turn the rings slightly outward at the top.",
    ],
    cues: ["Control the wobble — slow tempo", "Keep elbows pointing back, not flaring wide"],
    mistakes: ["Bouncing out of the bottom", "Allowing the rings to swing"],
    shoulder: "Heavy on the shoulders — keep depth conservative and stop if you feel any pinching at the front of the shoulder.",
  },
  {
    match: "Ring Support",
    search: "ring support hold beginner",
    steps: [
      "Hold a ring in each hand and press down to lift yourself off the floor.",
      "Lock the arms straight, rings pressed against the sides of your hips.",
      "Turn the rings slightly outward and squeeze everything tight.",
      "Hold for time, staying hollow and stable.",
    ],
    cues: ["Push the rings down and into your sides", "Keep shoulders down, away from the ears"],
    mistakes: ["Bent arms", "Letting the rings drift wide and wobble"],
    shoulder: "Excellent for rebuilding shoulder stability. If full support is too much, keep a foot lightly on the floor and build up.",
  },
  {
    match: "Dips",
    search: "parallel bar dips assisted beginner",
    steps: [
      "Grip the dip handles and support yourself with straight arms.",
      "Keep feet on the floor early on to assist as much as needed.",
      "Bend the elbows to lower your chest toward the handles.",
      "Press back up. Use less foot assistance over the weeks.",
    ],
    cues: ["Lean the torso slightly forward", "Keep elbows from flaring out wide"],
    mistakes: ["Dropping too deep before you're ready", "Shrugging the shoulders up"],
    shoulder: "Go shallow at first. Front-of-shoulder discomfort means you've gone too deep — shorten the range.",
  },
  {
    match: "Pike Push-Up",
    search: "pike push up handstand progression",
    steps: [
      "Start in a downward-dog shape: hips high, hands and feet on the floor.",
      "Bend the elbows to lower the top of your head toward the floor.",
      "Keep the path vertical, like a standing overhead press upside down.",
      "Press back up to straight arms.",
    ],
    cues: ["Stack hips over shoulders for more load", "Elbows track slightly forward, not flared"],
    mistakes: ["Turning it into a normal push-up by dropping the hips", "Flaring elbows wide"],
    shoulder: "This loads the shoulder overhead, so only introduce it once your Phase 1 cuff work feels solid and pain-free.",
  },
  {
    match: "Push-Up",
    search: "push up proper form incline beginner",
    steps: [
      "Hands slightly wider than shoulders. Elevate hands on a bench to make it easier.",
      "Brace your core so your body is one straight line.",
      "Lower your chest toward the surface, elbows at roughly 45°.",
      "Press back up to straight arms.",
    ],
    cues: ["Squeeze glutes and brace the core", "Elbows back at ~45°, not flared to 90°"],
    mistakes: ["Sagging hips", "Flaring elbows straight out to the sides"],
  },
  {
    match: "Plank",
    search: "plank hold proper form",
    steps: [
      "Set up on your forearms and toes, elbows under shoulders.",
      "Form a straight line from head to heels.",
      "Brace your core and squeeze your glutes.",
      "Hold for time, breathing steadily.",
    ],
    cues: ["Tuck the ribs down and tilt the pelvis slightly under", "Don't let the hips rise or sag"],
    mistakes: ["Hips creeping up into a peak", "Letting the lower back sag"],
  },
  {
    match: "Hollow Body",
    search: "hollow body hold gymnastics core",
    steps: [
      "Lie on your back, arms overhead, legs straight.",
      "Press your lower back firmly into the floor.",
      "Lift your shoulders and legs a few inches off the ground.",
      "Hold the dish shape. Bend the knees or lower the arms to make it easier.",
    ],
    cues: ["Lower back stays glued to the floor the whole time", "Keep it tight, not floppy"],
    mistakes: ["Lower back arching off the floor", "Lifting too high so it becomes easy"],
  },
  {
    match: "Dead Bug",
    search: "dead bug core exercise form",
    steps: [
      "Lie on your back, arms pointing at the ceiling, knees bent at 90°.",
      "Press your lower back into the floor.",
      "Slowly extend one arm overhead and the opposite leg out straight.",
      "Return and repeat on the other side.",
    ],
    cues: ["Move slowly and keep the lower back pinned", "Exhale as you extend"],
    mistakes: ["Letting the back arch as the limbs extend", "Rushing the reps"],
  },
  {
    match: "Glute Bridge",
    search: "glute bridge exercise form",
    steps: [
      "Lie on your back, knees bent, feet flat and hip-width apart.",
      "Drive through your heels to lift your hips.",
      "Squeeze the glutes hard at the top, body in a straight line.",
      "Lower slowly. Rest a dumbbell across the hips to add load.",
    ],
    cues: ["Push through the heels", "Squeeze the glutes, don't arch the lower back"],
    mistakes: ["Overarching the lower back at the top", "Pushing through the toes"],
  },
  {
    match: "Bulgarian Split Squat",
    search: "bulgarian split squat proper form",
    steps: [
      "Stand a stride in front of a bench. Place the top of one foot behind you on it.",
      "Keep most of your weight on the front foot.",
      "Lower straight down until the front thigh is roughly parallel.",
      "Drive up through the front heel. Hold dumbbells to add load.",
    ],
    cues: ["Keep the front shin fairly vertical", "Stay tall through the torso"],
    mistakes: ["Front knee caving inward", "Leaning too far forward and loading the back leg"],
  },
  {
    match: "Romanian Deadlift",
    search: "dumbbell romanian deadlift form",
    steps: [
      "Hold a dumbbell in each hand in front of your thighs.",
      "With a slight knee bend, push your hips back and hinge forward.",
      "Let the weights track down close to your legs until you feel a hamstring stretch.",
      "Drive your hips forward to stand back up.",
    ],
    cues: ["Hinge at the hips, don't squat", "Keep the back flat and weights close to the legs"],
    mistakes: ["Rounding the lower back", "Turning it into a squat by bending the knees too much"],
  },
  {
    match: "Dumbbell Row",
    search: "one arm dumbbell row form",
    steps: [
      "Place one hand and knee on a bench, other foot on the floor.",
      "Let the dumbbell hang at arm's length below you.",
      "Pull the dumbbell up toward your hip, driving the elbow back.",
      "Squeeze the back, then lower slowly.",
    ],
    cues: ["Pull to the hip, not the shoulder", "Keep the back flat and still"],
    mistakes: ["Rotating the torso to heave the weight", "Shrugging the shoulder"],
  },
  {
    match: "L-Sit",
    search: "L-sit progression tuck beginner",
    steps: [
      "Support yourself on parallettes, the floor, or dip handles, arms straight.",
      "Lift your knees up into a tuck (easiest version).",
      "Hold, keeping shoulders pushed down and chest tall.",
      "Progress by extending one leg, then both, to parallel with the floor.",
    ],
    cues: ["Push the floor away to depress the shoulders", "Round the lower back slightly into a hollow"],
    mistakes: ["Letting the shoulders shrug up", "Leaning too far back"],
  },
  {
    match: "Wall Handstand",
    search: "wall handstand hold beginner chest to wall",
    steps: [
      "Face the wall, hands on the floor a hand-span from it.",
      "Walk your feet up the wall as you walk your hands closer in.",
      "Aim for a tall, straight body with chest toward the wall.",
      "Hold for time, then walk back down under control.",
    ],
    cues: ["Push the floor away through straight arms", "Squeeze glutes and point the toes"],
    mistakes: ["Arching the lower back into a banana shape", "Bending the arms"],
    shoulder: "This puts a lot of weight overhead. Introduce it gradually and skip it on any day your shoulder feels off.",
  },
  {
    match: "Handstand Shoulder Taps",
    search: "handstand shoulder taps wall",
    steps: [
      "Get into a wall handstand, stable and tall.",
      "Shift your weight slightly onto one hand.",
      "Briefly lift the other hand to tap the opposite shoulder.",
      "Replace it and repeat on the other side.",
    ],
    cues: ["Tiny weight shift, not a big lean", "Stay tight through the core"],
    mistakes: ["Collapsing to one side", "Rushing the taps"],
  },
  {
    match: "Handstand Wall Run",
    search: "handstand wall walk drill",
    steps: [
      "Start in a push-up position with feet against the base of a wall.",
      "Walk your feet up the wall while walking your hands toward it.",
      "Go as far as your control allows, building toward vertical.",
      "Walk back down with control.",
    ],
    cues: ["Move slowly and stay braced", "Keep arms straight and strong"],
    mistakes: ["Letting the lower back sag", "Rushing up and losing control"],
    shoulder: "Loads the shoulders overhead — ease into how far up you walk.",
  },
  {
    match: "Freestanding Handstand",
    search: "freestanding handstand kick up balance",
    steps: [
      "From a lunge, place hands shoulder-width on the floor.",
      "Kick your back leg up and follow with the other to find balance.",
      "Use small finger and wrist pressure to balance (press fingers to stop falling over).",
      "Bail safely by cartwheeling out if you overbalance.",
    ],
    cues: ["Look at the floor between your hands", "Balance with the fingertips, not the whole arm"],
    mistakes: ["Kicking up too hard and flipping over", "Holding your breath"],
    shoulder: "The most demanding overhead position in the plan. Only progress here once wall handstands feel strong and pain-free.",
  },
  {
    match: "Handstand Push-Up",
    search: "wall handstand push up progression",
    steps: [
      "Kick up into a wall handstand, hands a little wider than shoulders.",
      "Bend the elbows to lower the top of your head toward the floor.",
      "Lightly touch the floor, then press back up to straight arms.",
      "Reduce range (use a cushion stack) if full depth is too much.",
    ],
    cues: ["Keep the body tight and vertical", "Press evenly through both hands"],
    mistakes: ["Arching to cheat the press", "Flaring the elbows wide"],
    shoulder: "Very heavy overhead pressing. This is a late-plan goal — make sure the shoulder is genuinely strong first.",
  },
  {
    match: "Muscle-Up",
    search: "muscle up progression beginner false grip",
    steps: [
      "Start with a strong false-grip hang (wrists over the rings/bar).",
      "Pull explosively, bringing your chest high toward the rings.",
      "As you reach the top, roll the wrists and lean forward through the transition.",
      "Press out of the dip to lockout. Use a band or jump to assist early on.",
    ],
    cues: ["Pull high before transitioning", "Keep the rings/bar close to the body"],
    mistakes: ["Trying to transition too low", "Chicken-winging one arm through"],
    shoulder: "Demanding on the shoulder through the transition. A genuine goal exercise — build pull-ups and dips solidly first.",
  },
  {
    match: "Planche Tuck",
    search: "tuck planche lean progression",
    steps: [
      "Start in a push-up or support position on the floor or parallettes.",
      "Lean your shoulders forward past your hands.",
      "Tuck the knees and shift weight until your feet lift off.",
      "Hold the lean, then lower. Even a partial lean builds strength.",
    ],
    cues: ["Protract — push the floor away and round the upper back", "Lean further forward to increase difficulty"],
    mistakes: ["Not leaning far enough forward", "Letting the shoulders shrug up"],
    shoulder: "Big demand on the front of the shoulder. Progress in small increments of lean.",
  },
  {
    match: "Human Flag",
    search: "human flag progression beginner",
    steps: [
      "Grip a vertical pole (or the tower upright) with hands stacked vertically.",
      "Top hand pulls, bottom hand pushes — like a press and pull together.",
      "Start by just holding a slight lean off vertical with feet supported.",
      "Build toward lifting the feet and raising the body toward horizontal.",
    ],
    cues: ["Press hard with the bottom arm", "Keep the body tight as a board"],
    mistakes: ["Relying only on the pulling arm", "Rushing toward the full hold"],
    shoulder: "Loads the shoulders in an unusual way. Treat this as a fun long-term experiment, not a priority.",
  },
];

function getDetails(name) {
  // Pick the most specific (longest) matching key, so e.g. "Handstand Push-Up"
  // doesn't get matched to the generic "Push-Up" entry.
  return EXERCISE_DETAILS
    .filter((d) => name.includes(d.match))
    .sort((a, b) => b.match.length - a.match.length)[0] || null;
}

function ytSearch(name, details) {
  const q = details?.search || `${name} exercise how to`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

// --- Skill Tree helpers ---
function axisPoint(i, n, radius, cx, cy, frac = 1) {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  return { x: cx + radius * frac * Math.cos(angle), y: cy + radius * frac * Math.sin(angle) };
}

// Highest tier of `group` the user has actually marked themselves able to do —
// not just scheduled. Avoids "I added one hard exercise to my plan" inflating the tier.
function masteredTierForGroup(group, masteredIds) {
  let max = 0;
  exercisesByGroup(group).forEach((e) => {
    if (masteredIds.has(e.id) && e.tier > max) max = e.tier;
  });
  return max;
}

// Weighted 0..1 exposure to a radar axis (push/pull/legs/core/shoulders/grip),
// based on what the user has marked themselves able to do.
function axisValue(axis, masteredIds) {
  let max = 0;
  Object.values(BY_ID).forEach((e) => {
    if (masteredIds.has(e.id) && e.axes && e.axes[axis]) {
      max = Math.max(max, e.axes[axis] * (e.tier / 5));
    }
  });
  return max;
}

// Slot counts per muscle group across this phase's Day A–C — the plan's own balance.
function weeklyGroupCounts(phaseId) {
  const counts = { push: 0, pull: 0, legs: 0, core: 0, shoulders: 0, grip: 0 };
  WORKOUTS[phaseId].forEach((day) => {
    day.exercises.forEach((ex) => {
      const lib = BY_ID[PLAN_TO_LIBRARY_ID[ex.name]];
      if (lib && counts[lib.group] !== undefined) counts[lib.group] += 1;
    });
  });
  return counts;
}

// Exercise ids for everything in a completed day — used to seed/grow "mastered" status.
function exerciseIdsForDay(phaseId, dayIndex) {
  const day = WORKOUTS[phaseId] && WORKOUTS[phaseId][dayIndex];
  if (!day) return [];
  return day.exercises.map((ex) => PLAN_TO_LIBRARY_ID[ex.name]).filter(Boolean);
}

export default function App() {
  const [activePhase, setActivePhase] = useState("foundation");
  const [activeDay, setActiveDay] = useState(0);
  const [tab, setTab] = useState("plan");
  const [unlockedSkills, setUnlockedSkills] = useState(() => loadSet("cal_skills", ["deadhang", "wallhandstand"]));
  const [completedDays, setCompletedDays] = useState(() => loadSet("cal_days", []));
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [phasePickerOpen, setPhasePickerOpen] = useState(false);
  const [ownedEquipment, setOwnedEquipment] = useState(() => loadSet("cal_equipment", ALL_EQUIPMENT_KEYS));
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [expandedTrackGroup, setExpandedTrackGroup] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionExIndex, setSessionExIndex] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(120);
  const [exerciseTimes, setExerciseTimes] = useState([]);
  const timerRef = useRef(null);
  const cooldownRef = useRef(null);

  useEffect(() => { saveSet("cal_skills", unlockedSkills); }, [unlockedSkills]);
  useEffect(() => { saveSet("cal_days", completedDays); }, [completedDays]);
  useEffect(() => { saveSet("cal_equipment", ownedEquipment); }, [ownedEquipment]);

  // One-time migration: the Skill Tree used different exercise ids before the
  // unified library rebuild. Remap anything already unlocked on this device.
  useEffect(() => {
    setUnlockedSkills((prev) => {
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        const mapped = OLD_TO_NEW_SKILL_ID[id] || id;
        if (mapped !== id) changed = true;
        next.add(mapped);
      });
      return changed ? next : prev;
    });
  }, []);

  // One-time backfill: a day you'd already marked complete is real evidence you can
  // do those exercises, even though the mastery system didn't exist yet.
  useEffect(() => {
    setUnlockedSkills((prev) => {
      const next = new Set(prev);
      completedDays.forEach((key) => {
        const sep = key.lastIndexOf("-");
        const pid = key.slice(0, sep);
        const dayIdx = parseInt(key.slice(sep + 1), 10);
        exerciseIdsForDay(pid, dayIdx).forEach((id) => next.add(id));
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    if (inCooldown) {
      cooldownRef.current = setInterval(() => {
        setCooldownSeconds((s) => {
          if (s <= 1) {
            clearInterval(cooldownRef.current);
            setInCooldown(false);
            setCooldownSeconds(120);
            setTimerSeconds(0);
            setTimerRunning(true);
            return 120;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(cooldownRef.current);
    }
    return () => clearInterval(cooldownRef.current);
  }, [inCooldown]);

  const startSession = () => {
    setSessionExIndex(0);
    setSessionFinished(false);
    setTimerSeconds(0);
    setTimerRunning(true);
    setInCooldown(false);
    setCooldownSeconds(120);
    setExerciseTimes([]);
    setSessionActive(true);
  };

  const closeSession = () => {
    setSessionActive(false);
    setTimerRunning(false);
    setInCooldown(false);
    setTimerSeconds(0);
    setCooldownSeconds(120);
  };

  const goNextExercise = (exercises) => {
    const recorded = timerSeconds;
    setExerciseTimes((prev) => [...prev, recorded]);
    setTimerRunning(false);
    setTimerSeconds(0);
    if (sessionExIndex === exercises.length - 1) {
      setSessionFinished(true);
    } else {
      setInCooldown(true);
      setCooldownSeconds(120);
      setSessionExIndex((i) => i + 1);
    }
  };

  const skipCooldown = () => {
    clearInterval(cooldownRef.current);
    setInCooldown(false);
    setCooldownSeconds(120);
    setTimerSeconds(0);
    setTimerRunning(true);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const resetProgress = () => {
    if (window.confirm("Reset all completed sessions and unlocked skills? This cannot be undone.")) {
      setCompletedDays(new Set());
      setUnlockedSkills(new Set(["deadhang", "wallhandstand"]));
    }
  };

  const phase = PHASES.find((p) => p.id === activePhase);
  const workouts = WORKOUTS[activePhase];
  const workout = workouts[activeDay];

  const toggleSkill = (id) => {
    setUnlockedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dayKey = `${activePhase}-${activeDay}`;
  const toggleDay = () => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
        // Completing a day is real evidence — grow "mastered" with its exercises.
        setUnlockedSkills((sk) => {
          const grown = new Set(sk);
          exerciseIdsForDay(activePhase, activeDay).forEach((id) => grown.add(id));
          return grown;
        });
      }
      return next;
    });
  };

  const toggleEquipment = (key) => {
    setOwnedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const missingEquipment = (lib) => {
    if (!lib) return [];
    const req = (lib.equipment || []).filter((e) => e !== "floor" && e !== "wall");
    return req.filter((e) => !ownedEquipment.has(e));
  };

  const weeklyCounts = weeklyGroupCounts(activePhase);
  const maxWeeklyCount = Math.max(1, ...Object.values(weeklyCounts));

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#0F1117", color: "#E8E8E8" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A1D2E 0%, #0F1117 100%)", borderBottom: "1px solid #2A2D3E", padding: "calc(env(safe-area-inset-top, 0px) + 20px) calc(env(safe-area-inset-right, 0px) + 20px) 0 calc(env(safe-area-inset-left, 0px) + 20px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: -1, paddingLeft: 4 }}>
              Lever<span style={{ color: phase.color }}>.</span>
            </h1>
            <button
              onClick={() => setEquipmentOpen(true)}
              aria-label="Equipment settings"
              style={{ background: "none", border: "1px solid #2A2D3E", borderRadius: 8, width: 34, height: 34, color: "#8a8fb0", fontSize: 16, cursor: "pointer", flexShrink: 0 }}
            >⚙️</button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {[
              { id: "plan", label: "Workout Plan" },
              { id: "skills", label: "Skill Tree" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: tab === t.id ? "#E8E8E8" : "#666",
                  borderBottom: tab === t.id ? `2px solid ${phase.color}` : "2px solid transparent",
                  transition: "all 0.2s",
                  letterSpacing: 0.3,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
        {tab === "plan" && (
          <>
            {/* Phase context bar — collapses the program block into one quiet "where am I" control */}
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setPhasePickerOpen((o) => !o)}
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#1A1D2E",
                  border: `1px solid ${phasePickerOpen ? phase.color : "#2A2D3E"}`,
                  borderRadius: 10,
                  borderBottomLeftRadius: phasePickerOpen ? 0 : 10,
                  borderBottomRightRadius: phasePickerOpen ? 0 : 10,
                  padding: "11px 14px", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 8, height: 34, borderRadius: 4, background: phase.color }} />
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: "#7e84a0", fontWeight: 700 }}>
                      Phase {PHASES.findIndex((p) => p.id === activePhase) + 1} of {PHASES.length} · {phase.weeks}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#E8E8E8", marginTop: 1 }}>{phase.name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8a8fb0", fontSize: 12, fontWeight: 600 }}>
                  Change <span style={{ fontSize: 13, display: "inline-block", transform: phasePickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </div>
              </button>

              {phasePickerOpen && (
                <div style={{ border: `1px solid ${phase.color}`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  {PHASES.map((p, pi) => {
                    const on = p.id === activePhase;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setActivePhase(p.id); setActiveDay(0); setPhasePickerOpen(false); }}
                        style={{
                          width: "100%", textAlign: "left", cursor: "pointer",
                          background: on ? `${p.color}18` : "#161925",
                          border: "none",
                          borderTop: pi === 0 ? "none" : "1px solid #2A2D3E",
                          borderLeft: `3px solid ${on ? p.color : "transparent"}`,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: on ? "#fff" : "#bbb" }}>
                            <span style={{ color: p.color }}>Phase {pi + 1}</span> · {p.name}
                          </div>
                          <span style={{ fontSize: 11, color: "#667", flexShrink: 0 }}>{p.weeks}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#778", lineHeight: 1.45, marginTop: 4 }}>{p.description}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Day selector — a single segmented control: the one clear choice on this screen */}
            <div style={{ background: "#12151F", border: "1px solid #2A2D3E", borderRadius: 11, padding: 4, display: "flex", gap: 4, marginBottom: 10 }}>
              {workouts.map((w, i) => {
                const on = activeDay === i;
                const done = completedDays.has(`${activePhase}-${i}`);
                return (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{
                      flex: 1, textAlign: "center", cursor: "pointer",
                      background: on ? phase.color : "transparent",
                      border: "none", borderRadius: 8, padding: "9px 0",
                      fontSize: 14, fontWeight: on ? 700 : 600,
                      color: on ? "#fff" : "#888",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      transition: "background 0.15s",
                    }}
                  >
                    {w.day}
                    {done && <span style={{ fontSize: 11, color: on ? "rgba(255,255,255,0.85)" : "#5EC47A" }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Active session caption */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "0 4px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#cfcfe0" }}>{workout.subtitle}</span>
              {completedDays.has(dayKey) && <span style={{ fontSize: 11, color: "#5EC47A" }}>✓ completed</span>}
            </div>

            {/* Start Session */}
            <button
              onClick={startSession}
              style={{
                marginBottom: 16,
                width: "100%",
                background: "#1A3A28",
                border: "1px solid #5EC47A",
                borderRadius: 10,
                padding: "15px",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                color: "#5EC47A",
                letterSpacing: 0.5,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1E4A30"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#1A3A28"; }}
            >
              ▶ Start Session
            </button>

            {/* Exercises */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {workout.exercises.map((ex, i) => {
                const lib = BY_ID[PLAN_TO_LIBRARY_ID[ex.name]];
                const missing = missingEquipment(lib);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedExercise(ex)}
                    style={{
                      background: "#1A1D2E",
                      border: "1px solid #2A2D3E",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%",
                      transition: "border-color 0.15s",
                      opacity: missing.length ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = phase.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2D3E")}
                  >
                    <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{ex.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: phase.color }}>{ex.name}</div>
                        <span style={{ fontSize: 11, color: phase.color, flexShrink: 0, fontWeight: 600 }}>Details ›</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ background: `${phase.color}22`, color: phase.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                          {ex.sets} sets
                        </span>
                        <span style={{ background: "#252840", color: "#AAB", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>
                          {ex.reps}
                        </span>
                        {missing.length > 0 && (
                          <span style={{ background: "#3A2A1A", color: "#E0A23A", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                            Need: {missing.map((m) => EQUIPMENT[m]).join(", ")}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#778", lineHeight: 1.5 }}>{ex.note}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Weekly muscle balance */}
            <div style={{ background: "#1A1D2E", border: "1px solid #2A2D3E", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#7e84a0", marginBottom: 10 }}>
                This week's muscle balance
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.values(GROUPS).map((g) => {
                  const count = weeklyCounts[g.id] || 0;
                  const widthPct = Math.max(10, (count / maxWeeklyCount) * 100);
                  return (
                    <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{g.icon}</span>
                      <span style={{ fontSize: 12, color: "#AAB", fontWeight: 600, width: 72, flexShrink: 0 }}>{g.name}</span>
                      <div style={{ flex: 1, height: 7, background: "#0F1117", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${widthPct}%`, height: "100%", background: g.color, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#667", fontWeight: 700, width: 18, textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: "#556", marginTop: 10, lineHeight: 1.4 }}>
                Slot counts across Day A–C this phase — the plan's own balance, per muscle group.
              </div>
            </div>

            {/* Rest Note */}
            <div style={{ marginTop: 16, padding: "12px 14px", background: "#1A1D2E", borderRadius: 8, fontSize: 12, color: "#667", lineHeight: 1.6 }}>
              <strong style={{ color: "#888" }}>Rest:</strong> Take at least one day off between sessions. A–B–rest–C or Mon/Wed/Fri works well. Prioritise sleep and protein (aim for ~1.6–2g per kg of bodyweight).
            </div>

          </>
        )}

        {tab === "skills" && (() => {
          const radarValues = AXES.map((a) => axisValue(a, unlockedSkills));
          const n = AXES.length;
          const cx = 130, cy = 118, R = 84;
          const ringPts = (frac) => AXES.map((_, i) => { const p = axisPoint(i, n, R, cx, cy, frac); return `${p.x},${p.y}`; }).join(" ");
          const dataPts = AXES.map((_, i) => { const p = axisPoint(i, n, R, cx, cy, Math.max(0.06, radarValues[i])); return `${p.x},${p.y}`; }).join(" ");

          return (
            <>
              <p style={{ fontSize: 13, color: "#778", marginBottom: 18, lineHeight: 1.6 }}>
                Your current level across every muscle group — based on what you've actually marked yourself able to do, not just what's scheduled — and the calisthenics skills you're building toward. Tap a track to see every exercise at each tier.
              </p>

              {/* Radar */}
              <div style={{ background: "#161925", border: "1px solid #2A2D3E", borderRadius: 14, padding: "16px 10px 10px", marginBottom: 22, display: "flex", justifyContent: "center" }}>
                <svg width="260" height="244" viewBox="0 0 260 244">
                  {[0.25, 0.5, 0.75, 1].map((f, idx) => (
                    <polygon key={idx} points={ringPts(f)} fill="none" stroke="#2A2D3E" strokeWidth="1" />
                  ))}
                  {AXES.map((_, i) => {
                    const p = axisPoint(i, n, R, cx, cy, 1);
                    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A2D3E" strokeWidth="1" />;
                  })}
                  <polygon points={dataPts} fill={`${phase.color}33`} stroke={phase.color} strokeWidth="2" />
                  {AXES.map((a, i) => {
                    const p = axisPoint(i, n, R, cx, cy, 1.24);
                    const anchor = p.x < cx - 6 ? "end" : p.x > cx + 6 ? "start" : "middle";
                    return (
                      <text key={a} x={p.x} y={p.y} fontSize="11" fontWeight="700" fill="#8a8fb0" textAnchor={anchor} dominantBaseline="middle">
                        {AXIS_LABEL[a]}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Muscle-group tracks */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
                {Object.values(GROUPS).map((g) => {
                  const curTier = masteredTierForGroup(g.id, unlockedSkills);
                  const isOpen = expandedTrackGroup === g.id;
                  return (
                    <div key={g.id} style={{ background: "#161925", border: "1px solid #2A2D3E", borderRadius: 12, overflow: "hidden" }}>
                      <button
                        onClick={() => setExpandedTrackGroup(isOpen ? null : g.id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        <span style={{ fontSize: 18 }}>{g.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: g.color }}>{g.name}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#667", fontWeight: 600 }}>Tier {curTier || "–"} / 5</span>
                        <span style={{ fontSize: 11, color: "#556", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
                      </button>
                      <div style={{ padding: "0 16px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[1, 2, 3, 4, 5].map((t) => (
                            <div key={t} style={{
                              flex: 1, height: 8, borderRadius: 4,
                              background: t <= curTier ? g.color : "transparent",
                              border: t > curTier ? "1px solid #2A2D3E" : "none",
                            }} />
                          ))}
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ borderTop: "1px solid #2A2D3E", padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                          {[1, 2, 3, 4, 5].map((t) => {
                            const exs = exercisesByGroup(g.id).filter((e) => e.tier === t);
                            if (exs.length === 0) return null;
                            return (
                              <div key={t}>
                                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: t <= curTier ? g.color : "#556", marginBottom: 6 }}>
                                  Tier {t} · {TIERS[t]}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {exs.map((e) => {
                                    const mastered = unlockedSkills.has(e.id);
                                    const missing = missingEquipment(e);
                                    return (
                                      <button
                                        key={e.id}
                                        onClick={() => toggleSkill(e.id)}
                                        style={{
                                          display: "flex", alignItems: "center", gap: 10,
                                          background: mastered ? `${g.color}18` : "#0F1117",
                                          border: `1px solid ${mastered ? g.color : "#2A2D3E"}`,
                                          borderRadius: 8, padding: "8px 10px", cursor: "pointer",
                                          opacity: missing.length ? 0.6 : 1, width: "100%",
                                        }}
                                      >
                                        <span style={{ fontSize: 15 }}>{e.icon}</span>
                                        <span style={{ fontSize: 12.5, fontWeight: 600, color: mastered ? "#E8E8E8" : "#999", flex: 1, textAlign: "left" }}>{e.name}</span>
                                        {missing.length > 0 && <span style={{ fontSize: 9.5, color: "#A0683A", flexShrink: 0 }}>need {missing.map((m) => EQUIPMENT[m]).join(", ")}</span>}
                                        {mastered && <span style={{ fontSize: 11, color: g.color, flexShrink: 0 }}>✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Skill quests */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#7e84a0", marginBottom: 4 }}>Skill Quests</div>
              <p style={{ fontSize: 12.5, color: "#778", margin: "0 0 14px", lineHeight: 1.5 }}>Tap a step once you can do it. These cut across muscle groups — the fun, linear goals.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SKILL_QUESTS.map((q) => {
                  const doneCount = q.steps.filter((id) => unlockedSkills.has(id)).length;
                  return (
                    <div key={q.id} style={{ background: "#161925", border: "1px solid #2A2D3E", borderRadius: 12, padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
                        <span style={{ fontSize: 17 }}>{q.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{q.name}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: q.color, fontWeight: 700 }}>{doneCount}/{q.steps.length}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#778", marginBottom: 11, lineHeight: 1.4 }}>{q.goal}</div>
                      <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 2 }}>
                        {q.steps.map((id, i) => {
                          const e = BY_ID[id];
                          if (!e) return null;
                          const unlocked = unlockedSkills.has(id);
                          return (
                            <div key={id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                              <button
                                onClick={() => toggleSkill(id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 6,
                                  background: unlocked ? `${q.color}22` : "#0F1117",
                                  border: `1px solid ${unlocked ? q.color : "#2A2D3E"}`,
                                  borderRadius: 18, padding: "6px 11px 6px 8px",
                                  cursor: "pointer", whiteSpace: "nowrap",
                                }}
                              >
                                <span style={{ fontSize: 14 }}>{e.icon}</span>
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: unlocked ? "#E8E8E8" : "#888" }}>{e.name}</span>
                                {unlocked && <span style={{ fontSize: 10, color: q.color }}>✓</span>}
                              </button>
                              {i < q.steps.length - 1 && <span style={{ color: "#3f4456", fontSize: 14, margin: "0 4px", flexShrink: 0 }}>→</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>

      {/* Equipment Modal */}
      {equipmentOpen && (
        <div
          onClick={() => setEquipmentOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 150,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#161925", border: "1px solid #2A2D3E", borderRadius: 16,
              width: "100%", maxWidth: 420, maxHeight: "85vh", margin: "auto",
              padding: "22px 20px", overflowY: "auto",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 800 }}>Your equipment</span>
              <button
                onClick={() => setEquipmentOpen(false)}
                style={{ background: "#252840", border: "none", borderRadius: 8, width: 30, height: 30, color: "#AAB", fontSize: 17, cursor: "pointer" }}
              >×</button>
            </div>
            <p style={{ fontSize: 12.5, color: "#778", margin: "0 0 16px", lineHeight: 1.5 }}>
              Exercises that need gear you don't have are greyed out across the Workout Plan and Skill Tree. Floor space and a wall are always assumed.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ALL_EQUIPMENT_KEYS.map((key) => {
                const owned = ownedEquipment.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleEquipment(key)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: owned ? "#1A3A2818" : "#1A1D2E",
                      border: `1px solid ${owned ? "#5EC47A" : "#2A2D3E"}`,
                      borderRadius: 10, padding: "11px 14px", cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: owned ? "#E8E8E8" : "#888" }}>{EQUIPMENT[key]}</span>
                    <span style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${owned ? "#5EC47A" : "#444"}`,
                      background: owned ? "#5EC47A" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#0F1117", fontWeight: 900,
                    }}>{owned ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {sessionActive && (() => {
        const exercises = workout.exercises;
        const ex = exercises[sessionExIndex];
        const isLast = sessionExIndex === exercises.length - 1;
        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "#0F1117",
            display: "flex", flexDirection: "column",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}>
            {/* Session header */}
            <div style={{
              background: "#161925",
              borderBottom: "1px solid #2A2D3E",
              padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: phase.color, fontWeight: 600 }}>
                  {workout.day} — {workout.subtitle}
                </div>
                <div style={{ fontSize: 13, color: "#667", marginTop: 2 }}>
                  {sessionFinished ? "Session complete" : `Exercise ${sessionExIndex + 1} of ${exercises.length}`}
                </div>
              </div>
              <button
                onClick={closeSession}
                style={{ background: "none", border: "none", color: "#667", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
              >×</button>
            </div>

            {sessionFinished ? (
              /* Success screen */
              <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#5EC47A", marginBottom: 8 }}>Session Complete!</div>
                <div style={{ fontSize: 14, color: "#AAB", lineHeight: 1.7, marginBottom: 28, textAlign: "center" }}>
                  Great work. You finished all {exercises.length} exercises for {workout.day}.
                </div>

                {/* Per-exercise times */}
                <div style={{ width: "100%", maxWidth: 400, marginBottom: 12 }}>
                  {exercises.map((ex, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px",
                      background: i % 2 === 0 ? "#161925" : "#1A1D2E",
                      borderRadius: i === 0 ? "8px 8px 0 0" : i === exercises.length - 1 ? "0 0 8px 8px" : 0,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{ex.icon}</span>
                        <span style={{ fontSize: 13, color: "#CCD" }}>{ex.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: phase.color, fontVariantNumeric: "tabular-nums" }}>
                        {exerciseTimes[i] !== undefined ? formatTime(exerciseTimes[i]) : "—"}
                      </span>
                    </div>
                  ))}
                  {/* Total */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", marginTop: 4,
                    background: "#252840", borderRadius: 8,
                    borderTop: `2px solid ${phase.color}`,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#AAB" }}>Total time</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#E8E8E8", fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(exerciseTimes.reduce((a, b) => a + b, 0))}
                    </span>
                  </div>
                </div>

                <button
                  onClick={closeSession}
                  style={{
                    marginTop: 16,
                    background: "#1A3A28", border: "1px solid #5EC47A", borderRadius: 10,
                    padding: "14px 40px", fontSize: 15, fontWeight: 700, color: "#5EC47A", cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            ) : (() => {
              const d = getDetails(ex.name);
              return (
                <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Timer / Cooldown */}
                  <div style={{ background: "#161925", border: `1px solid ${inCooldown ? "#E0884A44" : "#2A2D3E"}`, borderRadius: 12, padding: "18px 20px", textAlign: "center", minHeight: 148, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {inCooldown ? (
                      <>
                        <div style={{ fontSize: 48, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: 2, color: "#E0884A" }}>
                          {formatTime(cooldownSeconds)}
                        </div>
                        <button
                          onClick={skipCooldown}
                          style={{
                            marginTop: 14, background: "none", border: "1px solid #E0884A",
                            borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700,
                            color: "#E0884A", cursor: "pointer",
                          }}
                        >
                          Skip Cooldown →
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 48, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: 2, color: timerRunning ? phase.color : "#E8E8E8" }}>
                          {formatTime(timerSeconds)}
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                          <button
                            onClick={() => setTimerRunning((r) => !r)}
                            style={{
                              background: timerRunning ? "#2A1D1D" : "#1A3A28",
                              border: `1px solid ${timerRunning ? "#C45E5E" : "#5EC47A"}`,
                              borderRadius: 8, padding: "10px 24px",
                              fontSize: 13, fontWeight: 700,
                              color: timerRunning ? "#C45E5E" : "#5EC47A",
                              cursor: "pointer",
                            }}
                          >
                            {timerRunning ? "⏸ Pause" : "▶ Play"}
                          </button>
                          <button
                            onClick={() => { setTimerSeconds(0); setTimerRunning(false); }}
                            style={{
                              background: "none", border: "1px solid #2A2D3E", borderRadius: 8,
                              padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#667", cursor: "pointer",
                            }}
                          >
                            ↺ Reset
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Nav buttons */}
                  <div style={{ display: "flex", gap: 10 }}>
                    {sessionExIndex > 0 && (
                      <button
                        onClick={() => setSessionExIndex((i) => i - 1)}
                        style={{
                          flex: 1, background: "#1A1D2E", border: "1px solid #2A2D3E", borderRadius: 10,
                          padding: "13px", fontSize: 14, fontWeight: 700, color: "#AAB",
                          cursor: "pointer", letterSpacing: 0.3,
                        }}
                      >
                        ← Previous
                      </button>
                    )}
                    <button
                      onClick={() => goNextExercise(exercises)}
                      style={{
                        flex: 1, background: phase.color, border: "none", borderRadius: 10,
                        padding: "13px", fontSize: 14, fontWeight: 700, color: "#fff",
                        cursor: "pointer", letterSpacing: 0.3,
                      }}
                    >
                      {isLast ? "Finished ✓" : "Next Exercise →"}
                    </button>
                  </div>

                  {/* Exercise detail */}
                  <div style={{ background: "#1A1D2E", border: `1px solid ${phase.color}44`, borderRadius: 12, padding: "20px" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ fontSize: 32 }}>{ex.icon}</div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: phase.color, lineHeight: 1.2 }}>{ex.name}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <span style={{ background: `${phase.color}22`, color: phase.color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>{ex.sets} sets</span>
                          <span style={{ background: "#252840", color: "#AAB", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>{ex.reps}</span>
                        </div>
                      </div>
                    </div>

                    {/* Coach's note */}
                    <div style={{ background: "#12151F", borderLeft: `3px solid ${phase.color}`, borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: phase.color, fontWeight: 700, marginBottom: 4 }}>Coach's note</div>
                      <div style={{ fontSize: 13, color: "#AAB", lineHeight: 1.5 }}>{ex.note}</div>
                    </div>

                    {/* YouTube link */}
                    <a
                      href={ytSearch(ex.name, d)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        background: "#FF000018", border: "1px solid #FF000044", borderRadius: 10,
                        padding: "11px", textDecoration: "none", color: "#FF6B6B",
                        fontWeight: 700, fontSize: 13, marginBottom: 16,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>▶</span> Watch demonstration videos
                    </a>

                    {d ? (
                      <>
                        {/* Steps */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#889", fontWeight: 700, marginBottom: 10 }}>How to do it</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {d.steps.map((s, i) => (
                              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <div style={{
                                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                                  background: phase.color, color: "#fff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 11, fontWeight: 800, marginTop: 1,
                                }}>{i + 1}</div>
                                <div style={{ fontSize: 13.5, color: "#CCD", lineHeight: 1.5 }}>{s}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Form cues */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#5EC47A", fontWeight: 700, marginBottom: 10 }}>✓ Form cues</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {d.cues.map((c, i) => (
                              <div key={i} style={{ fontSize: 13, color: "#AAB", lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
                                <span style={{ position: "absolute", left: 0, color: "#5EC47A" }}>•</span>{c}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Avoid */}
                        <div style={{ marginBottom: d.shoulder ? 16 : 0 }}>
                          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#E0884A", fontWeight: 700, marginBottom: 10 }}>✕ Avoid</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {d.mistakes.map((m, i) => (
                              <div key={i} style={{ fontSize: 13, color: "#AAB", lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
                                <span style={{ position: "absolute", left: 0, color: "#E0884A" }}>•</span>{m}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shoulder note */}
                        {d.shoulder && (
                          <div style={{ background: "#1E2A3A", border: "1px solid #2E5A7A", borderRadius: 10, padding: "13px 15px" }}>
                            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6BB6E0", fontWeight: 700, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                              🩹 Shoulder note
                            </div>
                            <div style={{ fontSize: 13, color: "#AECDE0", lineHeight: 1.5 }}>{d.shoulder}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: "#778", lineHeight: 1.6 }}>
                        Focus on slow, controlled reps and stop a rep or two short of failure while you're learning the movement.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Exercise Detail Modal */}
      {selectedExercise && (() => {
        const ex = selectedExercise;
        const d = getDetails(ex.name);
        return (
          <div
            onClick={() => setSelectedExercise(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
              overflowY: "auto",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#15182440",
                backgroundColor: "#161925",
                border: "1px solid #2A2D3E",
                borderRadius: 16,
                width: "100%",
                maxWidth: 560,
                maxHeight: "90vh",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              }}
            >
              {/* Modal header */}
              <div style={{
                flexShrink: 0,
                background: "#161925",
                borderBottom: "1px solid #2A2D3E",
                padding: "18px 20px",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 28 }}>{ex.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span style={{ background: `${phase.color}22`, color: phase.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{ex.sets} sets</span>
                      <span style={{ background: "#252840", color: "#AAB", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>{ex.reps}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  style={{
                    background: "#252840", border: "none", borderRadius: 8,
                    width: 32, height: 32, color: "#AAB", fontSize: 18, cursor: "pointer",
                    flexShrink: 0, lineHeight: 1,
                  }}
                >×</button>
              </div>

              <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                {/* Watch demonstration */}
                <a
                  href={ytSearch(ex.name, d)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    background: "#FF000018",
                    border: "1px solid #FF000044",
                    borderRadius: 10,
                    padding: "13px",
                    textDecoration: "none",
                    color: "#FF6B6B",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 18 }}>▶</span> Watch demonstration videos
                </a>

                {/* Coach's note */}
                <div style={{ background: "#1A1D2E", borderLeft: `3px solid ${phase.color}`, borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: phase.color, fontWeight: 700, marginBottom: 4 }}>Coach's note</div>
                  <div style={{ fontSize: 13, color: "#AAB", lineHeight: 1.5 }}>{ex.note}</div>
                </div>

                {d ? (
                  <>
                    {/* Steps */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#889", fontWeight: 700, marginBottom: 10 }}>How to do it</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {d.steps.map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{
                              flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                              background: phase.color, color: "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 800, marginTop: 1,
                            }}>{i + 1}</div>
                            <div style={{ fontSize: 13.5, color: "#CCD", lineHeight: 1.5 }}>{s}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form cues */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#5EC47A", fontWeight: 700, marginBottom: 10 }}>✓ Form cues</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {d.cues.map((c, i) => (
                          <div key={i} style={{ fontSize: 13, color: "#AAB", lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: "#5EC47A" }}>•</span>{c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common mistakes */}
                    <div style={{ marginBottom: d.shoulder ? 20 : 0 }}>
                      <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#E0884A", fontWeight: 700, marginBottom: 10 }}>✕ Avoid</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {d.mistakes.map((m, i) => (
                          <div key={i} style={{ fontSize: 13, color: "#AAB", lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: "#E0884A" }}>•</span>{m}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shoulder note */}
                    {d.shoulder && (
                      <div style={{ background: "#1E2A3A", border: "1px solid #2E5A7A", borderRadius: 10, padding: "13px 15px" }}>
                        <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6BB6E0", fontWeight: 700, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                          🩹 Shoulder note
                        </div>
                        <div style={{ fontSize: 13, color: "#AECDE0", lineHeight: 1.5 }}>{d.shoulder}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: "#778", lineHeight: 1.6 }}>
                    Tap the demonstration button above to see this exercise performed. Focus on slow, controlled reps and stop a rep or two short of failure while you're learning the movement.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
