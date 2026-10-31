// ═══════════════════════════════════════════════════════════
// CHARACTER ANIMATIONS CONTROLLER
// Expressive State Machines for Pencil (Antagonist) & Eraser (Companion)
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';
import { particleSystem } from './particleSystem.js';

export class PencilController {
  constructor() {
    this.element = null;
    this.faceEl = null;
    this.eyes = [];
    this.mouth = null;
    this.stressContainer = null;
    this.arms = [];
    this.state = 'idle'; // 'idle', 'writing', 'mischievous', 'ruleChange', 'laughing', 'angry', 'victory', 'defeat'
    this.timers = new Set();
    this.isPaused = false;
    this.tapInterval = null;
    this.blinkInterval = null;
    this.glanceInterval = null;
  }

  mount(pencilElement) {
    this.element = pencilElement;
    if (!this.element) return;

    this.faceEl = this.element.querySelector('.pencil-face');
    this.eyes = Array.from(this.element.querySelectorAll('.pencil-eye'));
    this.mouth = this.element.querySelector('.pencil-mouth');

    // Create stress marks container if not present
    if (!this.element.querySelector('.pencil-stress-marks')) {
      const stress = document.createElement('div');
      stress.className = 'pencil-stress-marks';
      stress.innerHTML = `
        <svg viewBox="0 0 24 24" class="stress-icon left" aria-hidden="true">
          <path d="M4 10 L10 4 M4 4 L10 10 M7 2 L7 12" stroke="#d32f2f" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <svg viewBox="0 0 24 24" class="stress-icon right" aria-hidden="true">
          <path d="M4 10 L10 4 M4 4 L10 10 M7 2 L7 12" stroke="#d32f2f" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
      this.element.appendChild(stress);
    }
    this.stressContainer = this.element.querySelector('.pencil-stress-marks');

    this.startIdleLoops();
  }

  unmount() {
    this.clearAllTimers();
    this.element = null;
    this.faceEl = null;
  }

  addTimer(callback, delay) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      if (!this.isPaused) callback();
    }, delay);
    this.timers.add(id);
    return id;
  }

  clearAllTimers() {
    for (const id of this.timers) {
      clearTimeout(id);
    }
    this.timers.clear();
    if (this.tapInterval) clearTimeout(this.tapInterval);
    if (this.blinkInterval) clearTimeout(this.blinkInterval);
    if (this.glanceInterval) clearTimeout(this.glanceInterval);
  }

  pause() {
    this.isPaused = true;
    if (this.element) this.element.classList.add('char-paused');
  }

  resume() {
    this.isPaused = false;
    if (this.element) this.element.classList.remove('char-paused');
  }

  // ── Idle behavior (floating, natural blinking, eye glances, tip tapping) ──
  startIdleLoops() {
    this.scheduleNextBlink();
    this.scheduleNextTap();
    this.scheduleNextGlance();
  }

  scheduleNextBlink() {
    const delay = AnimationConfig.timing.pencilBlinkMin +
      Math.random() * (AnimationConfig.timing.pencilBlinkMax - AnimationConfig.timing.pencilBlinkMin);
    this.blinkInterval = setTimeout(() => {
      if (this.state === 'idle' && !this.isPaused) {
        this.performBlink();
      }
      this.scheduleNextBlink();
    }, delay);
  }

  performBlink() {
    if (!this.faceEl) return;
    this.faceEl.classList.add('blinking');
    setTimeout(() => {
      if (this.faceEl) this.faceEl.classList.remove('blinking');
      // Occasional double-blink
      if (Math.random() < 0.25) {
        setTimeout(() => {
          if (this.faceEl) {
            this.faceEl.classList.add('blinking');
            setTimeout(() => this.faceEl?.classList.remove('blinking'), 120);
          }
        }, 180);
      }
    }, 140);
  }

  scheduleNextGlance() {
    const delay = AnimationConfig.timing.pencilGlanceInterval + (Math.random() - 0.5) * 2000;
    this.glanceInterval = setTimeout(() => {
      if (this.state === 'idle' && !this.isPaused) {
        this.glanceAtPlayer();
      }
      this.scheduleNextGlance();
    }, delay);
  }

  glanceAtPlayer() {
    if (!this.faceEl) return;
    this.faceEl.classList.add('glance-player');
    setTimeout(() => {
      if (this.faceEl) this.faceEl.classList.remove('glance-player');
    }, 1200);
  }

  scheduleNextTap() {
    const delay = AnimationConfig.timing.pencilTapIntervalMin +
      Math.random() * (AnimationConfig.timing.pencilTapIntervalMax - AnimationConfig.timing.pencilTapIntervalMin);
    this.tapInterval = setTimeout(() => {
      if (this.state === 'idle' && !this.isPaused) {
        this.tapTipOnPaper();
      }
      this.scheduleNextTap();
    }, delay);
  }

  tapTipOnPaper() {
    if (!this.element || this.state !== 'idle') return;
    this.element.classList.add('pencil-tapping');

    // Emit graphite flakes at tip position
    const rect = this.element.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    const tipX = rect.left - container.left + rect.width / 2;
    const tipY = rect.bottom - container.top;

    setTimeout(() => {
      particleSystem.emitPencilGraphite(tipX, tipY, 4);
    }, 250);

    setTimeout(() => {
      if (this.element) this.element.classList.remove('pencil-tapping');
    }, 600);
  }

  // ── State Changes ──
  resetClasses() {
    if (!this.element) return;
    this.element.classList.remove(
      'state-idle', 'state-writing', 'state-mischievous',
      'state-rule-change', 'state-laughing', 'state-angry',
      'state-victory', 'state-defeat', 'pencil-scribbling',
      'pencil-taunting', 'pencil-hit', 'pencil-celebrate'
    );
    if (this.stressContainer) this.stressContainer.classList.remove('visible');
  }

  toIdle() {
    this.state = 'idle';
    this.resetClasses();
    this.element?.classList.add('state-idle');
    this.setExpression('happy');
  }

  // Writing animation across the board
  playWriting(duration = 1000, onComplete) {
    this.state = 'writing';
    this.resetClasses();
    this.element?.classList.add('state-writing');
    this.setExpression('focused');

    // Emit graphite specks as it writes
    const rect = this.element?.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    if (rect) {
      const tipX = rect.left - container.left + rect.width / 2;
      const tipY = rect.bottom - container.top - 10;
      particleSystem.emitPencilGraphite(tipX, tipY, 8);
    }

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, duration);
  }

  // Mischievous smirk and lean before activating traps
  playMischievous(duration = 1200, onComplete) {
    this.state = 'mischievous';
    this.resetClasses();
    this.element?.classList.add('state-mischievous');
    this.setExpression('evil');

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, duration);
  }

  // Rule change jump onto instruction board
  playRuleChange(onComplete) {
    this.state = 'ruleChange';
    this.resetClasses();
    this.element?.classList.add('state-rule-change');
    this.setExpression('evil');

    // Emit red scribble graphite
    const board = document.getElementById('instruction-board');
    if (board) {
      const bRect = board.getBoundingClientRect();
      const cRect = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
      const midX = bRect.left - cRect.left + bRect.width / 2;
      const midY = bRect.top - cRect.top + bRect.height / 2;
      setTimeout(() => {
        particleSystem.emitPencilGraphite(midX, midY, 10);
      }, 350);
    }

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, 1400);
  }

  // Laughing / Taunting when player makes a mistake
  playLaughing(duration = 1300, onComplete) {
    this.state = 'laughing';
    this.resetClasses();
    this.element?.classList.add('state-laughing');
    this.setExpression('evil');

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, duration);
  }

  // Angry when player outsmarts trap or uses eraser hint
  playAngry(duration = 1200, onComplete) {
    this.state = 'angry';
    this.resetClasses();
    this.element?.classList.add('state-angry');
    this.setExpression('angry');
    if (this.stressContainer) this.stressContainer.classList.add('visible');

    // Thump the paper
    const rect = this.element?.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    if (rect) {
      particleSystem.emitPencilGraphite(rect.left - container.left + rect.width / 2, rect.bottom - container.top, 6);
    }

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, duration);
  }

  // Defeat / Shock when player completes level
  playDefeat(duration = 2000) {
    this.state = 'defeat';
    this.resetClasses();
    this.element?.classList.add('state-defeat');
    this.setExpression('shocked');
  }

  // Victory / Reluctant Clap when player wins
  playVictory(duration = 2000) {
    this.state = 'victory';
    this.resetClasses();
    this.element?.classList.add('state-victory');
    this.setExpression('suspicious');
  }

  setExpression(expr) {
    if (!this.faceEl) return;
    this.faceEl.className = 'pencil-face pencil-' + expr;
  }
}

export class EraserController {
  constructor() {
    this.element = null;
    this.faceEl = null;
    this.eyes = [];
    this.mouth = null;
    this.sweatEl = null;
    this.state = 'idle'; // 'idle', 'correct', 'wrong', 'lowLife', 'hint', 'victory', 'defeat'
    this.timers = new Set();
    this.isPaused = false;
    this.blinkInterval = null;
    this.hopInterval = null;
    this.isLowLifeActive = false;
  }

  mount(eraserElement) {
    this.element = eraserElement;
    if (!this.element) return;

    this.faceEl = this.element.querySelector('.eraser-face');
    this.eyes = Array.from(this.element.querySelectorAll('.eraser-eye'));
    this.mouth = this.element.querySelector('.eraser-mouth');

    // Add cute blush cheeks and sweat drop if not present
    if (!this.element.querySelector('.eraser-sweat')) {
      const sweat = document.createElement('div');
      sweat.className = 'eraser-sweat';
      sweat.innerHTML = `
        <svg viewBox="0 0 16 16" width="12" height="12">
          <path d="M8 1 C8 1 3 8 3 11 C3 13.8 5.2 16 8 16 C10.8 16 13 13.8 13 11 C13 8 8 1 8 1 Z" fill="#64b5f6"/>
        </svg>
      `;
      this.element.appendChild(sweat);
    }
    this.sweatEl = this.element.querySelector('.eraser-sweat');

    this.startIdleLoops();
  }

  unmount() {
    this.clearAllTimers();
    this.element = null;
    this.faceEl = null;
  }

  addTimer(callback, delay) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      if (!this.isPaused) callback();
    }, delay);
    this.timers.add(id);
    return id;
  }

  clearAllTimers() {
    for (const id of this.timers) {
      clearTimeout(id);
    }
    this.timers.clear();
    if (this.blinkInterval) clearTimeout(this.blinkInterval);
    if (this.hopInterval) clearTimeout(this.hopInterval);
  }

  pause() {
    this.isPaused = true;
    if (this.element) this.element.classList.add('char-paused');
  }

  resume() {
    this.isPaused = false;
    if (this.element) this.element.classList.remove('char-paused');
  }

  startIdleLoops() {
    this.scheduleNextBlink();
    this.scheduleNextHop();
  }

  scheduleNextBlink() {
    const delay = AnimationConfig.timing.eraserBlinkIntervalMin +
      Math.random() * (AnimationConfig.timing.eraserBlinkIntervalMax - AnimationConfig.timing.eraserBlinkIntervalMin);
    this.blinkInterval = setTimeout(() => {
      if ((this.state === 'idle' || this.state === 'lowLife') && !this.isPaused) {
        this.performBlink();
      }
      this.scheduleNextBlink();
    }, delay);
  }

  performBlink() {
    if (!this.faceEl) return;
    this.faceEl.classList.add('blinking');
    setTimeout(() => {
      if (this.faceEl) this.faceEl.classList.remove('blinking');
    }, 130);
  }

  scheduleNextHop() {
    this.hopInterval = setTimeout(() => {
      if (this.state === 'idle' && !this.isPaused && !this.isLowLifeActive) {
        this.performGentleHop();
      }
      this.scheduleNextHop();
    }, AnimationConfig.timing.eraserHopInterval);
  }

  performGentleHop() {
    if (!this.element || this.state !== 'idle') return;
    this.element.classList.add('eraser-gentle-hop');

    // Emit tiny dust puffs on landing
    const rect = this.element.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    const dustX = rect.left - container.left + rect.width / 2;
    const dustY = rect.bottom - container.top;

    setTimeout(() => {
      particleSystem.emitEraserDust(dustX, dustY, 3);
    }, 280);

    setTimeout(() => {
      if (this.element) this.element.classList.remove('eraser-gentle-hop');
    }, 550);
  }

  resetClasses() {
    if (!this.element) return;
    this.element.classList.remove(
      'state-idle', 'state-correct', 'state-wrong',
      'state-low-life', 'state-hint', 'state-victory',
      'state-defeat', 'eraser-correct', 'eraser-wrong',
      'eraser-confused', 'eraser-use-hint'
    );
    if (this.sweatEl) this.sweatEl.classList.remove('visible');
  }

  toIdle() {
    if (this.isLowLifeActive) {
      this.setLowLife(true);
      return;
    }
    this.state = 'idle';
    this.resetClasses();
    this.element?.classList.add('state-idle');
    this.setExpression('happy');
  }

  // Correct answer reaction: spring upward, squash on landing, happy dust!
  playCorrect(onComplete) {
    this.state = 'correct';
    this.resetClasses();
    this.element?.classList.add('state-correct');
    this.setExpression('happy');

    // Emit cheerful dust
    const rect = this.element?.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    if (rect) {
      const x = rect.left - container.left + rect.width / 2;
      const y = rect.bottom - container.top;
      setTimeout(() => particleSystem.emitEraserDust(x, y, 9), 200);
    }

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, 750);
  }

  // Wrong answer reaction: shudder, wide shocked eyes, sweat drop
  playWrong(onComplete) {
    this.state = 'wrong';
    this.resetClasses();
    this.element?.classList.add('state-wrong');
    this.setExpression('sad');
    if (this.sweatEl) this.sweatEl.classList.add('visible');

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, 700);
  }

  // Low life (1 heart remaining): nervous tremor, eyes darting to heart
  setLowLife(active) {
    this.isLowLifeActive = active;
    if (active && (this.state === 'idle' || this.state === 'lowLife')) {
      this.state = 'lowLife';
      this.resetClasses();
      this.element?.classList.add('state-low-life');
      this.setExpression('focused');
      if (this.sweatEl) this.sweatEl.classList.add('visible');
    } else if (!active && this.state === 'lowLife') {
      this.toIdle();
    }
  }

  // Hint animation: points toward target, sparkles appear
  playHint(onComplete) {
    this.state = 'hint';
    this.resetClasses();
    this.element?.classList.add('state-hint');
    this.setExpression('focused');

    const rect = this.element?.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    if (rect) {
      particleSystem.emitEraserDust(rect.left - container.left + rect.width / 2, rect.top - container.top, 5);
    }

    this.addTimer(() => {
      this.toIdle();
      if (onComplete) onComplete();
    }, 1100);
  }

  // Level victory: 360 spin, confetti & happy bounce
  playVictory() {
    this.state = 'victory';
    this.resetClasses();
    this.element?.classList.add('state-victory');
    this.setExpression('happy');

    const rect = this.element?.getBoundingClientRect();
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    if (rect) {
      const x = rect.left - container.left + rect.width / 2;
      const y = rect.top - container.top;
      particleSystem.emitCelebration(x, y, 25);
    }
  }

  // Level defeat: slow slump forward, closed dejected eyes
  playDefeat() {
    this.state = 'defeat';
    this.resetClasses();
    this.element?.classList.add('state-defeat');
    this.setExpression('sad');
  }

  setExpression(expr) {
    if (!this.mouth) return;
    this.mouth.className = 'eraser-mouth ' + expr;
  }
}

export const pencilController = new PencilController();
export const eraserController = new EraserController();
