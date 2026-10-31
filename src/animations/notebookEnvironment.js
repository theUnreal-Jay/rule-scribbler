// ═══════════════════════════════════════════════════════════
// NOTEBOOK ENVIRONMENT ANIMATIONS
// Page flips, animated margin doodles, living paper depth & scratch effects
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';

export class NotebookEnvironment {
  constructor() {
    this.container = null;
    this.doodleTimer = null;
    this.doodleIndex = 0;
  }

  mount(container) {
    this.container = container;
    this.createMarginDoodleContainer();
    this.startDoodleSpawning();
  }

  createMarginDoodleContainer() {
    if (!this.container) return;
    let marginEl = this.container.querySelector('#notebook-margin-doodles');
    if (!marginEl) {
      marginEl = document.createElement('div');
      marginEl.id = 'notebook-margin-doodles';
      marginEl.className = 'margin-doodles-layer';
      marginEl.setAttribute('aria-hidden', 'true');
      this.container.appendChild(marginEl);
    }
  }

  // Hand-drawn SVG doodles that appear in margins during gameplay
  startDoodleSpawning() {
    if (AnimationConfig.isReducedMotion()) return;
    const doodleSVGs = [
      // 1. Doodle Star
      `<svg viewBox="0 0 32 32" class="margin-doodle doodle-star">
        <path d="M16 3 L19 12 L28 12 L21 18 L24 28 L16 22 L8 28 L11 18 L4 12 L13 12 Z" fill="none" stroke="#6b5b48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      // 2. Doodle Spiral
      `<svg viewBox="0 0 32 32" class="margin-doodle doodle-spiral">
        <path d="M16 16 A2 2 0 0 1 18 16 A4 4 0 0 1 14 20 A6 6 0 0 1 10 14 A8 8 0 0 1 20 8" fill="none" stroke="#7a6855" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      // 3. Doodle Exclamation
      `<svg viewBox="0 0 32 32" class="margin-doodle doodle-exclamation">
        <path d="M16 5 L16 19 M16 25 L16 27" fill="none" stroke="#c0574f" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
      // 4. Doodle Lightbulb
      `<svg viewBox="0 0 32 32" class="margin-doodle doodle-bulb">
        <path d="M11 13 A6 6 0 1 1 21 13 C21 16 18 18 18 21 L14 21 C14 18 11 16 11 13 Z M14 24 L18 24 M15 27 L17 27" fill="none" stroke="#d4a843" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      // 5. Doodle Crown
      `<svg viewBox="0 0 32 32" class="margin-doodle doodle-crown">
        <path d="M6 24 L26 24 L26 12 L20 18 L16 8 L12 18 L6 12 Z" fill="none" stroke="#5a9e6f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    ];

    const spawn = () => {
      const marginEl = this.container?.querySelector('#notebook-margin-doodles');
      if (!marginEl || document.hidden || AnimationConfig.isReducedMotion()) return;

      // Keep max 4 active doodles
      const existing = marginEl.querySelectorAll('.margin-doodle');
      if (existing.length >= 4) {
        existing[0].remove();
      }

      const doodleWrapper = document.createElement('div');
      doodleWrapper.className = 'doodle-wrapper';
      doodleWrapper.innerHTML = doodleSVGs[this.doodleIndex % doodleSVGs.length];
      this.doodleIndex++;

      // Position in left spine margin
      const randomY = 60 + Math.random() * (marginEl.clientHeight - 160);
      doodleWrapper.style.top = `${randomY}px`;
      doodleWrapper.style.left = `${6 + Math.random() * 8}px`;
      doodleWrapper.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;

      marginEl.appendChild(doodleWrapper);

      // Auto fade after 8 seconds
      setTimeout(() => {
        doodleWrapper.classList.add('fading');
        setTimeout(() => doodleWrapper.remove(), 1000);
      }, 8000);

      this.doodleTimer = setTimeout(spawn, 9000 + Math.random() * 8000);
    };

    this.doodleTimer = setTimeout(spawn, 3500);
  }

  // ── Page Turn Transition ──
  playPageTurn(onFlipped) {
    const page = this.container?.querySelector('.notebook-page');
    if (!page || AnimationConfig.isReducedMotion()) {
      if (onFlipped) onFlipped();
      return;
    }

    page.classList.add('page-turning');
    setTimeout(() => {
      if (onFlipped) onFlipped();
      setTimeout(() => {
        page.classList.remove('page-turning');
      }, 200);
    }, 220);
  }

  clear() {
    if (this.doodleTimer) clearTimeout(this.doodleTimer);
    const marginEl = this.container?.querySelector('#notebook-margin-doodles');
    if (marginEl) marginEl.innerHTML = '';
  }
}

export const notebookEnvironment = new NotebookEnvironment();
