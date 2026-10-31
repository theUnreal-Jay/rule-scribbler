// ═══════════════════════════════════════════════════════════
// TRANSITION ANIMATIONS
// Screen orchestrations, level start sequences, victory & defeat choreography
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';
import { pencilController, eraserController } from './characterAnimations.js';
import { instructionBoardAnimator } from './instructionBoardAnimations.js';
import { shapeAnimationSystem } from './shapeAnimations.js';
import { particleSystem } from './particleSystem.js';
import { notebookEnvironment } from './notebookEnvironment.js';

export class TransitionAnimations {
  // ── Home Screen Entrance Sequence ──
  playHomeEntrance(onComplete) {
    const isReduced = AnimationConfig.isReducedMotion();
    const homePencil = document.getElementById('home-pencil');
    const homeEraser = document.getElementById('home-eraser');
    const title = document.getElementById('home-title');
    const buttons = document.querySelectorAll('.home-buttons .btn');

    if (isReduced) {
      if (onComplete) onComplete();
      return;
    }

    // Title pop
    if (title) {
      title.classList.remove('anim-pop');
      void title.offsetWidth;
      title.classList.add('anim-pop');
    }

    // Pencil swoops from right
    if (homePencil) {
      homePencil.classList.remove('pencil-enter');
      void homePencil.offsetWidth;
      homePencil.classList.add('pencil-enter');
    }

    // Eraser bounces from left
    if (homeEraser) {
      homeEraser.classList.remove('eraser-enter');
      void homeEraser.offsetWidth;
      homeEraser.classList.add('eraser-enter');
    }

    // Stagger buttons
    buttons.forEach((btn, idx) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(16px) scale(0.95)';
      setTimeout(() => {
        btn.style.transition = `all 420ms ${AnimationConfig.easings.spring}`;
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0) scale(1) rotate(' + ((idx % 2 === 0 ? -0.5 : 0.5)) + 'deg)';
      }, 200 + idx * 80);
    });

    if (onComplete) {
      setTimeout(onComplete, 600);
    }
  }

  // ── Level Start Sequence ──
  playLevelStartSequence({ levelText, ruleText, shapes, onReady }) {
    const isReduced = AnimationConfig.isReducedMotion();

    // 1. Page turn / slide
    notebookEnvironment.playPageTurn(() => {
      // 2. Level number indicator scale pop
      const indicator = document.getElementById('level-indicator');
      if (indicator) {
        indicator.textContent = levelText;
        indicator.classList.remove('level-pop');
        void indicator.offsetWidth;
        indicator.classList.add('level-pop');
      }

      if (isReduced) {
        instructionBoardAnimator.revealText(ruleText);
        if (onReady) onReady();
        return;
      }

      // 3. Pencil writes the instruction
      pencilController.playWriting(750, () => {
        instructionBoardAnimator.revealText(ruleText);

        // 4. Shapes spawn one after another
        shapeAnimationSystem.animateEntrance(shapes, () => {
          // 5. Gameplay begins
          if (onReady) onReady();
        });
      });
    });
  }

  // ── Level Complete Choreography ──
  playLevelComplete({ stars, score, coins, onContinue }) {
    // 1. Eraser victory spin and celebratory jump
    eraserController.playVictory();

    // 2. Pencil defeat / reluctant clap
    pencilController.playDefeat();

    // 3. Central confetti burst
    const container = document.getElementById('game-container')?.getBoundingClientRect() || { width: 400, height: 700 };
    particleSystem.emitCelebration(container.width / 2, container.height * 0.45, 40);
  }

  // ── Level Failed Choreography ──
  playLevelFailed() {
    // 1. Eraser slumps forward in dejection
    eraserController.playDefeat();

    // 2. Pencil laughs evilly
    pencilController.playLaughing(1800);
  }
}

export const transitionAnimations = new TransitionAnimations();
