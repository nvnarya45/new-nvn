// ──────────────────────────────────────────────
// NEON RAIDER — Canvas Game Engine
// Vertical Space Shooter · HTML5 Canvas
// ──────────────────────────────────────────────

import {
  playLaser,
  playEnemyLaser,
  playExplosionSmall,
  playExplosionLarge,
  playPowerUp,
  playPlayerHit,
  playBossWarning,
  playWaveComplete,
  playGameOver,
  startMusic,
  stopMusic,
} from "./audio";

// ── Types ────────────────────────────────────

interface Vec2 {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  friendly: boolean;
  color: string;
  w: number;
  h: number;
}

interface PowerUpItem {
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  pulse: number;
}

type PowerUpType = "shield" | "triple" | "rapid" | "bomb";

interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  type: EnemyType;
  phase: number;
  speed: number;
  shootTimer: number;
  shootInterval: number;
  color: string;
  glowColor: string;
  value: number;
  enterY?: number;
  entered?: boolean;
}

type EnemyType = "drone" | "zigzag" | "tank" | "boss";

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onWaveChange: (wave: number) => void;
  onGameOver: (score: number, wave: number) => void;
  onBossSpawn: (bossHp: number, bossMaxHp: number) => void;
  onBossHpChange: (bossHp: number, bossMaxHp: number) => void;
  onBossDefeated: () => void;
  onPowerUp: (type: PowerUpType) => void;
  onComboChange: (combo: number) => void;
}

// ── Constants ────────────────────────────────

const PLAYER_W = 36;
const PLAYER_H = 40;
const PLAYER_SPEED = 5;
const BASE_SHOOT_INTERVAL = 180; // ms
const RAPID_SHOOT_INTERVAL = 90;
const STAR_COUNT = 120;
const POWER_UP_DURATION = 8000; // ms
const INVINCIBLE_DURATION = 1500;

// ── Game Class ───────────────────────────────

