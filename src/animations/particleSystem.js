// ═══════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// Lightweight Canvas-based particle engine for ink, dust, confetti & popups
// ═══════════════════════════════════════════════════════════

import { AnimationConfig } from './animationConfig.js';

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 4;
    this.alpha = 1;
    this.fade = 0.02;
    this.gravity = 0.2;
    this.rotation = 0;
    this.vRot = 0;
    this.color = '#fff';
    this.type = 'circle'; // 'circle', 'dust', 'confetti', 'star', 'text', 'ink'
    this.scaleX = 1;
    this.scaleY = 1;
    this.text = '';
    this.life = 1;
    this.maxLife = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.pool = [];
    this.activeParticles = [];
    this.rafId = null;
    this.lastTime = 0;
    this.isPaused = false;
    this.maxParticles = AnimationConfig.particles.maxParticles;

    // Pre-populate pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push(new Particle());
    }
  }

  init(container) {
    if (!container) return;
    this.container = container;

    let canvas = container.querySelector('#fx-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'fx-canvas';
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '30';
      container.appendChild(canvas);
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => this.resize());
    this.startLoop();
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
  }

  startLoop() {
    if (this.rafId) return;
    const loop = (timestamp) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      if (!this.isPaused) {
        this.update(delta);
        this.render();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  clear() {
    for (const p of this.activeParticles) {
      p.reset();
      this.pool.push(p);
    }
    this.activeParticles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  getParticle() {
    if (this.pool.length > 0) {
      const p = this.pool.pop();
      p.reset();
      p.active = true;
      this.activeParticles.push(p);
      return p;
    }
    // If pool is full, reuse oldest particle
    if (this.activeParticles.length > 0) {
      const p = this.activeParticles.shift();
      p.reset();
      p.active = true;
      this.activeParticles.push(p);
      return p;
    }
    return null;
  }

  // ── Emit Eraser Dust (soft pink/cream flecks) ──
  emitEraserDust(x, y, count = 8) {
    if (AnimationConfig.isReducedMotion()) return;
    const colors = ['#f7b7b7', '#fcdada', '#ffffff', '#e89999', '#f0c0c0'];
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      p.x = x + (Math.random() - 0.5) * 16;
      p.y = y + (Math.random() - 0.5) * 8;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed * 0.7 - 0.5;
      p.size = 2 + Math.random() * 3.5;
      p.gravity = 0.08;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.type = 'dust';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 4;
      p.life = 0.6 + Math.random() * 0.4;
      p.maxLife = p.life;
    }
  }

  // ── Emit Pencil Graphite Shavings (dark grey pencil flecks) ──
  emitPencilGraphite(x, y, count = 6) {
    if (AnimationConfig.isReducedMotion()) return;
    const colors = ['#2c2c2c', '#4a4a4a', '#666666', '#d4a843'];
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 1.2 + Math.random() * 2.8;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 1.5 + Math.random() * 2.5;
      p.gravity = 0.16;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.type = 'circle';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 8;
      p.life = 0.5 + Math.random() * 0.35;
      p.maxLife = p.life;
    }
  }

  // ── Emit Ink Splatter (fluid droplets on incorrect tap) ──
  emitInkSplatter(x, y, color = '#c0574f', count = 12) {
    if (AnimationConfig.isReducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 3 + Math.random() * 4.5;
      p.gravity = 0.12;
      p.color = color;
      p.type = 'ink';
      p.scaleX = 1 + Math.random() * 0.4;
      p.scaleY = 0.7 + Math.random() * 0.5;
      p.rotation = Math.atan2(p.vy, p.vx);
      p.life = 0.5 + Math.random() * 0.4;
      p.maxLife = p.life;
    }
  }

  // ── Emit Celebration Confetti & Stars (notebook paper shreds) ──
  emitCelebration(x, y, count = 35) {
    if (AnimationConfig.isReducedMotion()) return;
    const colors = [
      '#5a9e6f', // green
      '#e87474', // red/pink
      '#5b7fb5', // blue
      '#f0c040', // gold
      '#8b6bae', // purple
      '#d48b3e', // orange
      '#fdf6e3'  // paper cream
    ];
    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const speed = 2.5 + Math.random() * 6.5;
      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 20;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 5 + Math.random() * 5;
      p.gravity = 0.18;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.type = Math.random() < 0.35 ? 'star' : 'confetti';
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 10;
      p.life = 0.9 + Math.random() * 0.7;
      p.maxLife = p.life;
    }
  }

  // ── Emit Floating Text Popup (+100, STREAK x2!) ──
  emitTextPopup(x, y, text, color = '#5a9e6f') {
    if (AnimationConfig.isReducedMotion()) return;
    const p = this.getParticle();
    if (!p) return;
    p.x = x;
    p.y = y - 10;
    p.vx = (Math.random() - 0.5) * 0.8;
    p.vy = -1.8;
    p.gravity = 0.02;
    p.size = 20;
    p.color = color;
    p.type = 'text';
    p.text = text;
    p.life = 0.85;
    p.maxLife = 0.85;
  }

  update(delta) {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= delta;
      if (p.life <= 0) {
        p.reset();
        this.activeParticles.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.vRot * delta;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(this.dpr, this.dpr);

    for (const p of this.activeParticles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'circle' || p.type === 'ink') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.scale(p.scaleX, p.scaleY);
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Hand-drawn irregular dust speck
        ctx.ellipse(0, 0, p.size, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#2c2c2c';
        ctx.lineWidth = 0.75;
        // 3D twirling rectangle
        const cosW = Math.cos(p.rotation * 2) * p.size;
        ctx.beginPath();
        ctx.rect(-cosW / 2, -p.size, cosW, p.size * 1.6);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#2c2c2c';
        ctx.lineWidth = 0.75;
        this.drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'text') {
        ctx.font = 'bold 22px "Patrick Hand", cursive';
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Squash & pop upward
        const progress = 1 - (p.life / p.maxLife);
        const scale = 0.8 + Math.sin(progress * Math.PI * 0.5) * 0.4;
        ctx.scale(scale, scale);
        ctx.strokeText(p.text, 0, 0);
        ctx.fillText(p.text, 0, 0);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
}

export const particleSystem = new ParticleSystem();
