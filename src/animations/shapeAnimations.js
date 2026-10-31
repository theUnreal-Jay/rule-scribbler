// ═══════════════════════════════════════════════════════════
// SHAPE ANIMATION SYSTEM
// Spawning, physics-based idles, interactive feedbacks, and twist kinematics
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';
import { particleSystem } from './particleSystem.js';

export class ShapeAnimationSystem {
  constructor() {
    this.container = null;
    this.activeShapes = [];
  }

  init(container) {
    this.container = container;
  }

  // ── Spawn Animation: staggered spring bounce onto notebook paper ──
  animateEntrance(shapeElements, onComplete) {
    if (!shapeElements || shapeElements.length === 0) return;
    const isReduced = AnimationConfig.isReducedMotion();

    shapeElements.forEach((el, index) => {
      // Remove any leftover animation classes
      el.classList.remove('anim-pop', 'shape-idle', 'anim-correct', 'anim-wrong-shake');

      if (isReduced) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        return;
      }

      // Initial state
      el.style.opacity = '0';
      el.style.transform = 'scale(0.2) translateY(24px) rotate(' + ((index % 2 === 0 ? 1 : -1) * 12) + 'deg)';

      const delay = index * AnimationConfig.timing.shapeStaggerDelay;
      setTimeout(() => {
        el.style.transition = `all ${AnimationConfig.timing.shapeEntranceDuration}ms ${AnimationConfig.easings.spring}`;
        el.style.opacity = '1';
        el.style.transform = 'scale(1) translateY(0) rotate(0deg)';

        // Emit subtle paper dust puff on landing
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          const cRect = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
          particleSystem.emitEraserDust(
            rect.left - cRect.left + rect.width / 2,
            rect.bottom - cRect.top - 4,
            3
          );

          // Apply organic idle floating with randomized phase offsets
          this.attachOrganicIdle(el, index);
        }, AnimationConfig.timing.shapeEntranceDuration - 100);
      }, delay);
    });

    const totalDuration = (shapeElements.length * AnimationConfig.timing.shapeStaggerDelay) + AnimationConfig.timing.shapeEntranceDuration;
    if (onComplete) {
      setTimeout(onComplete, totalDuration);
    }
  }

  // ── Organic Idle: subtle floating and micro-bobbing ──
  attachOrganicIdle(el, index) {
    if (AnimationConfig.isReducedMotion()) return;
    el.style.transition = 'none';
    el.classList.add('shape-idle');
    // Vary animation duration and delay slightly so shapes don't breathe in sync
    const duration = 2.6 + (index % 3) * 0.5;
    const delay = (index * 0.35) % 1.5;
    el.style.animation = `shapeFloat ${duration}s ease-in-out ${delay}s infinite alternate`;
  }

  // ── Correct Selection: explosive scale, particle burst, score popup ──
  animateCorrect(element, scoreEarned = 100, streak = 1) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const cRect = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    const x = rect.left - cRect.left + rect.width / 2;
    const y = rect.top - cRect.top + rect.height / 2;

    element.style.animation = 'none';
    element.classList.remove('shape-idle');
    element.classList.add('anim-correct');

    // Emit celebration confetti & stars
    particleSystem.emitCelebration(x, y, 18);

    // Floating score popup (+100, STREAK x2!)
    let popupText = `+${scoreEarned}`;
    if (streak > 1) popupText += ` (x${streak}!)`;
    particleSystem.emitTextPopup(x, y - 10, popupText, '#5a9e6f');
  }

  // ── Incorrect Selection: aggressive cartoon wobble, red ink splash ──
  animateWrong(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const cRect = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    const x = rect.left - cRect.left + rect.width / 2;
    const y = rect.top - cRect.top + rect.height / 2;

    element.style.animation = 'none';
    element.classList.remove('shape-idle');
    element.classList.add('anim-wrong-shake');

    // Emit ink splatter
    particleSystem.emitInkSplatter(x, y, '#c0574f', 12);
  }
}

export const shapeAnimationSystem = new ShapeAnimationSystem();
