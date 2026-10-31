// ═══════════════════════════════════════════════════════════
// UI MICRO-ANIMATIONS
// Number counters, animated hearts with crack SVG, button squashes & juice
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';
import { particleSystem } from './particleSystem.js';

export class UIMicroAnimations {
  // ── Smooth Number Ticker (for score, coins, stats) ──
  animateCounter(element, startVal, endVal, duration = 600, suffix = '') {
    if (!element) return;
    if (AnimationConfig.isReducedMotion() || startVal === endVal) {
      element.textContent = `${endVal}${suffix}`;
      return;
    }

    const startTime = performance.now();
    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      element.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `${endVal}${suffix}`;
        // Slight bounce pop on completion
        element.classList.add('counter-settle');
        setTimeout(() => element.classList.remove('counter-settle'), 250);
      }
    };
    requestAnimationFrame(update);
  }

  // ── Render Expressive SVG Hearts with Cracking & Heartbeat ──
  renderHearts(container, currentLives, maxLives = 3) {
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < maxLives; i++) {
      const isFull = i < currentLives;
      const isLastRemaining = currentLives === 1 && i === 0;

      const heartWrapper = document.createElement('div');
      heartWrapper.className = `heart-wrapper ${isFull ? 'full' : 'empty'} ${isLastRemaining ? 'low-life-pulse' : ''}`;
      heartWrapper.innerHTML = `
        <svg viewBox="0 0 24 24" class="heart-svg" aria-hidden="true">
          <path class="heart-fill" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          <path class="heart-crack" d="M12 4 L10 9 L14 13 L11 17 L12 20" fill="none" stroke="#2c2c2c" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      `;
      container.appendChild(heartWrapper);
    }
  }

  // ── Animate Heart Loss (crack and shatter) ──
  animateHeartLoss(container, lostIndex) {
    if (!container) return;
    const hearts = container.querySelectorAll('.heart-wrapper');
    if (lostIndex >= 0 && lostIndex < hearts.length) {
      const heart = hearts[lostIndex];
      heart.classList.add('cracking');

      // Emit heart sparks
      const rect = heart.getBoundingClientRect();
      const cRect = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
      particleSystem.emitInkSplatter(
        rect.left - cRect.left + rect.width / 2,
        rect.top - cRect.top + rect.height / 2,
        '#e74c5e',
        8
      );

      setTimeout(() => {
        heart.classList.remove('cracking', 'full');
        heart.classList.add('empty');
      }, 350);
    }
  }

  // ── Locked Level Jiggle ──
  jiggleLocked(element) {
    if (!element) return;
    element.classList.remove('anim-locked-shake');
    void element.offsetWidth;
    element.classList.add('anim-locked-shake');
    setTimeout(() => element.classList.remove('anim-locked-shake'), 400);
  }

  // ── Button Click Press Squish ──
  attachButtonJuice(container = document) {
    const buttons = container.querySelectorAll('.btn, .btn-back, .btn-pause');
    buttons.forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        btn.classList.add('btn-pressed');
      });
      const release = () => btn.classList.remove('btn-pressed');
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    });
  }
}

export const uiMicroAnimations = new UIMicroAnimations();
