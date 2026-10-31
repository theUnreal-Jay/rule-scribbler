// ═══════════════════════════════════════════════════════════
// ANIMATION CONFIGURATION
// Spring curves, timing, ease functions & performance settings
// ═══════════════════════════════════════════════════════════

export const AnimationConfig = {
  // Cubic bezier easing presets for expressive 2D cartoon physics
  easings: {
    // Spring with overshoot - punchy indie game feel
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    springGentle: 'cubic-bezier(0.25, 1.25, 0.5, 1)',
    springHeavy: 'cubic-bezier(0.175, 0.885, 0.32, 1.35)',
    // Smooth deceleration
    easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
    // Squash & anticipation
    anticipate: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
    overshoot: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  },

  // Timing constants (ms)
  timing: {
    pencilBlinkMin: 2200,
    pencilBlinkMax: 5000,
    pencilTapIntervalMin: 6000,
    pencilTapIntervalMax: 11000,
    pencilGlanceInterval: 4000,

    eraserHopInterval: 2800,
    eraserBlinkIntervalMin: 2000,
    eraserBlinkIntervalMax: 4500,

    shapeEntranceDuration: 550,
    shapeStaggerDelay: 80,
    shapeCorrectDuration: 450,
    shapeWrongDuration: 400,

    instructionHandwriteDuration: 650,
    instructionScratchDuration: 450,
    instructionShakeDuration: 350,

    pageTurnDuration: 420,
    starPopDelay: 320,
    scoreCountDuration: 800,
    coinFlyDuration: 600
  },

  // Max active particle counts for 60 FPS performance on mid-range devices
  particles: {
    maxParticles: 120,
    dustCountOnBounce: 8,
    dustCountOnRub: 14,
    inkSplashCount: 16,
    celebrationConfettiCount: 45,
    pencilShavingsCount: 10,
    maxFloatingPopups: 5
  },

  // Motion reduction check
  isReducedMotion() {
    return document.body.classList.contains('reduce-motion') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};
