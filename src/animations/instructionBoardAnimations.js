// ═══════════════════════════════════════════════════════════
// INSTRUCTION BOARD ANIMATIONS
// Progressive handwriting reveal, dynamic SVG strike-throughs, ink ripples & shakes
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';
import { particleSystem } from './particleSystem.js';

export class InstructionBoardAnimator {
  constructor() {
    this.boardEl = null;
    this.textEl = null;
    this.subEl = null;
    this.strikeSvg = null;
  }

  mount(boardEl) {
    this.boardEl = boardEl;
    if (!this.boardEl) return;
    this.textEl = this.boardEl.querySelector('#instruction-text');
    this.subEl = this.boardEl.querySelector('#instruction-sub');

    // Create SVG strike-through layer if not exists
    let strikeSvg = this.boardEl.querySelector('#instruction-strike-svg');
    if (!strikeSvg) {
      strikeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      strikeSvg.id = 'instruction-strike-svg';
      strikeSvg.setAttribute('viewBox', '0 0 300 40');
      strikeSvg.setAttribute('preserveAspectRatio', 'none');
      strikeSvg.setAttribute('class', 'instruction-strike-layer');
      strikeSvg.innerHTML = `
        <path class="strike-path" d="M 5,22 Q 80,12 150,23 T 295,18" fill="none" stroke="#d32f2f" stroke-width="4.5" stroke-linecap="round"/>
        <path class="strike-path-2" d="M 12,26 Q 90,28 170,16 T 290,24" fill="none" stroke="#b71c1c" stroke-width="3" stroke-linecap="round"/>
      `;
      this.boardEl.appendChild(strikeSvg);
    }
    this.strikeSvg = strikeSvg;
  }

  // ── Settle down entrance bounce ──
  playEntranceBounce() {
    if (!this.boardEl || AnimationConfig.isReducedMotion()) return;
    this.boardEl.classList.remove('board-entrance');
    void this.boardEl.offsetWidth;
    this.boardEl.classList.add('board-entrance');
  }

  // ── Progressive handwriting text reveal ──
  revealText(text, subtext = '') {
    if (!this.textEl) return;
    this.hideStrike();

    this.textEl.classList.remove('crossed-out', 'rewritten', 'text-handwriting');
    this.textEl.textContent = text;
    if (this.subEl && subtext) this.subEl.textContent = subtext;

    if (AnimationConfig.isReducedMotion()) return;

    // Trigger ink handwriting reveal
    void this.textEl.offsetWidth;
    this.textEl.classList.add('text-handwriting');
    this.playEntranceBounce();
  }

  // ── Strike-through with animated red ink scratch ──
  playRuleRewrite(oldText, newText, onNewText) {
    if (!this.textEl) return;
    this.textEl.textContent = oldText;
    this.showStrike();

    // Board shake on the scratch impact
    this.shakeBoard();

    // After scratch completes, cross out and write new text
    setTimeout(() => {
      this.textEl.classList.add('crossed-out');
      setTimeout(() => {
        this.hideStrike();
        this.textEl.classList.remove('crossed-out');
        this.textEl.classList.add('rewritten', 'text-handwriting');
        this.textEl.textContent = newText;
        if (onNewText) onNewText();
        this.playEntranceBounce();
      }, 350);
    }, 450);
  }

  showStrike() {
    if (!this.strikeSvg) return;
    this.strikeSvg.classList.remove('active');
    void this.strikeSvg.offsetWidth;
    this.strikeSvg.classList.add('active');

    // Emit ink flecks around the strike
    const bRect = this.boardEl?.getBoundingClientRect();
    const cRect = document.getElementById('game-container')?.getBoundingClientRect() || { left: 0, top: 0 };
    if (bRect) {
      particleSystem.emitInkSplatter(
        bRect.left - cRect.left + bRect.width * 0.7,
        bRect.top - cRect.top + bRect.height * 0.5,
        '#d32f2f',
        6
      );
    }
  }

  hideStrike() {
    if (this.strikeSvg) {
      this.strikeSvg.classList.remove('active');
    }
  }

  // ── Board physical shake on betrayal or rule scratch ──
  shakeBoard() {
    if (!this.boardEl || AnimationConfig.isReducedMotion()) return;
    this.boardEl.classList.remove('board-shake');
    void this.boardEl.offsetWidth;
    this.boardEl.classList.add('board-shake');
    setTimeout(() => this.boardEl?.classList.remove('board-shake'), 400);
  }

  // ── Warning Highlight Pulse ──
  triggerWarning() {
    if (!this.boardEl || AnimationConfig.isReducedMotion()) return;
    this.boardEl.classList.add('board-warning');
    setTimeout(() => this.boardEl?.classList.remove('board-warning'), 1500);
  }
}

export const instructionBoardAnimator = new InstructionBoardAnimator();
