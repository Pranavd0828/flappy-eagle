export class World {
    constructor(game) {
        this.game = game;
        this.pipes = [];
        this.timer = 0;
        this.gap = 160;
        this.pipeWidth = 60;
    }

    reset() {
        this.pipes = [];
        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
        if (this.timer > 1.8) {
            this.spawn();
            this.timer = 0;
        }

        this.pipes.forEach(p => p.x -= 150 * dt);
        this.pipes = this.pipes.filter(p => p.x + this.pipeWidth > 0);
    }

    spawn() {
        const minH = 50;
        const available = this.game.height - 100 - this.gap - (minH * 2);
        const topH = minH + Math.random() * available;

        this.pipes.push({
            x: this.game.width,
            topH: topH,
            passed: false
        });
    }

    checkCollision(eagle) {
        for (let p of this.pipes) {
            // Check X intersection
            if (eagle.x + eagle.radius > p.x && eagle.x - eagle.radius < p.x + this.pipeWidth) {
                // Check Y intersection (hit top pipe OR hit bottom pipe)
                if ((eagle.y - eagle.radius < p.topH) ||
                    (eagle.y + eagle.radius > p.topH + this.gap)) {
                    return true;
                }
            }

            // Score
            if (!p.passed && eagle.x > p.x + this.pipeWidth) {
                p.passed = true;
                this.game.score++;
            }
        }
        return false;
    }

    draw(ctx) {
        // Pipes
        ctx.fillStyle = '#5a9e27'; // Slightly darker/warmer green
        ctx.strokeStyle = '#2f5e1b';
        ctx.lineWidth = 2;

        this.pipes.forEach(p => {
            // Top Pipe
            ctx.fillRect(p.x, 0, this.pipeWidth, p.topH);
            ctx.strokeRect(p.x, 0, this.pipeWidth, p.topH);

            // Bottom Pipe
            const botY = p.topH + this.gap;
            const botH = this.game.height - 100 - botY;
            ctx.fillRect(p.x, botY, this.pipeWidth, botH);
            ctx.strokeRect(p.x, botY, this.pipeWidth, botH);
        });

        // Ground
        ctx.fillStyle = '#ded895';
        ctx.fillRect(0, this.game.height - 100, this.game.width, 100);
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(0, this.game.height - 100, this.game.width, 10);
    }
}
