// Lever — skill quests (linear calisthenics goals)
// ---------------------------------------------------------------------------
// The "fun layer" that sits above the muscle-group tracks. Each quest is an
// ORDERED chain of exercise ids (from exerciseLibrary.js). Quests cut across
// muscle groups — e.g. Muscle-Up pulls from both Pull and Push tracks.
//
// In the library, the member exercises also carry `skill` + `skillStep` so the
// two stay in sync. `skillStep` is 1-based and matches the index in `steps` + 1.
//
// "Current step" = the furthest step whose exercise the user has marked able to do.
// V1 just displays these; V2 wires them to progression.
// ---------------------------------------------------------------------------

export const SKILL_QUESTS = [
  {
    id: "handstand",
    name: "Handstand",
    icon: "🤸",
    goal: "From wall support to a freestanding handstand push-up.",
    color: "#C28A3A",
    steps: [
      "wallhandstand",        // 1
      "handstandshouldertaps",// 2  (handstandwallrun is an alt at this step)
      "pikepushup",           // 3
      "deficitpikepushup",    // 4
      "freehandstandkickup",  // 5
      "wallhspushup",         // 6
    ],
    altSteps: { 2: ["handstandwallrun"] },
  },
  {
    id: "muscleup",
    name: "Muscle-Up",
    icon: "👑",
    goal: "Pull + push fused — bar muscle-up, then rings.",
    color: "#7B6FA0",
    steps: [
      "deadhang",    // 1
      "pullup",      // 2
      "ringdip",     // 3
      "weightedpullup", // 4
      "muscleup",    // 5
      "ringmuscleup",// 6
    ],
  },
  {
    id: "lsit",
    name: "L-Sit → V-Sit",
    icon: "🚀",
    goal: "Compression and straight-arm strength to a V-sit.",
    color: "#5B8C5A",
    steps: [
      "hollowbody", // 1
      "tuckLsit",   // 2
      "onelegLsit", // 3
      "Lsit",       // 4
      "vsit",       // 5
    ],
  },
  {
    id: "frontlever",
    name: "Front Lever",
    icon: "🎯",
    goal: "Straight-arm pulling power held horizontal.",
    color: "#4A90A4",
    steps: [
      "pullup",            // 1 (prereq strength)
      "tuckfrontlever",    // 2
      "straddlefrontlever",// 3
      // full front lever = future addition
    ],
  },
  {
    id: "planche",
    name: "Planche",
    icon: "✈️",
    goal: "Straight-arm pressing held parallel to the floor.",
    color: "#A06B4A",
    steps: [
      "dips",        // 1 (prereq strength)
      "ringsupport", // 2 (prereq strength)
      "planchetuck", // 3
      // advanced tuck / straddle planche = future additions
    ],
  },
  {
    id: "humanflag",
    name: "Human Flag",
    icon: "🚩",
    goal: "Hold the body sideways off a vertical pole.",
    color: "#B05A6B",
    steps: [
      "sideplank",     // 1
      "humanflagintro",// 2
      // chamber hold / full flag = future additions
    ],
  },
];

export const QUEST_BY_ID = Object.fromEntries(SKILL_QUESTS.map((q) => [q.id, q]));
