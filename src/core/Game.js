import { Input } from './Input.js';
import { Eagle } from '../entities/Eagle.js';
import { World } from '../entities/World.js';
import { Background } from '../systems/Background.js';
import { BiomeManager } from '../systems/BiomeManager.js';
import { AudioController } from './Audio.js';
import { ParticleSystem } from '../entities/Particles.js';
import { Camera } from './Camera.js';
import { SaveManager } from './SaveManager.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio, 2);

        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60;

        this.state = 'INTRO';
        this.introTimer = 0;
        this.deathTimer = 0; // Tracks time since death for sequence
        this.timeScale = 1.0; // For slow-mo effect

        this.saveManager = new SaveManager();
        this.input = new Input();
        this.audio = new AudioController();
        this.particles = new ParticleSystem(this);
        this.biomeManager = new BiomeManager(this);
        this.background = new Background(this);
        this.world = new World(this);
        this.eagle = new Eagle(this);
        this.camera = new Camera(this);

        this.eagle.y = this.height * 0.5;

        this.input.onTap(() => {
            if (!this.audio.initialized) this.audio.init();

            if (this.state === 'INTRO') {
                this.startGame();
            } else if (this.state === 'PLAYING') {
                this.eagle.flap();
                this.audio.playFlap();
                // Emit small particles on flap
                this.particles.emit(this.eagle.x, this.eagle.y + 10, 'dust', 3);
            } else if (this.state === 'GAME_OVER') {
                // Only restart if the death sequence has finished (prevent accidental double tap)
                if (this.deathTimer > 0.6) {
                    this.reset();
                }
            }
        });

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.imageSmoothingEnabled = true;
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    startGame() {
        this.state = 'PLAYING';
        this.eagle.flap();
        this.audio.playFlap();
    }

    reset() {
        this.state = 'INTRO';
        this.eagle.reset();
        this.world = new World(this);
        this.camera.reset();
        this.eagle.y = this.height * 0.5;
        this.introTimer = 0;
        this.deathTimer = 0;
        this.deathTimer = 0;
        this.deathTimer = 0;
        this.timeScale = 1.0;
        this.combo = 0;
        this.isSoaring = false; // Phase 1: Soar State
        this.soarTimer = 0;
    }

    die() {
        if (this.state === 'GAME_OVER') return;

        this.state = 'GAME_OVER';
        this.eagle.isDead = true;
        this.deathTimer = 0;
        this.timeScale = 0.0; // Freeze instantly

        this.audio.playImpact();
        this.audio.updateWind(0); // Cut wind

        // Save Progress
        const sessionFeathers = Math.floor(this.world.distance / 100);
        this.saveManager.addFeathers(sessionFeathers);

        this.particles.emit(this.eagle.x + 20, this.eagle.y + 20, 'feather', 10);
        this.particles.emit(this.eagle.x, this.eagle.y + 20, 'debris', 8); // Add new debris
        this.camera.shake(20);
    }

    onGraze() {
        this.combo++;
        this.triggerGrazeEffects();
        console.log("Graze! Combo:", this.combo);

        // 5 grazes = SOAR MODE 
        if (this.combo >= 5 && !this.isSoaring) {
            this.enterSoarState();
        }
    }

    enterSoarState() {
        this.isSoaring = true;
        this.soarTimer = 5.0; // 5 seconds of glory
        if (this.audio.playSoar) this.audio.playSoar();
        this.camera.zoom = 0.7; // Pull back
        // Speed up world
        this.world.speedMultiplier = 2.0;
    }

    triggerGrazeEffects() {
        // Audio
        this.audio.playGraze();

        // Particles
        // Sparks at eagle position
        this.particles.emit(this.eagle.x + this.eagle.width / 2, this.eagle.y + this.eagle.height / 2, 'spark', 5);

        // Camera slight shake or zoom punch?
        this.camera.zoom += 0.05; // Quick zoom punch
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.accumulator += deltaTime;
        while (this.accumulator >= this.timeStep) {
            // Pass scaled time to update
            this.update((this.timeStep / 1000) * this.timeScale);
            this.accumulator -= this.timeStep;
        }

        // Always draw
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Unscaled time tracking for death sequence UI
        const unscaledDt = 1 / 60;

        if (this.state === 'GAME_OVER') {
            this.deathTimer += unscaledDt;

            // Sequence: Freeze (100ms) -> Slow Resume (50%) -> Stop?
            // User Requirement: Resume background motion at 50 percent speed for 400 ms
            if (this.deathTimer < 0.1) {
                this.timeScale = 0;
            } else if (this.deathTimer < 0.5) {
                this.timeScale = 0.5;
            } else {
                this.timeScale = 0; // Stop after 400ms resume
            }

            // Stop music on death
            if (this.deathTimer > 1.0) {
                this.audio.stopMusic();
            }

            this.eagle.update(dt);
            this.world.update(dt); // Move obstacles slowly
            this.background.update(dt, this.world.speed); // Move parallax
            this.camera.update(dt);

            // Ensure background is instantiated if not already (it should be)
            if (!this.background) this.background = new Background(this);

        } else {
            this.timeScale = 1.0;

            this.camera.update(dt);
            this.biomeManager.update(dt, this.world.distance);
            this.particles.update(dt);

            if (this.state === 'PLAYING') {
                this.audio.updateWind(0.5);
                this.audio.startMusic(); // Idempotent

                this.eagle.update(dt);
                this.world.update(dt);
                this.background.update(dt, this.world.speed);

                // Add speed lines if diving fast
                if (this.eagle.velocity > 600) {
                    this.particles.emit(
                        this.eagle.x - 20,
                        this.eagle.y + Math.random() * 40 - 20,
                        'speed_line',
                        1
                    );

                    // Chance to screech on high speed
                    if (Math.random() < 0.01) {
                        this.audio.playScreech();
                    }
                }

                // Check Ground/Ceiling Collision
                if (this.eagle.y > this.height - 50 || this.eagle.y < -50) {
                    this.die();
                }

                if (this.world.checkCollisions(this.eagle)) {
                    this.die();
                } else {
                    // Check Grazes
                    // Count how many obstacles we grazed this frame (usually 0 or 1)
                    const grazedCount = this.world.checkGrazes(this.eagle);
                    if (grazedCount > 0) {
                        this.onGraze();
                    }
                }
            }
            else if (this.state === 'INTRO') {
                this.introTimer += dt;
                this.eagle.y += Math.sin(Date.now() / 300) * 0.5;
                this.background.update(dt, this.world.speed * 0.5); // Slow scroll in intro
                this.world.update(dt);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();

        // Apply Camera Transform (Zoom, Shake, Pan)
        this.camera.apply(this.ctx);

        // Background
        this.ctx.fillStyle = this.biomeManager.getBackgroundColor();
        // Draw larger rect to cover camera movements/zoom out
        // Safe to draw massively oversized rects in canvas
        this.ctx.fillRect(-this.width, -this.height, this.width * 3, this.height * 3);

        if (this.background) this.background.draw(this.ctx);

        // Entities
        this.world.draw(this.ctx);
        this.eagle.draw(this.ctx);
        this.particles.draw(this.ctx);

        this.ctx.restore();

        this.drawUI();
    }

    drawUI() {
        this.ctx.save();
        this.ctx.textAlign = 'center';

        if (this.state === 'INTRO') {
            const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.4;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.font = '20px system-ui';
            // Draw near eagle
            this.ctx.fillText("Tap to fly", this.eagle.x + 40, this.eagle.y - 40);

        } else if (this.state === 'GAME_OVER') {
            // Fade in card after 500ms (0.1s + 0.4s sequence)
            if (this.deathTimer > 0.5) {
                let opacity = (this.deathTimer - 0.5) / 0.2; // 200ms fade
                if (opacity > 1) opacity = 1;

                // Subtle Scale: 0.96 -> 1.0
                const scale = 0.96 + (0.04 * opacity);

                this.ctx.globalAlpha = opacity;

                const cx = this.width / 2;
                const cy = this.height / 2;

                this.ctx.translate(cx, cy);
                this.ctx.scale(scale, scale);
                this.ctx.translate(-cx, -cy);

                // Card Style: "Floating in air, not sitting on top"
                // Light blur/glow instead of heavy shadow
                this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
                this.ctx.shadowBlur = 20;

                // Card Body
                this.ctx.fillStyle = '#1e293b'; // Slate 800 (Solid but sleek)
                // Reduced corner radius
                this.ctx.beginPath();
                this.ctx.roundRect(cx - 120, cy - 80, 240, 160, 8);
                this.ctx.fill();

                // Text Hierarchy
                this.ctx.shadowBlur = 0; // Reset text shadow

                // Title: Semibold, Neutral
                this.ctx.fillStyle = '#f8fafc'; // Slate 50
                this.ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
                this.ctx.fillText("Flight Over", cx, cy - 30);

                // Secondary: Reframe Progress
                this.ctx.fillStyle = '#94a3b8'; // Slate 400
                this.ctx.font = '400 16px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';

                // "Passed the ruins" logic
                const score = Math.floor(this.world.distance / 100);
                let message = `You reached ${score}m`;
                if (score > 100) message = "You passed the First Ruins";
                if (score > 250) message = "You crossed the Canyon";

                this.ctx.fillText(message, cx, cy + 5);

                // Action: Visually tappable, no chrome
                this.ctx.fillStyle = '#38bdf8'; // Sky 400
                this.ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
                this.ctx.fillText("Tap to fly again", cx, cy + 50);
            }
        }

        // HUD: Combo Meter
        if (this.state === 'PLAYING' && this.combo > 0) {
            this.ctx.fillStyle = '#fbbf24'; // Amber (Gold)
            this.ctx.font = '700 32px system-ui';
            this.ctx.fillText(`${this.combo}x`, this.width - 50, 50);

            this.ctx.font = '400 14px system-ui';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText("FLOW", this.width - 50, 70);
        }

        this.ctx.restore();
    }
}