export class NeonRaiderGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W: number;
  private H: number;
  private running = false;
  private animId = 0;
  private lastTime = 0;
  private cb: GameCallbacks;

  // Player
  private px = 0;
  private py = 0;
  private lives = 3;
  private score = 0;
  private combo = 0;
  private comboTimer = 0;
  private invincibleUntil = 0;

  // Shooting
  private shooting = false;
  private lastShot = 0;
  private shootInterval = BASE_SHOOT_INTERVAL;

  // Power-ups
  private activeTriple = 0;
  private activeRapid = 0;
  private activeShield = 0;

  // Objects
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private powerUps: PowerUpItem[] = [];
  private stars: { x: number; y: number; speed: number; brightness: number }[] =
    [];

  // Wave
  private wave = 1;
  private enemiesSpawned = 0;
  private enemiesPerWave = 12;
  private spawnTimer = 0;
  private spawnInterval = 1200;
  private waveTransition = 0;
  private bossActive = false;
  private bossDefeated = false;

  // Screen shake
  private shakeAmount = 0;
  private shakeDuration = 0;

  // Input
  private keys: Record<string, boolean> = {};

  // Touch input (mobile controls)
  private touchDx = 0;
  private touchDy = 0;
  private touchFiring = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cb = callbacks;
    this.W = canvas.width;
    this.H = canvas.height;
    this.px = this.W / 2 - PLAYER_W / 2;
    this.py = this.H - 80;

    // Init stars
    for (let i = 0; i < STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        speed: 0.5 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.loop = this.loop.bind(this);
  }

  start() {
    this.running = true;
    this.lives = 3;
    this.score = 0;
    this.combo = 0;
    this.wave = 1;
    this.enemiesSpawned = 0;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerUps = [];
    this.bossActive = false;
    this.bossDefeated = false;
    this.activeTriple = 0;
    this.activeRapid = 0;
    this.activeShield = 0;
    this.invincibleUntil = 0;
    this.px = this.W / 2 - PLAYER_W / 2;
    this.py = this.H - 80;
    this.lastTime = performance.now();

    this.cb.onScoreChange(0);
    this.cb.onLivesChange(3);
    this.cb.onWaveChange(1);
    this.cb.onComboChange(0);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    startMusic();
    this.animId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    stopMusic();
  }

  resize(w: number, h: number) {
    this.W = w;
    this.H = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  // ── Input ──────────────────────────────────

  private handleKeyDown(e: KeyboardEvent) {
    this.keys[e.key] = true;
    if (e.key === " " || e.key === "z" || e.key === "Z") {
      this.shooting = true;
      e.preventDefault();
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.key] = false;
    if (e.key === " " || e.key === "z" || e.key === "Z") {
      this.shooting = false;
    }
  }

  // ── Touch Input (public API for mobile) ────

  /** Set directional input from virtual joystick. dx/dy range: -1 to 1 */
  setTouchMove(dx: number, dy: number) {
    this.touchDx = dx;
    this.touchDy = dy;
  }

  /** Set firing state from touch fire button */
  setTouchFiring(firing: boolean) {
    this.touchFiring = firing;
  }

  // ── Main Loop ──────────────────────────────

  private loop(time: number) {
    if (!this.running) return;
    const dt = Math.min(time - this.lastTime, 33); // cap at ~30fps min
    this.lastTime = time;
    this.update(dt, time);
    this.render(time);
    this.animId = requestAnimationFrame(this.loop);
  }

  // ── Update ─────────────────────────────────

  private update(dt: number, time: number) {
    const now = time;

    // Player movement (keyboard)
    let mdx = 0, mdy = 0;
    if (this.keys["ArrowLeft"] || this.keys["a"]) mdx -= 1;
    if (this.keys["ArrowRight"] || this.keys["d"]) mdx += 1;
    if (this.keys["ArrowUp"] || this.keys["w"]) mdy -= 1;
    if (this.keys["ArrowDown"] || this.keys["s"]) mdy += 1;
    // Merge touch input
    if (this.touchDx !== 0 || this.touchDy !== 0) {
      mdx += this.touchDx;
      mdy += this.touchDy;
    }
    // Clamp to unit circle for diagonals
    const mag = Math.sqrt(mdx * mdx + mdy * mdy);
    if (mag > 1) { mdx /= mag; mdy /= mag; }
    this.px += mdx * PLAYER_SPEED;
    this.py += mdy * PLAYER_SPEED;
    this.px = Math.max(0, Math.min(this.W - PLAYER_W, this.px));
    this.py = Math.max(0, Math.min(this.H - PLAYER_H, this.py));

    // Shooting (keyboard or touch)
    const isShooting = this.shooting || this.touchFiring;
    this.shootInterval =
      this.activeRapid > now ? RAPID_SHOOT_INTERVAL : BASE_SHOOT_INTERVAL;
    if (isShooting && now - this.lastShot > this.shootInterval) {
      this.lastShot = now;
      this.spawnPlayerBullets(now);
      playLaser();
    }

    // Stars
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > this.H) {
        s.y = 0;
        s.x = Math.random() * this.W;
      }
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.y < -20 || b.y > this.H + 20 || b.x < -20 || b.x > this.W + 20) {
        this.bullets.splice(i, 1);
      }
    }

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.phase += 0.02;

      // Enter from top
      if (!e.entered) {
        e.y += 2;
        if (e.y >= (e.enterY ?? 100)) e.entered = true;
        continue;
      }

      // Movement patterns
      if (e.type === "drone") {
        e.y += e.speed * 0.3;
        e.x += Math.sin(e.phase) * 1.5;
      } else if (e.type === "zigzag") {
        e.y += e.speed * 0.2;
        e.x += Math.cos(e.phase * 2) * 3;
      } else if (e.type === "tank") {
        e.y += e.speed * 0.15;
        e.x += Math.sin(e.phase * 0.5) * 1;
      } else if (e.type === "boss") {
        e.x += Math.sin(e.phase * 0.8) * 2;
        e.y += Math.sin(e.phase * 0.3) * 0.5;
        e.y = Math.max(40, Math.min(this.H * 0.3, e.y));
      }

      // Shoot
      e.shootTimer -= dt;
      if (e.shootTimer <= 0 && e.entered) {
        e.shootTimer = e.shootInterval;
        if (e.type === "boss") {
          // Boss fires spread
          for (let a = -2; a <= 2; a++) {
            this.bullets.push({
              x: e.x + e.w / 2 - 3,
              y: e.y + e.h,
              vx: a * 1.5,
              vy: 4,
              friendly: false,
              color: "#ff3366",
              w: 6,
              h: 10,
            });
          }
          playEnemyLaser();
        } else {
          this.bullets.push({
            x: e.x + e.w / 2 - 2,
            y: e.y + e.h,
            vx: 0,
            vy: 3.5 + this.wave * 0.3,
            friendly: false,
            color: "#ff5555",
            w: 4,
            h: 8,
          });
          playEnemyLaser();
        }
      }

      // Off-screen cleanup (non-boss)
      if (e.type !== "boss" && e.y > this.H + 60) {
        this.enemies.splice(i, 1);
        this.combo = 0;
        this.cb.onComboChange(0);
      }
    }

    // Bullet-Enemy collisions
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (!b.friendly) continue;
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (this.aabb(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) {
          this.bullets.splice(bi, 1);
          e.hp--;
          // Hit sparks
          for (let p = 0; p < 4; p++) {
            this.particles.push(
              this.makeParticle(b.x, b.y, e.glowColor, 3, 0.3)
            );
          }
          if (e.hp <= 0) {
            this.destroyEnemy(e, ei, now);
          }
          break;
        }
      }
    }

    // Bullet-Player collisions
    const pCx = this.px + PLAYER_W / 2;
    const pCy = this.py + PLAYER_H / 2;
    if (now > this.invincibleUntil) {
      for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
        const b = this.bullets[bi];
        if (b.friendly) continue;
        if (
          this.aabb(
            b.x,
            b.y,
            b.w,
            b.h,
            this.px + 8,
            this.py + 8,
            PLAYER_W - 16,
            PLAYER_H - 16
          )
        ) {
          this.bullets.splice(bi, 1);
          if (this.activeShield > now) {
            this.activeShield = 0;
            // Shield absorb effect
            for (let p = 0; p < 12; p++) {
              this.particles.push(
                this.makeParticle(pCx, pCy, "#00ffff", 5, 0.5)
              );
            }
          } else {
            this.playerHit(now);
          }
        }
      }

      // Enemy-Player collision
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (
          this.aabb(
            this.px + 6,
            this.py + 6,
            PLAYER_W - 12,
            PLAYER_H - 12,
            e.x,
            e.y,
            e.w,
            e.h
          )
        ) {
          if (this.activeShield > now) {
            this.activeShield = 0;
            e.hp = 0;
            this.destroyEnemy(e, ei, now);
          } else {
            this.playerHit(now);
            if (e.type !== "boss") {
              this.destroyEnemy(e, ei, now);
            }
          }
          break;
        }
      }
    }

    // Power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.y += p.vy;
      p.pulse += 0.08;
      if (p.y > this.H + 30) {
        this.powerUps.splice(i, 1);
        continue;
      }
      if (this.aabb(this.px, this.py, PLAYER_W, PLAYER_H, p.x - 12, p.y - 12, 24, 24)) {
        this.powerUps.splice(i, 1);
        this.activatePowerUp(p.type, now);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / 1000;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Combo decay
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.cb.onComboChange(0);
      }
    }

    // Shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) this.shakeAmount = 0;
    }

    // Wave spawning
    if (!this.bossActive && this.waveTransition <= 0) {
      this.spawnTimer -= dt;
      if (
        this.spawnTimer <= 0 &&
        this.enemiesSpawned < this.enemiesPerWave
      ) {
        this.spawnEnemy();
        this.enemiesSpawned++;
        this.spawnTimer = this.spawnInterval;
      }

      // Wave complete check
      if (
        this.enemiesSpawned >= this.enemiesPerWave &&
        this.enemies.length === 0
      ) {
        if (this.wave % 3 === 0 && !this.bossDefeated) {
          // Boss wave!
          this.spawnBoss();
        } else {
          this.nextWave(now);
        }
      }
    }

    // Wave transition countdown
    if (this.waveTransition > 0) {
      this.waveTransition -= dt;
    }
  }

  // ── Spawning ───────────────────────────────

  private spawnEnemy() {
    const types: EnemyType[] = ["drone", "drone", "zigzag", "tank"];
    const type = types[Math.floor(Math.random() * Math.min(types.length, 2 + this.wave))];
    const configs: Record<
      string,
      { w: number; h: number; hp: number; speed: number; si: number; color: string; glow: string; value: number }
    > = {
      drone: { w: 28, h: 28, hp: 1, speed: 1.5 + this.wave * 0.2, si: 2000, color: "#ff6644", glow: "#ff4422", value: 100 },
      zigzag: { w: 30, h: 26, hp: 2, speed: 1.2 + this.wave * 0.15, si: 1800, color: "#ffcc00", glow: "#ff9900", value: 200 },
      tank: { w: 36, h: 36, hp: 4 + this.wave, speed: 0.8, si: 1500, color: "#ff2266", glow: "#cc0044", value: 400 },
    };
    const c = configs[type] || configs.drone;
    this.enemies.push({
      x: 30 + Math.random() * (this.W - 60 - c.w),
      y: -50,
      w: c.w,
      h: c.h,
      hp: c.hp,
      maxHp: c.hp,
      type: type,
      phase: Math.random() * Math.PI * 2,
      speed: c.speed,
      shootTimer: 500 + Math.random() * 1000,
      shootInterval: c.si - this.wave * 100,
      color: c.color,
      glowColor: c.glow,
      value: c.value,
      enterY: 40 + Math.random() * 200,
      entered: false,
    });
  }

  private spawnBoss() {
    this.bossActive = true;
    playBossWarning();
    const bossHp = 30 + this.wave * 10;
    const boss: Enemy = {
      x: this.W / 2 - 60,
      y: -80,
      w: 120,
      h: 70,
      hp: bossHp,
      maxHp: bossHp,
      type: "boss",
      phase: 0,
      speed: 1,
      shootTimer: 1000,
      shootInterval: 800 - this.wave * 30,
      color: "#ff00ff",
      glowColor: "#cc00cc",
      value: 5000,
      enterY: 60,
      entered: false,
    };
    this.enemies.push(boss);
    this.cb.onBossSpawn(boss.hp, boss.maxHp);
  }

  private nextWave(_now: number) {
    this.wave++;
    this.enemiesSpawned = 0;
    this.enemiesPerWave = 12 + this.wave * 3;
    this.spawnInterval = Math.max(400, 1200 - this.wave * 80);
    this.waveTransition = 2500;
    this.bossDefeated = false;
    this.cb.onWaveChange(this.wave);
    playWaveComplete();
  }

  private destroyEnemy(e: Enemy, idx: number, now: number) {
    // Particles
    const count = e.type === "boss" ? 60 : 12;
    for (let p = 0; p < count; p++) {
      this.particles.push(
        this.makeParticle(e.x + e.w / 2, e.y + e.h / 2, e.glowColor, e.type === "boss" ? 6 : 4, e.type === "boss" ? 1.0 : 0.5)
      );
    }

    // Score
    const multiplier = Math.max(1, this.combo);
    this.score += e.value * multiplier;
    this.combo++;
    this.comboTimer = 3000;
    this.cb.onScoreChange(this.score);
    this.cb.onComboChange(this.combo);

    // Shake
    if (e.type === "boss") {
      this.shakeAmount = 12;
      this.shakeDuration = 600;
      playExplosionLarge();
      this.bossActive = false;
      this.bossDefeated = true;
      this.cb.onBossDefeated();
      // Extra particles!
      for (let p = 0; p < 40; p++) {
        this.particles.push(
          this.makeParticle(
            e.x + Math.random() * e.w,
            e.y + Math.random() * e.h,
            ["#ff00ff", "#00ffff", "#ffff00", "#ff6600"][Math.floor(Math.random() * 4)],
            5,
            1.2
          )
        );
      }
      setTimeout(() => this.nextWave(now), 2000);
    } else {
      this.shakeAmount = 3;
      this.shakeDuration = 100;
      playExplosionSmall();
    }

    // Boss HP callback
    if (e.type === "boss" && e.hp > 0) {
      this.cb.onBossHpChange(e.hp, e.maxHp);
    }

    // Drop power-up (20% chance, or guaranteed from tanks)
    if (e.type === "tank" || Math.random() < 0.18) {
      const types: PowerUpType[] = ["shield", "triple", "rapid", "bomb"];
      this.powerUps.push({
        x: e.x + e.w / 2,
        y: e.y + e.h / 2,
        vy: 1.5,
        type: types[Math.floor(Math.random() * types.length)],
        pulse: 0,
      });
    }

    this.enemies.splice(idx, 1);
  }

  private playerHit(now: number) {
    this.lives--;
    this.cb.onLivesChange(this.lives);
    this.invincibleUntil = now + INVINCIBLE_DURATION;
    this.combo = 0;
    this.cb.onComboChange(0);
    this.shakeAmount = 8;
    this.shakeDuration = 300;
    playPlayerHit();

    // Explosion particles at player
    for (let p = 0; p < 20; p++) {
      this.particles.push(
        this.makeParticle(
          this.px + PLAYER_W / 2,
          this.py + PLAYER_H / 2,
          "#00ffff",
          4,
          0.6
        )
      );
    }

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver() {
    this.running = false;
    stopMusic();
    playGameOver();
    cancelAnimationFrame(this.animId);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.cb.onGameOver(this.score, this.wave);
  }

  private spawnPlayerBullets(_now: number) {
    const cx = this.px + PLAYER_W / 2;
    const cy = this.py;
    if (this.activeTriple > performance.now()) {
      this.bullets.push({ x: cx - 2, y: cy, vx: 0, vy: -7, friendly: true, color: "#00ffcc", w: 4, h: 12 });
      this.bullets.push({ x: cx - 12, y: cy + 5, vx: -1.5, vy: -6.5, friendly: true, color: "#00ffcc", w: 4, h: 12 });
      this.bullets.push({ x: cx + 8, y: cy + 5, vx: 1.5, vy: -6.5, friendly: true, color: "#00ffcc", w: 4, h: 12 });
    } else {
      this.bullets.push({ x: cx - 2, y: cy, vx: 0, vy: -7, friendly: true, color: "#00ffcc", w: 4, h: 12 });
    }
  }

  private activatePowerUp(type: PowerUpType, now: number) {
    playPowerUp();
    this.cb.onPowerUp(type);
    switch (type) {
      case "shield":
        this.activeShield = now + POWER_UP_DURATION;
        break;
      case "triple":
        this.activeTriple = now + POWER_UP_DURATION;
        break;
      case "rapid":
        this.activeRapid = now + POWER_UP_DURATION;
        break;
      case "bomb":
        // Destroy all enemies on screen (except boss)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const e = this.enemies[i];
          if (e.type !== "boss") {
            this.destroyEnemy(e, i, now);
          } else {
            e.hp -= 10;
            this.cb.onBossHpChange(e.hp, e.maxHp);
            if (e.hp <= 0) {
              this.destroyEnemy(e, i, now);
            }
          }
        }
        // White flash particles
        for (let p = 0; p < 50; p++) {
          this.particles.push(
            this.makeParticle(
              Math.random() * this.W,
              Math.random() * this.H,
              "#ffffff",
              6,
              0.8
            )
          );
        }
        this.shakeAmount = 10;
        this.shakeDuration = 400;
        playExplosionLarge();
        break;
    }
  }

  // ── Render ─────────────────────────────────

  private render(time: number) {
    const c = this.ctx;
    const W = this.W;
    const H = this.H;

    // Shake offset
    let sx = 0,
      sy = 0;
    if (this.shakeAmount > 0) {
      sx = (Math.random() - 0.5) * this.shakeAmount * 2;
      sy = (Math.random() - 0.5) * this.shakeAmount * 2;
    }

    c.save();
    c.translate(sx, sy);

    // Background
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0014");
    bg.addColorStop(0.5, "#0d0028");
    bg.addColorStop(1, "#120030");
    c.fillStyle = bg;
    c.fillRect(-10, -10, W + 20, H + 20);

    // Grid lines (subtle)
    c.strokeStyle = "rgba(100, 0, 200, 0.08)";
    c.lineWidth = 1;
    const gridSize = 50;
    const gridOffset = (time * 0.03) % gridSize;
    for (let y = gridOffset; y < H; y += gridSize) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(W, y);
      c.stroke();
    }
    for (let x = 0; x < W; x += gridSize) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, H);
      c.stroke();
    }

    // Stars
    for (const s of this.stars) {
      const alpha = s.brightness * (0.5 + Math.sin(time * 0.003 + s.x) * 0.5);
      c.fillStyle = `rgba(200, 180, 255, ${alpha})`;
      c.fillRect(s.x, s.y, 1.5, 1.5);
    }

    // Power-ups
    for (const p of this.powerUps) {
      const glow = 0.5 + Math.sin(p.pulse) * 0.3;
      const colors: Record<PowerUpType, string> = {
        shield: "#00ccff",
        triple: "#ffcc00",
        rapid: "#ff6600",
        bomb: "#ff0044",
      };
      const icons: Record<PowerUpType, string> = {
        shield: "S",
        triple: "T",
        rapid: "R",
        bomb: "B",
      };
      const col = colors[p.type];
      c.save();
      c.shadowColor = col;
      c.shadowBlur = 15 * glow;
      c.strokeStyle = col;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(p.x, p.y, 12 + Math.sin(p.pulse) * 2, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = col;
      c.font = "bold 12px monospace";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(icons[p.type], p.x, p.y);
      c.restore();
    }

    // Enemies
    for (const e of this.enemies) {
      c.save();
      c.shadowColor = e.glowColor;
      c.shadowBlur = 12;

      if (e.type === "boss") {
        this.drawBoss(c, e, time);
      } else if (e.type === "drone") {
        this.drawDrone(c, e);
      } else if (e.type === "zigzag") {
        this.drawZigzag(c, e);
      } else if (e.type === "tank") {
        this.drawTank(c, e);
      }
      c.restore();

      // HP bar for tanks and boss
      if ((e.type === "tank" || e.type === "boss") && e.hp < e.maxHp) {
        const barW = e.w;
        const barH = 3;
        c.fillStyle = "rgba(0,0,0,0.6)";
        c.fillRect(e.x, e.y - 8, barW, barH);
        c.fillStyle = e.type === "boss" ? "#ff00ff" : "#ff3366";
        c.fillRect(e.x, e.y - 8, barW * (e.hp / e.maxHp), barH);
      }
    }

    // Bullets
    for (const b of this.bullets) {
      c.save();
      c.shadowColor = b.color;
      c.shadowBlur = 8;
      c.fillStyle = b.color;
      c.fillRect(b.x, b.y, b.w, b.h);
      // Bright core
      c.fillStyle = "#ffffff";
      c.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      c.restore();
    }

    // Particles
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      c.save();
      c.globalAlpha = alpha;
      c.shadowColor = p.color;
      c.shadowBlur = 6;
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // Player
    this.drawPlayer(c, time);

    // Wave transition text
    if (this.waveTransition > 0) {
      const alpha = Math.min(1, this.waveTransition / 1000);
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = "#00ffcc";
      c.font = "bold 36px monospace";
      c.textAlign = "center";
      c.shadowColor = "#00ffcc";
      c.shadowBlur = 20;
      c.fillText(`WAVE ${this.wave}`, W / 2, H / 2 - 20);
      c.font = "16px monospace";
      c.fillStyle = "#aaffee";
      c.fillText("GET READY", W / 2, H / 2 + 20);
      c.restore();
    }

    c.restore();
  }

  // ── Draw Helpers ───────────────────────────

  private drawPlayer(c: CanvasRenderingContext2D, time: number) {
    const x = this.px;
    const y = this.py;
    const w = PLAYER_W;
    const h = PLAYER_H;

    // Invincibility flash
    if (
      time < this.invincibleUntil &&
      Math.floor(time / 80) % 2 === 0
    ) {
      return; // blink
    }

    c.save();
    c.shadowColor = "#00ffcc";
    c.shadowBlur = 15;

    // Ship body
    c.fillStyle = "#00ffcc";
    c.beginPath();
    c.moveTo(x + w / 2, y); // nose
    c.lineTo(x + w, y + h * 0.7); // right wing
    c.lineTo(x + w * 0.75, y + h); // right tail
    c.lineTo(x + w * 0.25, y + h); // left tail
    c.lineTo(x, y + h * 0.7); // left wing
    c.closePath();
    c.fill();

    // Cockpit
    c.fillStyle = "#0a2030";
    c.beginPath();
    c.moveTo(x + w / 2, y + 10);
    c.lineTo(x + w * 0.62, y + h * 0.55);
    c.lineTo(x + w * 0.38, y + h * 0.55);
    c.closePath();
    c.fill();

    // Engine glow
    const thrustFlicker = Math.sin(time * 0.02) * 3;
    const grad = c.createLinearGradient(x + w / 2, y + h, x + w / 2, y + h + 15 + thrustFlicker);
    grad.addColorStop(0, "#00ffcc");
    grad.addColorStop(0.5, "#0088ff");
    grad.addColorStop(1, "transparent");
    c.fillStyle = grad;
    c.fillRect(x + w * 0.35, y + h, w * 0.3, 15 + thrustFlicker);

    // Shield
    if (this.activeShield > time) {
      c.strokeStyle = "#00ccff";
      c.lineWidth = 2;
      c.shadowColor = "#00ccff";
      c.shadowBlur = 20;
      c.globalAlpha = 0.4 + Math.sin(time * 0.01) * 0.2;
      c.beginPath();
      c.arc(x + w / 2, y + h / 2, 30, 0, Math.PI * 2);
      c.stroke();
      c.globalAlpha = 1;
    }

    c.restore();
  }

  private drawDrone(c: CanvasRenderingContext2D, e: Enemy) {
    c.fillStyle = e.color;
    c.beginPath();
    c.moveTo(e.x + e.w / 2, e.y + e.h);
    c.lineTo(e.x + e.w, e.y + e.h * 0.3);
    c.lineTo(e.x + e.w / 2, e.y);
    c.lineTo(e.x, e.y + e.h * 0.3);
    c.closePath();
    c.fill();
    // Eye
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(e.x + e.w / 2, e.y + e.h * 0.4, 3, 0, Math.PI * 2);
    c.fill();
  }

  private drawZigzag(c: CanvasRenderingContext2D, e: Enemy) {
    c.fillStyle = e.color;
    // Hexagon-ish shape
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const r = e.w / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(cx, cy, 3, 0, Math.PI * 2);
    c.fill();
  }

  private drawTank(c: CanvasRenderingContext2D, e: Enemy) {
    c.fillStyle = e.color;
    c.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
    c.strokeStyle = "#ffffff44";
    c.lineWidth = 2;
    c.strokeRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
    // Cannon
    c.fillStyle = "#ffffff";
    c.fillRect(e.x + e.w / 2 - 2, e.y + e.h - 4, 4, 10);
  }

  private drawBoss(c: CanvasRenderingContext2D, e: Enemy, time: number) {
    // Big menacing shape
    c.fillStyle = e.color;
    c.beginPath();
    c.moveTo(e.x + e.w / 2, e.y);
    c.lineTo(e.x + e.w, e.y + e.h * 0.4);
    c.lineTo(e.x + e.w * 0.9, e.y + e.h);
    c.lineTo(e.x + e.w * 0.1, e.y + e.h);
    c.lineTo(e.x, e.y + e.h * 0.4);
    c.closePath();
    c.fill();

    // Wings
    c.beginPath();
    c.moveTo(e.x, e.y + e.h * 0.3);
    c.lineTo(e.x - 20, e.y + e.h * 0.6);
    c.lineTo(e.x + 10, e.y + e.h * 0.7);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(e.x + e.w, e.y + e.h * 0.3);
    c.lineTo(e.x + e.w + 20, e.y + e.h * 0.6);
    c.lineTo(e.x + e.w - 10, e.y + e.h * 0.7);
    c.closePath();
    c.fill();

    // Eyes
    const eyePulse = Math.sin(time * 0.005) * 2;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(e.x + e.w * 0.35, e.y + e.h * 0.35, 5 + eyePulse, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(e.x + e.w * 0.65, e.y + e.h * 0.35, 5 + eyePulse, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ff0044";
    c.beginPath();
    c.arc(e.x + e.w * 0.35, e.y + e.h * 0.35, 3, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(e.x + e.w * 0.65, e.y + e.h * 0.35, 3, 0, Math.PI * 2);
    c.fill();
  }

  // ── Helpers ────────────────────────────────

  private aabb(
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private makeParticle(
    x: number, y: number, color: string, size: number, life: number
  ): Particle {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      color,
      size,
    };
  }
}
