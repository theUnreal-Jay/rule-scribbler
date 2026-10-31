// ═══════════════════════════════════════════════════════════
// ANIMATION CONTROLLER
// Master coordinator for all game animations, character states & particle FX
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';
import { particleSystem } from './particleSystem.js';
import { pencilController, eraserController } from './characterAnimations.js';
import { shapeAnimationSystem } from './shapeAnimations.js';
import { instructionBoardAnimator } from './instructionBoardAnimations.js';
import { notebookEnvironment } from './notebookEnvironment.js';
import { uiMicroAnimations } from './uiMicroAnimations.js';
import { transitionAnimations } from './transitionAnimations.js';

class AnimationController {
  constructor() {
    this.isInitialized = false;
    this.isPaused = false;
    this.config = AnimationConfig;
    this.particles = particleSystem;
    this.pencil = pencilController;
    this.eraser = eraserController;
    this.shapes = shapeAnimationSystem;
    this.board = instructionBoardAnimator;
    this.notebook = notebookEnvironment;
    this.ui = uiMicroAnimations;
    this.transitions = transitionAnimations;
  }

  init(container) {
    if (this.isInitialized) return;
    this.container = container || document.getElementById('game-container');
    if (!this.container) return;

    // Initialize subsystems
    this.particles.init(this.container);
    this.notebook.mount(this.container);

    const gamePencil = document.getElementById('game-pencil');
    if (gamePencil) this.pencil.mount(gamePencil);

    const eraserEl = document.getElementById('eraser-character');
    if (eraserEl) this.eraser.mount(eraserEl);

    const boardEl = document.getElementById('instruction-board');
    if (boardEl) this.board.mount(boardEl);

    this.shapes.init(document.getElementById('play-area'));
    this.ui.attachButtonJuice(this.container);

    this.isInitialized = true;
  }

  pause() {
    this.isPaused = true;
    this.particles.pause();
    this.pencil.pause();
    this.eraser.pause();
    if (this.container) this.container.classList.add('game-frozen');
  }

  resume() {
    this.isPaused = false;
    this.particles.resume();
    this.pencil.resume();
    this.eraser.resume();
    if (this.container) this.container.classList.remove('game-frozen');
  }

  clearOnScreenChange() {
    this.particles.clear();
    this.pencil.clearAllTimers();
    this.eraser.clearAllTimers();
    this.board.hideStrike();
  }
}

export const animationController = new AnimationController();
