export class Eagle {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.x = this.game.width * 0.3;
        this.y = this.game.height / 2;
        this.velocity = 0;
        this.radius = 15;
    }

    flap() {
        this.velocity = -350; // Jump
    }

    update(dt) {
        this.velocity += 1200 * dt; // Gravity
        this.y += this.velocity * dt;

        // Floor Collision
        if (this.y + this.radius > this.game.height - 100) {
            this.y = this.game.height - 100 - this.radius;
            return true; // Hit ground
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Rotation based on velocity
        let rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1) * Math.PI / 180));
        ctx.rotate(rot);

        // Body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(6, -6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(8, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(-5, 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
