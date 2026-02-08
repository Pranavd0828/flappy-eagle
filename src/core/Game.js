import { Input } from './Input.js';
import { Eagle } from '../entities/Eagle.js';
import { World } from '../entities/World.js';
import { PersonaSystem } from '../systems/PersonaSystem.js';
import { AudioSynth } from './AudioSynth.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.input = new Input();
        this.eagle = new Eagle(this);
        this.world = new World(this);
        this.persona = new PersonaSystem(this);
        this.audio = new AudioSynth();

        this.state = 'READY'; // READY, PLAY, OVER
        this.score = 0;
        this.lastTime = 0;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    }

    loop(t) {
        const dt = Math.min((t - this.lastTime) / 1000, 0.05);
        this.lastTime = t;

        this.update(dt);
        this.draw();

        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        if (this.state === 'READY') {
            this.eagle.y = this.height / 2 + Math.sin(Date.now() / 300) * 5;
            this.persona.update(dt); // Show vibe on ready screen too

            if (this.input.check()) {
                this.audio.init();
                this.state = 'PLAY';
                this.eagle.flap();
                this.audio.playFlap(this.persona.currentPersona);
            }
        }
        else if (this.state === 'PLAY') {
            const hitGround = this.eagle.update(dt);
            this.world.update(dt);
            this.persona.update(dt);

            if (this.input.check()) {
                this.eagle.flap();
                this.persona.onFlap();
                this.audio.playFlap(this.persona.currentPersona);
            }

            if (hitGround || this.world.checkCollision(this.eagle)) {
                this.state = 'OVER';
                this.audio.playCrash();
            }
        }
        else if (this.state === 'OVER') {
            if (this.eagle.y < this.height - 100 - this.eagle.radius) {
                this.eagle.update(dt);
            }
            this.persona.update(dt);

            if (this.input.check()) {
                this.reset();
            }
        }
    }

    reset() {
        this.state = 'READY';
        this.score = 0;
        this.eagle.reset();
        this.world.reset();
    }

    draw() {
        // Draw AI Background
        this.persona.draw(this.ctx);

        // Draw Game
        this.world.draw(this.ctx);
        this.eagle.draw(this.ctx);

        // UI
        this.ctx.textAlign = 'center';

        if (this.state === 'READY') {
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillRect(this.width / 2 - 150, this.height / 3 - 60, 300, 150);

            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 50px Arial';
            this.ctx.fillText('GET READY', this.width / 2, this.height / 3);

            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tap to Fly', this.width / 2, this.height / 3 + 50);
        }
        else if (this.state === 'PLAY') {
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 60px Arial';
            this.ctx.strokeText(this.score, this.width / 2, 100);
            this.ctx.fillText(this.score, this.width / 2, 100);
        }
        else if (this.state === 'OVER') {
            // Draw Dark Overlay for Readability
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 70% opacity black
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Game Over Text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 50px Arial';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 3);

            // Score
            this.ctx.font = '30px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 3 + 60);

            // AI Analysis Output (Multi-line)
            this.ctx.font = 'bold 18px monospace';
            this.ctx.fillStyle = '#facc15'; // Gold (Readable on black)

            const profile = this.persona.getPsychProfile();
            const lines = profile.split('\n');
            let lineY = this.height / 3 + 120;

            lines.forEach(line => {
                this.ctx.fillText(line, this.width / 2, lineY);
                lineY += 30;
            });

            this.ctx.fillStyle = '#cccccc';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tap to Restart', this.width / 2, lineY + 60);
        }
    }
}
