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

        // Rotation
        // Clamp for snappy feel
        let rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1) * Math.PI / 180));
        ctx.rotate(rot);

        // --- Visual Update for "Eagle" Feel ---

        // 5. Color Hierarchy
        const bodyColor = '#eab308'; // Muted Gold (Serious)
        const beakColor = '#f97316'; // Orange Accent
        const wingColor = '#ca8a04'; // Darker Gold (Hint)
        const outlineColor = '#422006'; // Dark Brown Outline

        ctx.lineWidth = 2;
        ctx.strokeStyle = outlineColor;

        // 4. Squashed Body (Ovoid)
        // Squash vertical by ~8% (0.92) for organic feel
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. Eye Shape & Position
        // Offset forward (+6), slightly oval (5x6)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(6, -6, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupil (Sharp/Intense - Smaller and forward)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(8, -6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 1. Beak Cue (Directionality)
        // Triangular wedge, starting from face, slightly hooked down
        ctx.fillStyle = beakColor;
        ctx.beginPath();
        ctx.moveTo(this.radius - 2, 2); // Start near edge of face
        ctx.lineTo(this.radius + 6, 4); // Tip out
        ctx.lineTo(this.radius - 2, 8); // Bottom/Hook point
        ctx.lineTo(this.radius - 2, 2); // Close
        ctx.fill();
        ctx.stroke();

        // 3. Wing Hint (Not a full wing)
        // Curved crescent on side, rotates with body (no animation)
        ctx.fillStyle = wingColor;
        ctx.beginPath();
        ctx.ellipse(-4, 4, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
