import { Input } from './Input.js';
import { Eagle } from '../entities/Eagle.js';
import { World } from '../entities/World.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.input = new Input();
        this.eagle = new Eagle(this);
        this.world = new World(this);

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
            // Hover eagle
            this.eagle.y = this.height / 2 + Math.sin(Date.now() / 300) * 5;

            if (this.input.check()) {
                this.state = 'PLAY';
                this.eagle.flap();
            }
        }
        else if (this.state === 'PLAY') {
            // Update Entities
            const hitGround = this.eagle.update(dt);
            this.world.update(dt);

            // Inputs
            if (this.input.check()) {
                this.eagle.flap();
            }

            // Collisions
            if (hitGround || this.world.checkCollision(this.eagle)) {
                this.state = 'OVER';
            }
        }
        else if (this.state === 'OVER') {
            // Fall to ground
            if (this.eagle.y < this.height - 100 - this.eagle.radius) {
                this.eagle.update(dt);
            }

            // Restart
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
        // Clear
        this.ctx.fillStyle = '#70c5ce';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Game
        this.world.draw(this.ctx);
        this.eagle.draw(this.ctx);

        // Draw UI
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';

        if (this.state === 'READY') {
            this.ctx.font = '50px Arial';
            this.ctx.strokeText('GET READY', this.width / 2, this.height / 3);
            this.ctx.fillText('GET READY', this.width / 2, this.height / 3);
            this.ctx.font = '30px Arial';
            this.ctx.fillText('Tap to Fly', this.width / 2, this.height / 3 + 50);
        }
        else if (this.state === 'PLAY') {
            this.ctx.font = '60px Arial';
            this.ctx.strokeText(this.score, this.width / 2, 100);
            this.ctx.fillText(this.score, this.width / 2, 100);
        }
        else if (this.state === 'OVER') {
            this.ctx.font = '50px Arial';
            this.ctx.strokeText('GAME OVER', this.width / 2, this.height / 3);
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 3);
            this.ctx.font = '30px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 3 + 60);
            this.ctx.fillText('Tap to Restart', this.width / 2, this.height / 3 + 120);
        }
    }
}
