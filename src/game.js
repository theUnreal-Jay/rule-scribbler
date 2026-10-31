import { animationController } from './animations/animationController.js';

// ═══════════════════════════════════════════════════════════
// RULE SCRIBBLER — COMPLETE GAME ENGINE
// The Instructions Are Your Enemy
// ═══════════════════════════════════════════════════════════

// ─── AUDIO SYSTEM ──────────────────────────────────────────
const AudioSystem = (() => {
 let ctx = null;
 let soundEnabled = true;
 let musicEnabled = true;
 let musicTimer = null;
 const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C D E G A

 function getContext() {
 if (!ctx && typeof AudioContext !== 'undefined') {
 ctx = new AudioContext();
 }
 if (ctx && ctx.state === 'suspended') {
 ctx.resume();
 }
 return ctx;
 }

 function play(type) {
 if (!soundEnabled) return;
 const c = getContext();
 if (!c) return;

 const osc = c.createOscillator();
 const gain = c.createGain();
 osc.connect(gain);
 gain.connect(c.destination);
 const now = c.currentTime;

 switch (type) {
 case 'correct':
 osc.type = 'sine';
 osc.frequency.setValueAtTime(523, now);
 osc.frequency.setValueAtTime(659, now + 0.08);
 gain.gain.setValueAtTime(0.15, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
 osc.start(now);
 osc.stop(now + 0.25);
 break;
 case 'wrong':
 osc.type = 'sawtooth';
 osc.frequency.setValueAtTime(200, now);
 osc.frequency.setValueAtTime(150, now + 0.15);
 gain.gain.setValueAtTime(0.12, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
 osc.start(now);
 osc.stop(now + 0.3);
 break;
 case 'click':
 osc.type = 'sine';
 osc.frequency.setValueAtTime(800, now);
 gain.gain.setValueAtTime(0.06, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
 osc.start(now);
 osc.stop(now + 0.06);
 break;
 case 'paper':
 // Soft page flip sound
 osc.type = 'triangle';
 osc.frequency.setValueAtTime(300, now);
 osc.frequency.linearRampToValueAtTime(800, now + 0.08);
 gain.gain.setValueAtTime(0.05, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
 osc.start(now);
 osc.stop(now + 0.12);
 break;
 case 'eraser_rub':
 osc.type = 'sawtooth';
 osc.frequency.setValueAtTime(180, now);
 osc.frequency.linearRampToValueAtTime(90, now + 0.15);
 gain.gain.setValueAtTime(0.08, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
 osc.start(now);
 osc.stop(now + 0.2);
 break;
 case 'badge': {
 const chord = [523, 659, 784, 1047];
 chord.forEach((freq, i) => {
 const o = c.createOscillator();
 const g = c.createGain();
 o.connect(g);
 g.connect(c.destination);
 o.type = 'sine';
 o.frequency.setValueAtTime(freq, now + i * 0.08);
 g.gain.setValueAtTime(0.1, now + i * 0.08);
 g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
 o.start(now + i * 0.08);
 o.stop(now + i * 0.08 + 0.4);
 });
 return;
 }
 case 'levelup': {
 const notes = [523, 659, 784, 1047];
 notes.forEach((freq, i) => {
 const o = c.createOscillator();
 const g = c.createGain();
 o.connect(g);
 g.connect(c.destination);
 o.type = 'sine';
 o.frequency.setValueAtTime(freq, now + i * 0.12);
 g.gain.setValueAtTime(0.12, now + i * 0.12);
 g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
 o.start(now + i * 0.12);
 o.stop(now + i * 0.12 + 0.3);
 });
 return;
 }
 case 'fail': {
 osc.type = 'sawtooth';
 osc.frequency.setValueAtTime(350, now);
 osc.frequency.linearRampToValueAtTime(100, now + 0.5);
 gain.gain.setValueAtTime(0.1, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
 osc.start(now);
 osc.stop(now + 0.5);
 break;
 }
 case 'write':
 osc.type = 'triangle';
 osc.frequency.setValueAtTime(2000 + Math.random() * 800, now);
 gain.gain.setValueAtTime(0.03, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
 osc.start(now);
 osc.stop(now + 0.05);
 break;
 case 'rulechange':
 osc.type = 'square';
 osc.frequency.setValueAtTime(400, now);
 osc.frequency.setValueAtTime(300, now + 0.1);
 osc.frequency.setValueAtTime(500, now + 0.2);
 gain.gain.setValueAtTime(0.08, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
 osc.start(now);
 osc.stop(now + 0.35);
 break;
 case 'coin':
 osc.type = 'sine';
 osc.frequency.setValueAtTime(1200, now);
 osc.frequency.setValueAtTime(1600, now + 0.05);
 gain.gain.setValueAtTime(0.08, now);
 gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
 osc.start(now);
 osc.stop(now + 0.15);
 break;
 }
 }

 function startMusic() {
 if (!musicEnabled || musicTimer) return;
 musicTimer = setInterval(() => {
 if (!musicEnabled) return;
 const c = getContext();
 if (!c) return;
 const note = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
 const o = c.createOscillator();
 const g = c.createGain();
 const now = c.currentTime;
 o.type = 'triangle';
 o.frequency.setValueAtTime(note, now);
 g.gain.setValueAtTime(0.015, now);
 g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
 o.connect(g);
 g.connect(c.destination);
 o.start(now);
 o.stop(now + 0.9);
 }, 1200);
 }

 function stopMusic() {
 if (musicTimer) {
 clearInterval(musicTimer);
 musicTimer = null;
 }
 }

 return {
 play,
 setEnabled(v) { soundEnabled = v; },
 get enabled() { return soundEnabled; },
 setMusicEnabled(v) {
 musicEnabled = v;
 if (v) startMusic();
 else stopMusic();
 },
 get musicEnabled() { return musicEnabled; },
 startMusic,
 stopMusic
 };
})();


// ─── SAVE SYSTEM ───────────────────────────────────────────
const SaveSystem = (() => {
 const SAVE_KEY = 'ruleScribblerSave';
 const DEFAULT = {
 version: 2,
 unlockedLevel: 1,
 completedLevels: {}, // { levelNum: { stars, score, accuracy } }
 coins: 0,
 totalStars: 0,
 selectedPencilSkin: 'default',
 selectedEraserSkin: 'default',
 unlockedPencilSkins: ['default'],
 unlockedEraserSkins: ['default'],
 badges: [],
 stats: {
 totalAttempts: 0,
 totalWins: 0,
 totalFails: 0,
 correctAnswers: 0,
 wrongAnswers: 0,
 bestStreak: 0,
 highestScore: 0,
 endlessHighScore: 0,
 endlessMaxRounds: 0,
 totalPlayTime: 0
 },
 settings: {
 sound: true,
 music: true,
 vibration: true,
 highContrast: false,
 reduceMotion: false
 }
 };

 let data = structuredClone(DEFAULT);

 function load() {
 try {
 const raw = localStorage.getItem(SAVE_KEY);
 if (raw) {
 const parsed = JSON.parse(raw);
 data = { ...structuredClone(DEFAULT), ...parsed };
 data.stats = { ...DEFAULT.stats, ...parsed.stats };
 data.settings = { ...DEFAULT.settings, ...parsed.settings };
 data.unlockedPencilSkins = parsed.unlockedPencilSkins || ['default'];
 data.unlockedEraserSkins = parsed.unlockedEraserSkins || ['default'];
 data.badges = parsed.badges || [];
 }
 } catch { /* use defaults */ }
 }

 function save() {
 try {
 localStorage.setItem(SAVE_KEY, JSON.stringify(data));
 } catch { /* storage full */ }
 }

 function reset() {
 data = structuredClone(DEFAULT);
 save();
 }

 load();

 return {
 get data() { return data; },
 save,
 load,
 reset,
 unlockLevel(n) {
 if (n > data.unlockedLevel) {
 data.unlockedLevel = n;
 save();
 }
 },
 completeLevel(level, stars, score, accuracy) {
 const existing = data.completedLevels[level];
 if (!existing || stars > existing.stars || score > existing.score) {
 data.completedLevels[level] = {
 stars: Math.max(stars, existing?.stars || 0),
 score: Math.max(score, existing?.score || 0),
 accuracy: Math.max(accuracy, existing?.accuracy || 0)
 };
 }
 let totalStars = 0;
 for (const l of Object.values(data.completedLevels)) {
 totalStars += l.stars;
 }
 data.totalStars = totalStars;
 save();
 },
 addCoins(n) {
 data.coins += n;
 save();
 },
 unlockBadge(badgeId) {
 if (!data.badges.includes(badgeId)) {
 data.badges.push(badgeId);
 save();
 AudioSystem.play('badge');
 return true;
 }
 return false;
 },
 buySkin(type, skinId, cost) {
 const list = type === 'pencil' ? data.unlockedPencilSkins : data.unlockedEraserSkins;
 if (list.includes(skinId)) return true;
 if (data.coins >= cost) {
 data.coins -= cost;
 list.push(skinId);
 if (type === 'pencil') data.selectedPencilSkin = skinId;
 else data.selectedEraserSkin = skinId;
 save();
 AudioSystem.play('coin');
 return true;
 }
 return false;
 },
 equipSkin(type, skinId) {
 if (type === 'pencil') data.selectedPencilSkin = skinId;
 else data.selectedEraserSkin = skinId;
 save();
 }
 };
})();


// ─── RULE DEFINITIONS ──────────────────────────────────────
const RULE_DEFS = [
 { id: 'tap_green', text: 'TAP GREEN', type: 'color', target: 'green', difficulty: 1 },
 { id: 'avoid_red', text: 'AVOID RED', type: 'avoid', target: 'red', difficulty: 1 },
 { id: 'tap_blue', text: 'TAP BLUE', type: 'color', target: 'blue', difficulty: 1 },
 { id: 'tap_yellow', text: 'TAP YELLOW', type: 'color', target: 'yellow', difficulty: 2 },
 { id: 'avoid_green', text: 'AVOID GREEN', type: 'avoid', target: 'green', difficulty: 2 },
 { id: 'tap_biggest', text: 'TAP THE BIGGEST', type: 'size', target: 'large', difficulty: 2 },
 { id: 'tap_smallest', text: 'TAP THE SMALLEST', type: 'size', target: 'small', difficulty: 2 },
 { id: 'tap_circle', text: 'TAP THE CIRCLE', type: 'shape', target: 'circle', difficulty: 2 },
 { id: 'tap_square', text: 'TAP THE SQUARE', type: 'shape', target: 'square', difficulty: 2 },
 { id: 'tap_triangle', text: 'TAP THE TRIANGLE', type: 'shape', target: 'triangle', difficulty: 3 },
 { id: 'tap_left', text: 'TAP THE LEFTMOST', type: 'position', target: 'left', difficulty: 3 },
 { id: 'tap_right', text: 'TAP THE RIGHTMOST', type: 'position', target: 'right', difficulty: 3 },
 { id: 'avoid_blue', text: 'AVOID BLUE', type: 'avoid', target: 'blue', difficulty: 3 },
 { id: 'tap_purple', text: 'TAP PURPLE', type: 'color', target: 'purple', difficulty: 3 },
 { id: 'avoid_yellow', text: 'AVOID YELLOW', type: 'avoid', target: 'yellow', difficulty: 4 },
 { id: 'tap_orange', text: 'TAP ORANGE', type: 'color', target: 'orange', difficulty: 4 },
 { id: 'tap_none', text: "DON'T TAP ANYTHING", type: 'negative', target: 'none', difficulty: 4 },
];

// ─── BETRAYAL TYPES ────────────────────────────────────────
const BETRAYAL_TYPES = {
 none: { id: 'none', name: 'Normal', difficulty: 0 },
 rewrite: { id: 'rewrite', name: 'Rewrite', difficulty: 2 },
 hide: { id: 'hide', name: 'Hide', difficulty: 3 },
 confuse: { id: 'confuse', name: 'Confuse', difficulty: 3 },
 fake: { id: 'fake', name: 'Fake', difficulty: 4 },
 reverse: { id: 'reverse', name: 'Reverse', difficulty: 5 },
};

// ─── PENCIL DIALOGUE ──────────────────────────────────────
const PENCIL_LINES = {
 watching: [
 'Pencil is watching...',
 'Hmm...',
 'Interesting choice...',
 'Are you sure?',
 'I wouldn\'t tap that...',
 'Think carefully...',
 '*scribbles nervously*'
 ],
 correct: [
 'Lucky guess.',
 'Okay, fine.',
 'That was easy!',
 'Don\'t get cocky.',
 'Beginners luck...'
 ],
 wrong: [
 'I literally told you!',
 'Can you even read?',
 'Not your finest moment.',
 'Read the rules!',
 'That was obvious...',
 'Try again, genius.'
 ],
 rewrite: [
 'Oops, let me fix that...',
 'Actually, I meant...',
 'Change of plans!',
 'Scratch that...',
 'NEW RULE!'
 ],
 levelStart: [
 'Let\'s begin...',
 'Ready?',
 'Read carefully...',
 'This one\'s easy... maybe.',
 'Pay attention!'
 ]
};

// ─── LEVEL CONFIGURATIONS ──────────────────────────────────
const CHAPTER_NAMES = [
 'The Basics',
 'Something Is Wrong',
 "The Pencil's Game",
 'No More Rules',
 'The Final Note',
 'Inkstorm',
 'The Paper Maze',
 'The Eraser Trials',
 'Unstable Reality',
 'The Last Draft'
];

const CHAPTER_THEMES = [
 '',
 'theme-aged',
 'theme-graph',
 'theme-blue',
 'theme-destroyed'
];

// Each new mechanic arrives after a 10–20 level training interval.
// Twists remain in the pool afterwards, so later levels can combine them.
const TWIST_DEFS = [
 { id: 'moving', name: 'Moving Targets', hint: 'Targets drift across the page.', every: 12 },
 { id: 'ink', name: 'Ink Spill', hint: 'The ink obscures part of the instruction.', every: 15 },
 { id: 'double', name: 'Double Tap', hint: 'Some targets need two deliberate taps.', every: 18 },
 { id: 'shrink', name: 'Vanishing Size', hint: 'Targets shrink and grow while you decide.', every: 14 },
 { id: 'rotation', name: 'Spin Cycle', hint: 'Shapes rotate while the Pencil distracts you.', every: 16 },
 { id: 'mirror', name: 'Mirror Page', hint: 'Left and right are swapped.', every: 20 },
 { id: 'flicker', name: 'Flicker Ink', hint: 'Targets briefly fade from view.', every: 13 },
 { id: 'decoy', name: 'False Marks', hint: 'The Pencil adds distracting marks.', every: 17 }
];

function chapterNameFor(chapter) {
 const base = CHAPTER_NAMES[(chapter - 1) % CHAPTER_NAMES.length];
 const cycle = Math.floor((chapter - 1) / CHAPTER_NAMES.length);
 return cycle ? `${base} ${cycle + 1}` : base;
}

function twistForLevel(level) {
 if (level < 11) return null;
 let cursor = 10;
 let twistIndex = 0;
 const unlocked = [];
 while (cursor <= level) {
   const base = TWIST_DEFS[twistIndex % TWIST_DEFS.length];
   const tier = Math.floor(twistIndex / TWIST_DEFS.length) + 1;
   const variant = {
     ...base,
     tier,
     name: tier === 1 ? base.name : `${base.name} — Stage ${tier}`,
     hint: tier === 1 ? base.hint : `${base.hint} The Pencil has made it harder.`
   };
   const previous = unlocked.findIndex(t => t.id === base.id);
   if (previous >= 0) unlocked.splice(previous, 1);
   unlocked.push(variant);
   cursor += base.every;
   twistIndex++;
 }
 const current = unlocked[unlocked.length - 1];
 if (!current) return null;
 return {
   ...current,
   active: true,
   pool: unlocked
 };
}

function generateLevelConfig(level) {
 const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
 const chapter = Math.ceil(safeLevel / 10);
 const difficulty = Math.min(5, 1 + Math.floor((safeLevel - 1) / 20));
 const positionInChapter = ((safeLevel - 1) % 10) + 1;
 const rounds = Math.min(5 + Math.floor(safeLevel / 4), 18);
 const lives = 3;
 const timeLimit = safeLevel <= 5 ? 0 : Math.max(5, 15 - Math.floor(safeLevel / 25));

 const availableRules = RULE_DEFS.filter(r => r.difficulty <= difficulty);
 const availableBetrayals = ['none'];
 if (safeLevel >= 5) availableBetrayals.push('rewrite');
 if (safeLevel >= 12) availableBetrayals.push('hide');
 if (safeLevel >= 15) availableBetrayals.push('confuse');
 if (safeLevel >= 22) availableBetrayals.push('fake');
 if (safeLevel >= 32) availableBetrayals.push('reverse');

 const betrayalChance = safeLevel <= 4 ? 0 : Math.min(0.12 + (safeLevel - 5) * 0.008, 0.62);
 const objectCount = Math.min(3 + Math.floor(safeLevel / 8), 8);
 const theme = CHAPTER_THEMES[(chapter - 1) % CHAPTER_THEMES.length];
 const twist = twistForLevel(safeLevel);

 return {
 level: safeLevel,
 chapter,
 theme,
 rounds,
 lives,
 timeLimit,
 availableRules,
 availableBetrayals,
 betrayalChance,
 objectCount,
 chapterName: chapterNameFor(chapter),
 positionInChapter,
 twist,
 twistPool: twist?.pool || []
 };
}

// ─── OBJECT GENERATOR ─────────────────────────────────────
const COLORS = ['green', 'red', 'blue', 'yellow', 'purple', 'orange'];
const SHAPES = ['circle', 'square', 'triangle'];
const SIZES = ['small', 'medium', 'large'];

function randomItem(arr) {
 return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
 const a = [...arr];
 for (let i = a.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [a[i], a[j]] = [a[j], a[i]];
 }
 return a;
}

function generateObjects(rule, count) {
 const objects = [];

 // Always ensure at least one correct answer (unless negative rule)
 if (rule.type === 'negative') {
 // All objects should exist but none should be tapped
 for (let i = 0; i < count; i++) {
 objects.push({
 id: i,
 color: randomItem(COLORS),
 shape: randomItem(SHAPES),
 size: randomItem(SIZES),
 isCorrect: false
 });
 }
 return shuffle(objects);
 }

 // Create one guaranteed correct answer
 const correctObj = createCorrectObject(0, rule);
 objects.push(correctObj);

 // For 'avoid' rules: guarantee at least one trap object (the avoided color)
 if (rule.type === 'avoid' && count >= 2) {
 objects.push({
 id: 1,
 color: rule.target,
 shape: randomItem(SHAPES),
 size: randomItem(SIZES),
 isCorrect: false
 });
 }

 // Fill remaining slots with varied objects
 const usedShapes = new Set(objects.map(o => o.shape));
 for (let i = objects.length; i < count; i++) {
 const obj = {
 id: i,
 color: randomItem(COLORS),
 shape: randomItem(SHAPES),
 size: randomItem(SIZES),
 isCorrect: false
 };

 // For color rules, filler objects should NOT be the target color
 if (rule.type === 'color') {
 obj.color = randomItem(COLORS.filter(c => c !== rule.target));
 }

 // For avoid rules, mix of traps and safe — roughly 40% chance of trap
 if (rule.type === 'avoid') {
 obj.color = Math.random() < 0.4
 ? rule.target
 : randomItem(COLORS.filter(c => c !== rule.target));
 }

 // For size rules, ensure no duplicates of the target size
 if (rule.type === 'size') {
 obj.size = randomItem(SIZES.filter(s => s !== rule.target));
 }

 // Try to add shape variety
 if (usedShapes.size < SHAPES.length && i < SHAPES.length) {
 const unusedShapes = SHAPES.filter(s => !usedShapes.has(s));
 if (unusedShapes.length > 0) {
 obj.shape = randomItem(unusedShapes);
 usedShapes.add(obj.shape);
 }
 }

 objects.push(obj);
 }

 // Mark correctness
 objects.forEach(obj => {
 obj.isCorrect = checkAnswer(obj, rule, objects);
 });

 return shuffle(objects);
}

function createCorrectObject(id, rule) {
 const obj = {
 id,
 color: randomItem(COLORS),
 shape: randomItem(SHAPES),
 size: 'medium',
 isCorrect: true
 };

 switch (rule.type) {
 case 'color':
 obj.color = rule.target;
 break;
 case 'avoid':
 // Correct = any color that is NOT the target
 obj.color = randomItem(COLORS.filter(c => c !== rule.target));
 break;
 case 'size':
 obj.size = rule.target;
 break;
 case 'shape':
 obj.shape = rule.target;
 break;
 case 'position':
 // Position is handled during rendering
 break;
 }

 return obj;
}

function checkAnswer(obj, rule, allObjects) {
 switch (rule.type) {
 case 'color':
 return obj.color === rule.target;
 case 'avoid':
 return obj.color !== rule.target;
 case 'size':
 return obj.size === rule.target;
 case 'shape':
 return obj.shape === rule.target;
 case 'position': {
 if (rule.target === 'left') {
 // The leftmost object in render order is index 0
 return obj.id === 0;
 }
 if (rule.target === 'right') {
 return obj.id === allObjects.length - 1;
 }
 return false;
 }
 case 'negative':
 return false; // nothing is correct to tap
 default:
 return false;
 }
}


// ─── BETRAYAL SYSTEM ───────────────────────────────────────
function selectBetrayal(config) {
 if (Math.random() > config.betrayalChance) return { type: 'none' };
 const available = config.availableBetrayals.filter(b => b !== 'none');
 if (available.length === 0) return { type: 'none' };
 return { type: randomItem(available) };
}

function applyBetrayal(betrayal, currentRule, config) {
 switch (betrayal.type) {
 case 'rewrite': {
 // Pick a different rule
 const otherRules = config.availableRules.filter(r => r.id !== currentRule.id);
 if (otherRules.length === 0) return currentRule;
 return randomItem(otherRules);
 }
 case 'hide': {
 // Return the same rule but mark as hidden
 return { ...currentRule, hidden: true };
 }
 case 'confuse': {
 // Show two rules, the second one is the real one
 const otherRules = config.availableRules.filter(r => r.id !== currentRule.id);
 const fake = otherRules.length > 0 ? randomItem(otherRules) : currentRule;
 return { ...currentRule, confuseWith: fake };
 }
 case 'fake': {
 // Display a wrong rule but keep the original as correct
 const otherRules = config.availableRules.filter(r => r.id !== currentRule.id);
 const fakeRule = otherRules.length > 0 ? randomItem(otherRules) : currentRule;
 return { ...currentRule, fakeDisplay: fakeRule };
 }
 case 'reverse': {
 // Flip color rules: TAP → AVOID, AVOID → TAP
 if (currentRule.type === 'color') {
 return {
 ...currentRule,
 id: 'reversed_' + currentRule.id,
 text: 'AVOID ' + currentRule.target.toUpperCase(),
 type: 'avoid',
 reversed: true
 };
 }
 if (currentRule.type === 'avoid') {
 return {
 ...currentRule,
 id: 'reversed_' + currentRule.id,
 text: 'TAP ' + currentRule.target.toUpperCase(),
 type: 'color',
 reversed: true
 };
 }
 return currentRule;
 }
 default:
 return currentRule;
 }
}


// ─── SCORING SYSTEM ────────────────────────────────────────
function calculateScore(speedBonus, streak) {
 return 100 + speedBonus + Math.min(streak * 10, 100);
}

function calculateStars(accuracy, livesRemaining, totalLives) {
 if (accuracy >= 0.95 && livesRemaining === totalLives) return 3;
 if (accuracy >= 0.80) return 2;
 return 1;
}

function calculateCoins(stars) {
 let coins = 20; // base
 if (stars >= 2) coins += 10;
 if (stars >= 3) coins += 20;
 return coins;
}


// ─── GAME STATE ────────────────────────────────────────────
const GameState = {
 LOADING: 'splash-screen',
 HOME: 'home-screen',
 LEVEL_SELECT: 'level-select-screen',
 SETTINGS: 'settings-screen',
 COLLECTION: 'collection-screen',
 PLAYING: 'gameplay-screen',
 PAUSED: 'pause-screen',
 LEVEL_COMPLETE: 'level-complete-screen',
 LEVEL_FAILED: 'level-failed-screen',
};

let currentState = GameState.LOADING;
let previousState = null;

// Active game data
let gameData = {
 isEndless: false,
 currentLevel: 1,
 config: null,
 currentRound: 0,
 totalRounds: 5,
 lives: 3,
 maxLives: 3,
 score: 0,
 streak: 0,
 correctAnswers: 0,
 wrongAnswers: 0,
 totalActions: 0,
 currentRule: null,
 currentObjects: [],
 currentBetrayal: null,
 activeRule: null, // the rule after betrayal
 roundStartTime: 0,
 timerInterval: null,
 timeRemaining: 0,
 inputLocked: false,
 roundId: 0,
 negativeTimer: null
};

// ─── BADGES & SKINS ────────────────────────────────────────
const BADGES = [
  {
    id: 'first_step',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 2l4 4-9 9-4 1 1-4 9-9z M16 6l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    title: 'First Scribble',
    desc: 'Complete Level 1'
  },
  {
    id: 'chapter_1',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    title: 'Notebook Grad',
    desc: 'Clear Chapter 1 (Levels 1-10)'
  },
  {
    id: 'streak_5',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    title: 'Warming Up',
    desc: 'Reach a streak of 5'
  },
  {
    id: 'streak_10',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z M19 4l-4 5 M5 20l4-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    title: 'Sharp Mind',
    desc: 'Reach a streak of 10'
  },
  {
    id: 'rule_master',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    title: 'Rule Master',
    desc: 'Earn 3 stars on any 5 levels'
  },
  {
    id: 'survivor_5',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    title: 'Endless Novice',
    desc: 'Survive 5 rounds in Endless'
  },
  {
    id: 'survivor_15',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 9 C6 4 18 4 18 9 C18 13 14 15 12 16 C10 15 6 13 6 9 Z M12 16 L12 20 M8 21 L16 21 M6 7H3v3c0 2 2 3 3 3 M18 7h3v3c0 2-2 3-3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    title: 'Endless Legend',
    desc: 'Survive 15 rounds in Endless'
  },
  {
    id: 'rich',
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7 L12 17 M9 9.5 C9 8 15 8 15 10.5 C15 13 9 12 9 14.5 C9 17 15 17 15 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    title: 'Coin Hoarder',
    desc: 'Collect 100 or more coins'
  }
];

const PENCIL_SKINS = [
 { id: 'default', name: 'Classic Yellow', cost: 0, color: '#f0c75e' },
 { id: 'neon', name: 'Neon Cyan', cost: 100, color: '#00e5ff' },
 { id: 'blood', name: 'Crimson Quill', cost: 200, color: '#d32f2f' },
 { id: 'gold', name: 'Golden Nib', cost: 350, color: '#ffd54f' },
 { id: 'dark', name: 'Phantom Charcoal', cost: 250, color: '#455a64' }
];

const ERASER_SKINS = [
 { id: 'default', name: 'Pink Classic', cost: 0, color: '#f0a0a0' },
 { id: 'mint', name: 'Mint Fresh', cost: 80, color: '#80cbc4' },
 { id: 'purple', name: 'Lavender Dream', cost: 150, color: '#ce93d8' },
 { id: 'gold', name: 'Golden Rub', cost: 300, color: '#ffe082' }
];

function checkBadges() {
 const data = SaveSystem.data;
 if (data.completedLevels[1]) SaveSystem.unlockBadge('first_step');

 let ch1Done = true;
 for (let i = 1; i <= 10; i++) {
 if (!data.completedLevels[i]) { ch1Done = false; break; }
 }
 if (ch1Done) SaveSystem.unlockBadge('chapter_1');

 if (data.stats.bestStreak >= 5) SaveSystem.unlockBadge('streak_5');
 if (data.stats.bestStreak >= 10) SaveSystem.unlockBadge('streak_10');

 let threeStarCount = 0;
 for (const l of Object.values(data.completedLevels)) {
 if (l.stars >= 3) threeStarCount++;
 }
 if (threeStarCount >= 5) SaveSystem.unlockBadge('rule_master');

 if (data.stats.endlessMaxRounds >= 5) SaveSystem.unlockBadge('survivor_5');
 if (data.stats.endlessMaxRounds >= 15) SaveSystem.unlockBadge('survivor_15');
 if (data.coins >= 100) SaveSystem.unlockBadge('rich');
}

function applyCharacterSkins() {
 const pSkin = SaveSystem.data.selectedPencilSkin || 'default';
 const eSkin = SaveSystem.data.selectedEraserSkin || 'default';

 document.querySelectorAll('.pencil-body').forEach(el => {
 el.className = el.className.replace(/pencil-skin-\w+/g, '').trim();
 if (pSkin !== 'default') el.classList.add(`pencil-skin-${pSkin}`);
 });

 const eraser = document.getElementById('eraser-character');
 if (eraser) {
 eraser.className = eraser.className.replace(/eraser-skin-\w+/g, '').trim();
 if (eSkin !== 'default') eraser.classList.add(`eraser-skin-${eSkin}`);
 }
}

function renderCollectionScreen(activeTab = 'badges') {
 checkBadges();
 applyCharacterSkins();

 // Switch tabs
 document.querySelectorAll('.col-tab').forEach(t => {
 t.classList.toggle('active', t.dataset.tab === activeTab);
 });
 document.querySelectorAll('.col-tab-panel').forEach(p => {
 p.classList.toggle('active', p.id === `panel-${activeTab}`);
 });

 // Render Badges
 const badgesGrid = document.getElementById('badges-grid');
 if (badgesGrid) {
 badgesGrid.innerHTML = '';
 BADGES.forEach(b => {
 const unlocked = SaveSystem.data.badges.includes(b.id);
 const item = document.createElement('div');
 item.className = 'badge-item' + (unlocked ? ' unlocked' : '');
 item.innerHTML = `
 <div class="badge-icon">${b.icon}</div>
 <div class="badge-info">
 <div class="badge-title">${b.title}</div>
 <div class="badge-desc">${b.desc}</div>
 </div>
 `;
 badgesGrid.appendChild(item);
 });
 }

 // Render Pencil Skins
 const pGrid = document.getElementById('pencil-skins-grid');
 if (pGrid) {
 pGrid.innerHTML = '';
 PENCIL_SKINS.forEach(s => {
 const unlocked = SaveSystem.data.unlockedPencilSkins.includes(s.id);
 const equipped = SaveSystem.data.selectedPencilSkin === s.id;
 const item = document.createElement('div');
 item.className = 'skin-item';
 item.innerHTML = `
 <div class="skin-preview">
 <div style="width:16px;height:42px;background:${s.color};border-radius:2px;border:1px solid #444;"></div>
 </div>
 <div class="skin-name">${s.name}</div>
 <div class="skin-cost">${unlocked ? (equipped ? 'Equipped' : 'Unlocked') : `${s.cost} coins`}</div>
 `;
 const btn = document.createElement('button');
 btn.className = 'btn-skin' + (equipped ? ' equipped' : '');
 btn.textContent = equipped ? ' In Use' : (unlocked ? 'Equip' : 'Buy');
 btn.addEventListener('click', () => {
 if (equipped) return;
 if (unlocked) {
 SaveSystem.equipSkin('pencil', s.id);
 AudioSystem.play('click');
 applyCharacterSkins();
 renderCollectionScreen('skins');
 } else {
 if (SaveSystem.buySkin('pencil', s.id, s.cost)) {
 renderHomeStats();
 applyCharacterSkins();
 renderCollectionScreen('skins');
 } else {
 alert('Not enough coins! Play levels to earn more.');
 }
 }
 });
 item.appendChild(btn);
 pGrid.appendChild(item);
 });
 }

 // Render Eraser Skins
 const eGrid = document.getElementById('eraser-skins-grid');
 if (eGrid) {
 eGrid.innerHTML = '';
 ERASER_SKINS.forEach(s => {
 const unlocked = SaveSystem.data.unlockedEraserSkins.includes(s.id);
 const equipped = SaveSystem.data.selectedEraserSkin === s.id;
 const item = document.createElement('div');
 item.className = 'skin-item';
 item.innerHTML = `
 <div class="skin-preview">
 <div style="width:30px;height:20px;background:${s.color};border-radius:4px;border:1px solid #444;"></div>
 </div>
 <div class="skin-name">${s.name}</div>
 <div class="skin-cost">${unlocked ? (equipped ? 'Equipped' : 'Unlocked') : `${s.cost} coins`}</div>
 `;
 const btn = document.createElement('button');
 btn.className = 'btn-skin' + (equipped ? ' equipped' : '');
 btn.textContent = equipped ? ' In Use' : (unlocked ? 'Equip' : 'Buy');
 btn.addEventListener('click', () => {
 if (equipped) return;
 if (unlocked) {
 SaveSystem.equipSkin('eraser', s.id);
 AudioSystem.play('click');
 applyCharacterSkins();
 renderCollectionScreen('skins');
 } else {
 if (SaveSystem.buySkin('eraser', s.id, s.cost)) {
 renderHomeStats();
 applyCharacterSkins();
 renderCollectionScreen('skins');
 } else {
 alert('Not enough coins! Play levels to earn more.');
 }
 }
 });
 item.appendChild(btn);
 eGrid.appendChild(item);
 });
 }

 // Render Stats
 const st = SaveSystem.data.stats;
 const totalCompleted = Object.keys(SaveSystem.data.completedLevels).length;
 const acc = (st.correctAnswers + st.wrongAnswers) > 0
 ? Math.round((st.correctAnswers / (st.correctAnswers + st.wrongAnswers)) * 100) + '%'
 : '0%';

 const statsCard = document.getElementById('stats-card');
 if (statsCard) {
 statsCard.innerHTML = `
 <div class="stat-row-item"><span class="stat-key">Levels Cleared</span><span class="stat-val">${totalCompleted} completed</span></div>
 <div class="stat-row-item"><span class="stat-key">Total Stars</span><span class="stat-val">${SaveSystem.data.totalStars}</span></div>
 <div class="stat-row-item"><span class="stat-key">Coins</span><span class="stat-val">${SaveSystem.data.coins}</span></div>
 <div class="stat-row-item"><span class="stat-key">Endless Best Score</span><span class="stat-val">${st.endlessHighScore}</span></div>
 <div class="stat-row-item"><span class="stat-key">Endless Max Rounds</span><span class="stat-val">${st.endlessMaxRounds}</span></div>
 <div class="stat-row-item"><span class="stat-key">Best Answer Streak</span><span class="stat-val">${st.bestStreak}</span></div>
 <div class="stat-row-item"><span class="stat-key">Overall Accuracy</span><span class="stat-val">${acc}</span></div>
 <div class="stat-row-item"><span class="stat-key">Total Correct Answers</span><span class="stat-val">${st.correctAnswers}</span></div>
 <div class="stat-row-item"><span class="stat-key">Total Mistakes</span><span class="stat-val">${st.wrongAnswers}</span></div>
 <div class="stat-row-item"><span class="stat-key">Total Attempts</span><span class="stat-val">${st.totalAttempts}</span></div>
 `;
 }
}


// ─── SCREEN MANAGEMENT ────────────────────────────────────
function changeState(newState) {
  previousState = currentState;
  currentState = newState;

  animationController.clearOnScreenChange();

  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });

  // Show new screen
  const el = document.getElementById(newState);
  if (el) el.classList.add('active');

  // Show overlays on top of gameplay
  if (newState === GameState.PAUSED ||
      newState === GameState.LEVEL_COMPLETE ||
      newState === GameState.LEVEL_FAILED) {
    const gameplay = document.getElementById(GameState.PLAYING);
    if (gameplay) gameplay.classList.add('active');
  }

  if (newState === GameState.HOME) {
    animationController.transitions.playHomeEntrance();
  }
}


// ─── UI RENDERING ──────────────────────────────────────────

function renderHomeStats() {
  const coinEl = document.querySelector('#home-coins .coin-val');
  if (coinEl) coinEl.textContent = `${SaveSystem.data.coins}`;
  else {
    const el = document.getElementById('home-coins');
    if (el) el.textContent = `${SaveSystem.data.coins} coins`;
  }
  const starEl = document.querySelector('#home-stars .star-val');
  if (starEl) starEl.textContent = `${SaveSystem.data.totalStars}`;
  else {
    const el = document.getElementById('home-stars');
    if (el) el.textContent = `${SaveSystem.data.totalStars} stars`;
  }
}

function renderLevelSelect() {
 const tabsEl = document.getElementById('chapter-tabs');
 tabsEl.innerHTML = '';
 const chapterCount = Math.max(5, Math.ceil((SaveSystem.data.unlockedLevel + 1) / 10));
 for (let i = 0; i < chapterCount; i++) {
 const tab = document.createElement('button');
 tab.className = 'chapter-tab' + (i === 0 ? ' active' : '');
 tab.textContent = `CH. ${i + 1}`;
 tab.title = chapterNameFor(i + 1);
 tab.addEventListener('pointerdown', () => {
 tabsEl.querySelectorAll('.chapter-tab').forEach(t => t.classList.remove('active'));
 tab.classList.add('active');
 renderLevelGrid(i);
 });
 tabsEl.appendChild(tab);
 }
 renderLevelGrid(0);
}

function renderLevelGrid(chapterIndex) {
 const gridEl = document.getElementById('level-grid');
 gridEl.innerHTML = '';
 const start = chapterIndex * 10 + 1;
 const end = start + 9;

 const heading = document.createElement('div');
 heading.className = 'chapter-name-banner';
 heading.textContent = chapterNameFor(chapterIndex + 1);
 gridEl.appendChild(heading);

 for (let i = start; i <= end; i++) {
 const cell = document.createElement('button');
 cell.type = 'button';
 cell.className = 'level-cell';
 const completed = SaveSystem.data.completedLevels[i];
 const unlocked = i <= SaveSystem.data.unlockedLevel;

 if (completed) {
 cell.classList.add('completed');
 const starsStr = '★'.repeat(completed.stars) + '☆'.repeat(3 - completed.stars);
 cell.innerHTML = `<span>${i}</span><span class="level-stars">${starsStr}</span>`;
 } else if (unlocked) {
 cell.innerHTML = `<span>${i}</span>`;
 } else {
 cell.classList.add('locked');
 cell.innerHTML = `<span class="lock-mark" aria-hidden="true"></span><span>${i}</span>`;
 }

 cell.disabled = !unlocked;
 if (unlocked) {
 cell.addEventListener('pointerdown', () => {
 AudioSystem.play('click');
 startLevel(i);
 });
 }
 gridEl.appendChild(cell);
 }
}

let lastRenderedScore = 0;
function renderLives() {
  const el = document.getElementById('lives-display');
  animationController.ui.renderHearts(el, gameData.lives, gameData.maxLives);
  animationController.eraser.setLowLife(gameData.lives === 1);
}

function renderScore() {
  const el = document.getElementById('score-display');
  if (el) {
    animationController.ui.animateCounter(el, lastRenderedScore, gameData.score, 380);
    lastRenderedScore = gameData.score;
  }
}

function renderProgress() {
 const done = gameData.currentRound;
 const total = gameData.totalRounds;
 document.getElementById('progress-label').textContent = `Progress: ${done} / ${total}`;
 document.getElementById('progress-fill').style.width = `${(done / total) * 100}%`;
}

function renderInstruction(rule, betrayal) {
  const textEl = document.getElementById('instruction-text');
  const subEl = document.getElementById('instruction-sub');

  textEl.classList.remove('crossed-out', 'rewritten');

  if (betrayal && betrayal.type === 'hide' && rule.hidden) {
    // Show partially hidden text
    const words = rule.text.split(' ');
    const hiddenIdx = Math.floor(Math.random() * words.length);
    words[hiddenIdx] = '█'.repeat(words[hiddenIdx].length);
    animationController.board.revealText(words.join(' '), 'Something is hidden...');
    // Reveal after delay
    setTimeout(() => {
      if (gameData.roundId === rule._roundId) {
        animationController.board.revealText(rule.text, 'Now you see it!');
      }
    }, 2000);
  } else if (betrayal && betrayal.type === 'confuse' && rule.confuseWith) {
    textEl.innerHTML = `<span style="text-decoration: line-through; opacity: 0.4;">${rule.confuseWith.text}</span><br>${rule.text}`;
    subEl.textContent = 'Which one is real?';
    animationController.board.playEntranceBounce();
  } else if (betrayal && betrayal.type === 'fake' && rule.fakeDisplay) {
    // Show fake first, then reveal real with animated scratch
    animationController.board.revealText(rule.fakeDisplay.text, '...or is it?');
    setTimeout(() => {
      if (gameData.roundId === rule._roundId) {
        animationController.pencil.playMischievous(1200);
        animationController.board.playRuleRewrite(rule.fakeDisplay.text, rule.text, () => {
          subEl.textContent = 'THAT\'S the real rule!';
          AudioSystem.play('rulechange');
        });
      }
    }, 1500);
  } else if (betrayal && betrayal.type === 'rewrite') {
    // Show the original text, then scratch out and rewrite
    const origRule = gameData.currentRule;
    animationController.board.revealText(origRule.text, randomItem(PENCIL_LINES.levelStart));
    setTimeout(() => {
      if (gameData.roundId === rule._roundId) {
        setPencilSpeech(randomItem(PENCIL_LINES.rewrite));
        animationController.pencil.playRuleChange();
        animationController.board.playRuleRewrite(origRule.text, rule.text, () => {
          subEl.textContent = 'Rules changed!';
          AudioSystem.play('rulechange');
        });
      }
    }, 1500);
  } else if (betrayal && betrayal.type === 'reverse' && rule.reversed) {
    animationController.board.revealText(rule.text, 'REVERSED RULE');
    textEl.classList.add('rewritten');
  } else {
    animationController.board.revealText(rule.text, randomItem(PENCIL_LINES.levelStart));
  }
}

function applyRoundTwist(twists) {
  const area = document.getElementById('play-area');
  const board = document.getElementById('instruction-board');
  if (!area || !board) return;
  area.classList.remove('twist-moving', 'twist-shrink', 'twist-rotation', 'twist-flicker', 'twist-decoy', 'twist-mirror');
  board.classList.remove('twist-ink');
  const active = Array.isArray(twists) ? twists : (twists ? [twists] : []);
  const intensity = Math.max(1, ...active.map(t => Math.min(4, t.tier || 1)));
  area.style.setProperty('--twist-intensity', String(intensity));
  const classes = {
    moving: 'twist-moving',
    shrink: 'twist-shrink',
    rotation: 'twist-rotation',
    flicker: 'twist-flicker',
    decoy: 'twist-decoy',
    mirror: 'twist-mirror'
  };
  active.forEach(twist => {
    if (classes[twist.id]) area.classList.add(classes[twist.id]);
    if (twist.id === 'ink') board.classList.add('twist-ink');
  });
  if (active.some(t => t.id === 'mirror') && gameData.activeRule?.type === 'position') {
    gameData.currentObjects.forEach((obj, idx, arr) => {
      obj.isCorrect = gameData.activeRule.target === 'left' ? idx === arr.length - 1 : idx === 0;
    });
  }
}

function useEraserHint() {
  if (currentState !== GameState.PLAYING || gameData.inputLocked) return;
  if (gameData.hintCharges <= 0) {
    setPencilSpeech('The Eraser is out of ink. Nice try.');
    return;
  }
  gameData.hintCharges--;
  const hintCounter = document.getElementById('eraser-hint-count');
  if (hintCounter) hintCounter.textContent = `HINTS ${gameData.hintCharges}`;
  animationController.eraser.playHint();
  if (gameData.activeRule?.type === 'negative') {
    document.getElementById('instruction-sub').textContent = 'Do not tap. Wait for the round to finish.';
  } else {
    document.querySelectorAll('.game-object').forEach(el => {
      const obj = gameData.currentObjects.find(o => String(o.id) === el.dataset.objectId);
      if (obj?.isCorrect) el.classList.add('hint-pulse');
    });
    setTimeout(() => document.querySelectorAll('.hint-pulse').forEach(el => el.classList.remove('hint-pulse')), 1200);
  }
  setPencilSpeech('Hey! No helping!');
  animationController.pencil.playAngry(1200);
}

function renderObjects(objects) {
  const area = document.getElementById('play-area');
  area.innerHTML = '';

  const elements = [];
  objects.forEach((obj, index) => {
    const el = document.createElement('div');
    el.className = `game-object color-${obj.color} shape-${obj.shape} size-${obj.size}`;
    el.dataset.objectId = obj.id;

    // Add accessibility symbol in high contrast
    const symbol = document.createElement('span');
    symbol.className = 'obj-symbol';
    el.appendChild(symbol);

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleObjectTap(obj);
    });

    area.appendChild(el);
    elements.push(el);
  });

  // Staggered entrance animation
  animationController.shapes.animateEntrance(elements);
}

function setPencilExpression(expr) {
 const faces = document.querySelectorAll('.pencil-face');
 faces.forEach(f => {
 f.className = `pencil-face pencil-${expr === 'angry' ? 'evil' : expr}`;
 });
}

function setPencilSpeech(text) {
 const speech = document.getElementById('pencil-speech');
 if (!speech) return;
 speech.textContent = text;
 speech.classList.add('visible');
 const pencil = document.getElementById('game-pencil');
 if (pencil) {
   pencil.classList.remove('pencil-scribbling', 'pencil-taunting');
   void pencil.offsetWidth;
   pencil.classList.add(/change|new rule|scratch|fix/i.test(text) ? 'pencil-scribbling' : 'pencil-taunting');
 }
 setTimeout(() => speech.classList.remove('visible'), 2500);
}

function setEraserExpression(expr) {
 const mouth = document.querySelector('#eraser-character .eraser-mouth');
 if (!mouth) return;
 mouth.className = 'eraser-mouth ' + expr;
}

function flashScreen(type) {
 const flash = document.createElement('div');
 flash.className = type === 'correct' ? 'flash-correct' : 'flash-wrong';
 document.body.appendChild(flash);
 setTimeout(() => flash.remove(), 350);
}

function animateObject(objectEl, type) {
 if (!objectEl) return;
 objectEl.classList.remove('anim-correct', 'anim-wrong-shake');
 void objectEl.offsetWidth; // force reflow
 objectEl.classList.add(type === 'correct' ? 'anim-correct' : 'anim-wrong-shake');
}

function animateEraser(type) {
 const eraser = document.getElementById('eraser-character');
 if (!eraser) return;
 eraser.classList.remove('eraser-correct', 'eraser-wrong', 'eraser-confused');
 void eraser.offsetWidth;
 if (type === 'correct') {
   eraser.classList.add('eraser-correct');
   setEraserExpression('happy');
   setTimeout(() => eraser.classList.remove('eraser-correct'), 850);
 } else if (type === 'wrong') {
   eraser.classList.add('eraser-wrong');
   setEraserExpression('sad');
   setTimeout(() => {
     eraser.classList.remove('eraser-wrong');
     setEraserExpression('happy');
   }, 650);
 } else if (type === 'confused') {
   eraser.classList.add('eraser-confused');
   setEraserExpression('confused');
   setTimeout(() => {
     eraser.classList.remove('eraser-confused');
     setEraserExpression('happy');
   }, 1500);
 }
}


// ─── TIMER SYSTEM ──────────────────────────────────────────
function startTimer(seconds) {
 if (seconds <= 0) {
 document.getElementById('timer-display').textContent = '';
 return;
 }

 gameData.timeRemaining = seconds;
 const display = document.getElementById('timer-display');
 display.textContent = seconds;
 display.classList.remove('warning');

 clearInterval(gameData.timerInterval);
 gameData.timerInterval = setInterval(() => {
 gameData.timeRemaining--;
 display.textContent = gameData.timeRemaining;

 if (gameData.timeRemaining <= 3) {
 display.classList.add('warning');
 }

 if (gameData.timeRemaining <= 0) {
 clearInterval(gameData.timerInterval);
 // Time up = lose a life
 handleTimeUp();
 }
 }, 1000);
}

function stopTimer() {
 clearInterval(gameData.timerInterval);
 gameData.timerInterval = null;
}

function handleTimeUp() {
 if (gameData.inputLocked) return;
 gameData.inputLocked = true;

 // For negative rules (DON'T TAP), running out of time is actually correct!
 if (gameData.activeRule && gameData.activeRule.type === 'negative') {
 handleCorrectAnswer();
 return;
 }

 gameData.lives--;
 gameData.wrongAnswers++;
 gameData.totalActions++;
 gameData.streak = 0;
 SaveSystem.data.stats.wrongAnswers++;

 renderLives();
 flashScreen('wrong');
 AudioSystem.play('wrong');
 setPencilExpression('evil');
 setPencilSpeech('Too slow!');
 animateEraser('wrong');

 if (gameData.lives <= 0) {
 setTimeout(() => showLevelFailed(), 600);
 } else {
 setTimeout(() => startRound(), 800);
 }
}


// ─── CORE GAME LOOP ────────────────────────────────────────
function startLevel(level) {
 gameData.isEndless = false;
 gameData.currentLevel = level;
 gameData.config = generateLevelConfig(level);
 gameData.activeTwist = gameData.config.twist || null;
 gameData.activeTwists = gameData.activeTwist ? [gameData.activeTwist] : [];
 gameData.doubleTapTarget = null;
 gameData.hintCharges = 2;
 const hintCounter = document.getElementById('eraser-hint-count');
 if (hintCounter) hintCounter.textContent = 'HINTS 2';
 gameData.currentRound = 0;
 gameData.totalRounds = gameData.config.rounds;
 gameData.lives = gameData.config.lives;
 gameData.maxLives = gameData.config.lives;
 gameData.score = 0;
 gameData.streak = 0;
 gameData.correctAnswers = 0;
 gameData.wrongAnswers = 0;
 gameData.totalActions = 0;
 gameData.roundId = 0;
 gameData.inputLocked = false;

 SaveSystem.data.stats.totalAttempts++;
 SaveSystem.save();

 // Apply theme & skins
 const notebook = document.getElementById('gameplay-notebook');
 notebook.className = 'notebook-page gameplay-page';
 if (gameData.config.theme) {
 notebook.classList.add(gameData.config.theme);
 }
 applyCharacterSkins();

 // Update top bar
 document.getElementById('level-indicator').textContent = `LEVEL ${level}`;
 renderLives();
 renderScore();
 renderProgress();

 changeState(GameState.PLAYING);

 // Brief intro delay
 setPencilExpression('happy');
 setPencilSpeech(randomItem(PENCIL_LINES.levelStart));
 setEraserExpression('happy');

 setTimeout(() => startRound(), 600);
}

// ─── ENDLESS MODE ──────────────────────────────────────────
function startEndlessMode() {
 gameData.isEndless = true;
 gameData.currentLevel = 0;
 gameData.currentRound = 0;
 gameData.totalRounds = 999;
 gameData.lives = 3;
 gameData.maxLives = 3;
 gameData.score = 0;
 gameData.streak = 0;
 gameData.correctAnswers = 0;
 gameData.wrongAnswers = 0;
 gameData.totalActions = 0;
 gameData.roundId = 0;
 gameData.inputLocked = false;

 SaveSystem.data.stats.totalAttempts++;
 SaveSystem.save();

 const notebook = document.getElementById('gameplay-notebook');
 notebook.className = 'notebook-page gameplay-page';
 applyCharacterSkins();

 updateEndlessTopBar();
 renderLives();
 renderScore();

 document.getElementById('progress-label').textContent = 'Survival Mode: Round 1';
 document.getElementById('progress-fill').style.width = '100%';

 changeState(GameState.PLAYING);

 setPencilExpression('suspicious');
 setPencilSpeech('Survive as long as you can...');
 setEraserExpression('happy');

 setTimeout(() => startEndlessRound(), 600);
}

function updateEndlessTopBar() {
 document.getElementById('level-indicator').textContent = `SURVIVAL — R${gameData.currentRound + 1}`;
}

function generateEndlessConfig(round) {
 const difficulty = Math.min(1 + Math.floor(round / 4), 5);
 const timeLimit = Math.max(5, 12 - Math.floor(round / 5));
 const availableRules = RULE_DEFS.filter(r => r.difficulty <= difficulty);

 const availableBetrayals = ['none'];
 if (round >= 3) availableBetrayals.push('rewrite');
 if (round >= 7) availableBetrayals.push('hide');
 if (round >= 11) availableBetrayals.push('confuse');
 if (round >= 15) availableBetrayals.push('fake');
 if (round >= 20) availableBetrayals.push('reverse');

 const betrayalChance = Math.min(0.15 + (round * 0.025), 0.65);
 const objectCount = Math.min(3 + Math.floor(round / 6), 6);

 const twist = twistForLevel(round);
 return {
 level: round,
 rounds: 999,
 lives: 3,
 timeLimit,
 availableRules,
 availableBetrayals,
 betrayalChance,
 objectCount,
 theme: '',
 twist,
 twistPool: twist?.pool || []
 };
}

function startEndlessRound() {
 gameData.config = generateEndlessConfig(gameData.currentRound);
 gameData.activeTwist = gameData.config.twist || null;
 gameData.activeTwists = gameData.activeTwist ? [gameData.activeTwist] : [];
 gameData.doubleTapTarget = null;
 gameData.hintCharges = 2;
 const hintCounter = document.getElementById('eraser-hint-count');
 if (hintCounter) hintCounter.textContent = 'HINTS 2';
 updateEndlessTopBar();
 startRound();
}

function startRound() {
 gameData.inputLocked = false;
 gameData.roundId++;
 gameData.doubleTapTarget = null;
 const roundId = gameData.roundId;

 // Clear any negative timer
 if (gameData.negativeTimer) {
 clearTimeout(gameData.negativeTimer);
 gameData.negativeTimer = null;
 }

 // Select a rule
 const rule = randomItem(gameData.config.availableRules);
 gameData.currentRule = { ...rule };

 // Select betrayal
 const betrayal = selectBetrayal(gameData.config);
 gameData.currentBetrayal = betrayal;
 const unlockedTwists = gameData.config.twistPool || [];
 gameData.activeTwists = gameData.config.twist ? [gameData.config.twist] : [];
 const twistProgress = gameData.isEndless ? gameData.currentRound : gameData.currentLevel;
 const extraTwistCount = twistProgress >= 250 ? 2 : (twistProgress >= 100 ? 1 : 0);
 if (extraTwistCount > 0) {
   const olderTwists = shuffle(unlockedTwists.filter(t => t.id !== gameData.config.twist?.id));
   gameData.activeTwists.push(...olderTwists.slice(0, extraTwistCount));
 }
 gameData.activeTwist = gameData.activeTwists[0] || null;

 // Apply betrayal to get active rule
 let activeRule;
 if (betrayal.type !== 'none') {
 activeRule = applyBetrayal(betrayal, rule, gameData.config);
 } else {
 activeRule = { ...rule };
 }
 activeRule._roundId = roundId;
 gameData.activeRule = activeRule;

 // Generate objects for the ACTIVE rule (post-betrayal)
 const objects = generateObjects(activeRule, gameData.config.objectCount);
 gameData.currentObjects = objects;

 // For position rules, sort objects and mark correctness
 if (activeRule.type === 'position') {
 // Objects are already shuffled, first = left, last = right
 objects.forEach((obj, idx) => {
 if (activeRule.target === 'left') {
 obj.isCorrect = idx === 0;
 } else if (activeRule.target === 'right') {
 obj.isCorrect = idx === objects.length - 1;
 }
 });
 }

 // Render
 renderObjects(objects);
 renderInstruction(activeRule, betrayal);
 applyRoundTwist(gameData.activeTwists);
 if (gameData.activeTwists.length) {
   const sub = document.getElementById('instruction-sub');
   if (sub && !['hide', 'confuse', 'fake', 'rewrite', 'reverse'].includes(betrayal.type)) {
     sub.textContent = gameData.activeTwists.map(t => `${t.name}: ${t.hint}`).join('  ');
   }
   setPencilSpeech(`${gameData.activeTwists.map(t => t.name).join(' + ')}? My favourite.`);
   setPencilExpression('evil');
 }
 renderProgress();

 // Pencil expression
 if (betrayal.type !== 'none') {
 setTimeout(() => {
 if (gameData.roundId === roundId) {
 setPencilExpression('suspicious');
 animateEraser('confused');
 }
 }, 400);
 } else {
 setPencilExpression('happy');
 }

 // Start timer
 gameData.roundStartTime = Date.now();
 startTimer(gameData.config.timeLimit);

 // For negative rules, auto-advance after a delay if player correctly doesn't tap
 if (activeRule.type === 'negative') {
 const waitTime = gameData.config.timeLimit > 0
 ? gameData.config.timeLimit * 1000
 : 3000;
 gameData.negativeTimer = setTimeout(() => {
 if (gameData.roundId === roundId && !gameData.inputLocked) {
 handleCorrectAnswer();
 }
 }, waitTime);
 }
}

function handleObjectTap(obj) {
 if (currentState !== GameState.PLAYING) return;
 if (gameData.inputLocked) return;

 if (gameData.activeTwists?.some(t => t.id === 'double') && obj.isCorrect && gameData.doubleTapTarget !== obj.id) {
   gameData.doubleTapTarget = obj.id;
   const armed = document.querySelector(`[data-object-id="${obj.id}"]`);
   armed?.classList.add('double-tap-armed');
   setEraserExpression('focused');
   setPencilSpeech('One tap? That is not enough.');
   const sub = document.getElementById('instruction-sub');
   if (sub) sub.textContent = 'Tap the same target once more.';
   return;
 }
 if (gameData.activeTwists?.some(t => t.id === 'double') && gameData.doubleTapTarget === obj.id) {
   gameData.doubleTapTarget = null;
 }

 gameData.inputLocked = true;
 stopTimer();

 // Clear negative timer
 if (gameData.negativeTimer) {
 clearTimeout(gameData.negativeTimer);
 gameData.negativeTimer = null;
 }

 const rule = gameData.activeRule;

 // For negative rules, ANY tap is wrong
 if (rule.type === 'negative') {
 handleWrongAnswer(obj);
 return;
 }

 // Check if the tapped object is correct
 const isCorrect = obj.isCorrect;
 const objectEl = document.querySelector(`[data-object-id="${obj.id}"]`);

 if (isCorrect) {
   const elapsed = (Date.now() - gameData.roundStartTime) / 1000;
   const speedBonus = Math.max(0, Math.floor((1 - elapsed / 10) * 50));
   const points = calculateScore(speedBonus, gameData.streak + 1);
   animationController.shapes.animateCorrect(objectEl, points, gameData.streak + 1);
   handleCorrectAnswer(points);
 } else {
   animationController.shapes.animateWrong(objectEl);
   handleWrongAnswer(obj);
 }
}

function handleCorrectAnswer(precalculatedPoints) {
  gameData.correctAnswers++;
  gameData.totalActions++;
  gameData.streak++;

  // Speed bonus
  const elapsed = (Date.now() - gameData.roundStartTime) / 1000;
  const speedBonus = Math.max(0, Math.floor((1 - elapsed / 10) * 50));
  const points = precalculatedPoints || calculateScore(speedBonus, gameData.streak);
  gameData.score += points;

  SaveSystem.data.stats.correctAnswers++;
  if (gameData.streak > SaveSystem.data.stats.bestStreak) {
    SaveSystem.data.stats.bestStreak = gameData.streak;
  }

  renderScore();
  flashScreen('correct');
  AudioSystem.play('correct');
  setPencilSpeech(randomItem(PENCIL_LINES.correct));
  animationController.pencil.playAngry(850);
  animationController.eraser.playCorrect();

  gameData.currentRound++;
  renderProgress();

  if (gameData.isEndless) {
    if (gameData.currentRound > SaveSystem.data.stats.endlessMaxRounds) {
      SaveSystem.data.stats.endlessMaxRounds = gameData.currentRound;
    }
    if (gameData.score > SaveSystem.data.stats.endlessHighScore) {
      SaveSystem.data.stats.endlessHighScore = gameData.score;
    }
    SaveSystem.save();
    checkBadges();
    document.getElementById('progress-label').textContent = `Survived: ${gameData.currentRound} Rounds (Best: ${SaveSystem.data.stats.endlessMaxRounds})`;
    setTimeout(() => startEndlessRound(), 600);
    return;
  }

  if (gameData.currentRound >= gameData.totalRounds) {
    setTimeout(() => showLevelComplete(), 700);
  } else {
    setTimeout(() => startRound(), 700);
  }
}

function handleWrongAnswer(obj) {
  gameData.wrongAnswers++;
  gameData.totalActions++;
  gameData.streak = 0;
  gameData.lives--;

  SaveSystem.data.stats.wrongAnswers++;

  renderLives();
  animationController.ui.animateHeartLoss(document.getElementById('lives-display'), gameData.lives);
  flashScreen('wrong');
  AudioSystem.play('wrong');
  setPencilSpeech(randomItem(PENCIL_LINES.wrong));
  animationController.pencil.playLaughing(1200);
  animationController.eraser.playWrong();

  if (obj) {
    const objectEl = document.querySelector(`[data-object-id="${obj.id}"]`);
    animationController.shapes.animateWrong(objectEl);
  }

  if (gameData.lives <= 0) {
    setTimeout(() => showLevelFailed(), 700);
  } else {
    if (gameData.isEndless) {
      setTimeout(() => startEndlessRound(), 800);
    } else {
      setTimeout(() => startRound(), 800);
    }
  }
}


// ─── LEVEL COMPLETION ──────────────────────────────────────
function showLevelComplete() {
  stopTimer();
  AudioSystem.play('levelup');

  const accuracy = gameData.totalActions > 0
    ? gameData.correctAnswers / gameData.totalActions
    : 0;
  const stars = calculateStars(accuracy, gameData.lives, gameData.maxLives);
  const coins = calculateCoins(stars);

  // Save
  SaveSystem.completeLevel(gameData.currentLevel, stars, gameData.score, Math.round(accuracy * 100));
  SaveSystem.unlockLevel(gameData.currentLevel + 1);
  SaveSystem.addCoins(coins);
  SaveSystem.data.stats.totalWins++;
  if (gameData.score > SaveSystem.data.stats.highestScore) {
    SaveSystem.data.stats.highestScore = gameData.score;
  }
  SaveSystem.save();
  checkBadges();

  // Render results
  document.getElementById('result-score').textContent = `${gameData.score}`;
  document.getElementById('result-accuracy').textContent = Math.round(accuracy * 100) + '%';
  document.getElementById('result-coins').textContent = `${coins} coins`;

  // Stars animation
  const starsEl = document.getElementById('stars-earned');
  const starSpans = starsEl.querySelectorAll('.star-big');
  starSpans.forEach((s, i) => {
    s.className = 'star-big';
    s.textContent = '☆';
    if (i < stars) {
      setTimeout(() => {
        s.textContent = '★';
        s.classList.add('earned');
        AudioSystem.play('coin');
      }, 300 + i * 400);
    }
  });

  animationController.transitions.playLevelComplete({
    stars,
    score: gameData.score,
    coins
  });

  changeState(GameState.LEVEL_COMPLETE);
}

function showLevelFailed() {
  stopTimer();
  AudioSystem.play('fail');

  SaveSystem.data.stats.totalFails++;
  SaveSystem.save();

  if (gameData.isEndless) {
    if (gameData.score > SaveSystem.data.stats.endlessHighScore) {
      SaveSystem.data.stats.endlessHighScore = gameData.score;
    }
    if (gameData.currentRound > SaveSystem.data.stats.endlessMaxRounds) {
      SaveSystem.data.stats.endlessMaxRounds = gameData.currentRound;
    }
    const earnedCoins = Math.floor(gameData.currentRound * 3);
    SaveSystem.addCoins(earnedCoins);
    SaveSystem.save();
    checkBadges();

    document.getElementById('fail-score').textContent = `${gameData.score}`;
    document.getElementById('fail-rounds').textContent = `${gameData.currentRound} Rounds (+ ${earnedCoins})`;
    document.getElementById('pencil-taunt').textContent = `Endless Run Over! You survived ${gameData.currentRound} rounds.`;
    animationController.transitions.playLevelFailed();
    changeState(GameState.LEVEL_FAILED);
    return;
  }

  document.getElementById('fail-score').textContent = `${gameData.score}`;
  document.getElementById('fail-rounds').textContent = `${gameData.currentRound} / ${gameData.totalRounds}`;

  // Random taunt without emojis
  const taunts = [
    '"I literally told you what to do."',
    '"Reading is fundamental."',
    '"Better luck next time!"',
    '"The rules were right there!"',
    '"Did you even try?"',
    '"My grandmother plays better."',
  ];
  document.getElementById('pencil-taunt').textContent = randomItem(taunts);

  animationController.transitions.playLevelFailed();
  changeState(GameState.LEVEL_FAILED);
}


// ─── SETTINGS ──────────────────────────────────────────────
function applySettings() {
 const s = SaveSystem.data.settings;
 AudioSystem.setEnabled(s.sound);
 AudioSystem.setMusicEnabled(s.music);

 document.getElementById('setting-sound').checked = s.sound;
 document.getElementById('setting-music').checked = s.music;
 document.getElementById('setting-vibration').checked = s.vibration;
 document.getElementById('setting-contrast').checked = s.highContrast;
 document.getElementById('setting-reduce-motion').checked = s.reduceMotion;

 document.body.classList.toggle('high-contrast', s.highContrast);
 document.body.classList.toggle('reduce-motion', s.reduceMotion);
}


// ─── EVENT BINDINGS ────────────────────────────────────────
function addTap(element, handler) {
 if (!element) return;
 let lastTime = 0;
 const trigger = (e) => {
 const now = Date.now();
 if (now - lastTime < 250) return;
 lastTime = now;
 handler(e);
 };
 element.addEventListener('pointerdown', (e) => {
 e.preventDefault();
 trigger(e);
 });
 element.addEventListener('click', (e) => {
 trigger(e);
 });
}

function bindEvents() {
  const eraserBuddy = document.getElementById('eraser-character');
  if (eraserBuddy) {
    eraserBuddy.setAttribute('role', 'button');
    eraserBuddy.setAttribute('aria-label', 'Eraser hint: reveal a safe target');
    eraserBuddy.setAttribute('tabindex', '0');
  }

 // ── Home buttons ──
 addTap(document.getElementById('btn-play'), () => {
 AudioSystem.play('click');
 startLevel(SaveSystem.data.unlockedLevel);
 });

 addTap(document.getElementById('btn-levels'), () => {
 AudioSystem.play('paper');
 renderLevelSelect();
 changeState(GameState.LEVEL_SELECT);
 });

 addTap(document.getElementById('btn-endless'), () => {
 AudioSystem.play('click');
 startEndlessMode();
 });

 addTap(document.getElementById('btn-collection'), () => {
 AudioSystem.play('paper');
 changeState(GameState.COLLECTION);
 renderCollectionScreen('badges');
 });

 addTap(document.getElementById('btn-settings'), () => {
 AudioSystem.play('click');
 applySettings();
 changeState(GameState.SETTINGS);
 });

 // ── Level select ──
 addTap(document.getElementById('btn-back-levels'), () => {
 AudioSystem.play('paper');
 renderHomeStats();
 changeState(GameState.HOME);
 });

 // ── Collection screen ──
 addTap(document.getElementById('btn-back-collection'), () => {
 AudioSystem.play('paper');
 renderHomeStats();
 changeState(GameState.HOME);
 });

 const tabBadges = document.getElementById('tab-btn-badges');
 const tabSkins = document.getElementById('tab-btn-skins');
 const tabStats = document.getElementById('tab-btn-stats');
 if (tabBadges) addTap(tabBadges, () => { AudioSystem.play('click'); renderCollectionScreen('badges'); });
 if (tabSkins) addTap(tabSkins, () => { AudioSystem.play('click'); renderCollectionScreen('skins'); });
 if (tabStats) addTap(tabStats, () => { AudioSystem.play('click'); renderCollectionScreen('stats'); });

 // ── Settings ──
 addTap(document.getElementById('btn-back-settings'), () => {
 AudioSystem.play('click');
 renderHomeStats();
 changeState(GameState.HOME);
 });

 ['sound', 'music', 'vibration', 'contrast', 'reduce-motion'].forEach(key => {
 const settingKey = key === 'contrast' ? 'highContrast' :
 key === 'reduce-motion' ? 'reduceMotion' : key;
 document.getElementById(`setting-${key}`).addEventListener('change', (e) => {
 SaveSystem.data.settings[settingKey] = e.target.checked;
 SaveSystem.save();
 applySettings();
 });
 });

 addTap(document.getElementById('btn-reset-progress'), () => {
 if (confirm('Reset ALL progress, coins, and skins? This cannot be undone!')) {
 SaveSystem.reset();
 applySettings();
 applyCharacterSkins();
 renderHomeStats();
 changeState(GameState.HOME);
 }
 });

 // ── Character Fun Taps ──
 const eraserEl = document.getElementById('eraser-character');
 if (eraserEl) {
   addTap(eraserEl, () => {
     AudioSystem.play('eraser_rub');
     animationController.eraser.playCorrect();
   });
 }

 const homePencil = document.getElementById('home-pencil');
 if (homePencil) {
   addTap(homePencil, () => {
     AudioSystem.play('write');
     homePencil.classList.remove('pencil-tease');
     void homePencil.offsetWidth;
     homePencil.classList.add('pencil-tease');
   });
 }

 const homeEraser = document.getElementById('home-eraser');
 if (homeEraser) {
   addTap(homeEraser, () => {
     AudioSystem.play('eraser_rub');
     homeEraser.classList.remove('eraser-enter');
     void homeEraser.offsetWidth;
     homeEraser.classList.add('eraser-enter');
   });
 }

 // ── Gameplay ──
 addTap(document.getElementById('btn-pause'), () => {
   if (currentState !== GameState.PLAYING) return;
   AudioSystem.play('click');
   stopTimer();
   animationController.pause();
   changeState(GameState.PAUSED);
 });

 // ── Pause ──
 addTap(document.getElementById('btn-resume'), () => {
   AudioSystem.play('click');
   animationController.resume();
   changeState(GameState.PLAYING);
   if (gameData.config.timeLimit > 0 && gameData.timeRemaining > 0) {
     startTimer(gameData.timeRemaining);
   }
 });
 addTap(document.getElementById('btn-restart-pause'), () => {
 AudioSystem.play('click');
 if (gameData.isEndless) {
 startEndlessMode();
 } else {
 startLevel(gameData.currentLevel);
 }
 });
 addTap(document.getElementById('btn-home-pause'), () => {
 AudioSystem.play('paper');
 stopTimer();
 renderHomeStats();
 changeState(GameState.HOME);
 });

 // ── Level Complete ──
 addTap(document.getElementById('btn-next-level'), () => {
 AudioSystem.play('click');
 const next = gameData.currentLevel + 1;
 startLevel(next);
 });
 addTap(document.getElementById('btn-replay-win'), () => {
 AudioSystem.play('click');
 startLevel(gameData.currentLevel);
 });
 addTap(document.getElementById('btn-home-win'), () => {
 AudioSystem.play('paper');
 renderHomeStats();
 changeState(GameState.HOME);
 });

 // ── Level Failed ──
 addTap(document.getElementById('btn-retry'), () => {
 AudioSystem.play('click');
 if (gameData.isEndless) {
 startEndlessMode();
 } else {
 startLevel(gameData.currentLevel);
 }
 });
 addTap(document.getElementById('btn-home-fail'), () => {
 AudioSystem.play('paper');
 renderHomeStats();
 changeState(GameState.HOME);
 });

 // ── Keyboard shortcuts (debug/testing) ──
 document.addEventListener('keydown', (e) => {
 if (currentState !== GameState.PLAYING) return;
 if (gameData.inputLocked) return;

 const idx = parseInt(e.key) - 1;
 if (idx >= 0 && idx < gameData.currentObjects.length) {
 handleObjectTap(gameData.currentObjects[idx]);
 }
 if (e.key === 'Escape') {
 stopTimer();
 animationController.pause();
 changeState(GameState.PAUSED);
 }
 });
}


// ─── SPLASH SCREEN ─────────────────────────────────────────
function runSplash() {
 const fill = document.getElementById('loading-fill');
 let progress = 0;
 const interval = setInterval(() => {
 progress += Math.random() * 15 + 5;
 if (progress >= 100) {
 progress = 100;
 fill.style.width = '100%';
 clearInterval(interval);
 setTimeout(() => {
 renderHomeStats();
 applySettings();
 applyCharacterSkins();
 checkBadges();
 changeState(GameState.HOME);
 }, 400);
 } else {
 fill.style.width = progress + '%';
 }
 }, 150);
}


// ─── INIT ──────────────────────────────────────────────────
function init() {
 bindEvents();
 applyCharacterSkins();
 animationController.init();
 runSplash();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
} else {
 init();
}
