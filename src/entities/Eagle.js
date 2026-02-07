export class Eagle {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        this.reset();

        // Physics Constants (Heavier feel from requirements)
        this.GRAVITY = 1800;
        this.FLAP_FORCE = -600; // Increased for drag compensation
        this.TERMINAL_VELOCITY = 1000;

        // Visual constants
        this.wingState = 0;
    }

    reset() {
        this.x = this.game.width * 0.3; // 30% from left
        this.y = this.game.height * 0.4;
        this.velocity = 0;
        this.rotation = 0;
        this.isDead = false;
        this.wingState = 0;
    }

    flap() {
        if (this.isDead) return;
        this.velocity = this.FLAP_FORCE;
        // Kick rotation up
        this.rotation = -25 * (Math.PI / 180);
    }

    update(dt) {
        // Dive Mechanic:
        // If holding input and falling, fall faster and rotate sharper
        let currentGravity = this.GRAVITY;
        let isDiving = false;

        if (this.game.input.isDown && this.velocity > 0) {
            currentGravity *= 2.5; // Heavy dive
            isDiving = true;
        }

        // Apply Gravity
        this.velocity += currentGravity * dt;

        // Apply Drag (Air Resistance)
        // Drag increases with speed squared usually, but linear drag feels better for control
        // Drag coeff = 0.5
        const dragCoeff = 0.8;
        this.velocity -= this.velocity * dragCoeff * dt;

        // Terminal Velocity (Scanning cap still good for sanity)
        let terminal = this.TERMINAL_VELOCITY;
        if (isDiving) terminal *= 2.0;

        if (this.velocity > terminal) {
            this.velocity = terminal;
        }

        // Apply Velocity
        this.y += this.velocity * dt;

        // Rotation Logic (Heavier feel)
        // If rising, tilt up quickly. If falling, tilt down slowly then fast.
        if (this.velocity < 0) {
            // Rising
            this.rotation = Math.max(-25 * (Math.PI / 180), this.rotation - (5 * dt));
        } else {
            // Falling
            // If diving, rotate VERY fast to vertical
            let rotSpeed = 3;
            if (isDiving) rotSpeed = 10;

            if (this.rotation < 90 * (Math.PI / 180)) {
                this.rotation += rotSpeed * dt;
            }
        }

        // Animation State Logic (Ticker)
        this.wingState += dt * 10;

        // Floor Collision
        if (this.y + this.height > this.game.height) {
            this.y = this.game.height - this.height;
            this.velocity = 0;
        }

        // Ceiling Collision
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y); // Pivot at center
        ctx.rotate(this.rotation);

        const scale = 0.6; // Adjust global size
        ctx.scale(scale, scale);

        // Colors (Predator Palette)
        const cols = {
            bodyDark: '#78350f', // Amber 900
            bodyLight: '#b45309', // Amber 700
            beak: '#fbbf24', // Amber 400
            eye: '#ffffff',
            primary: '#451a03', // Darkest brown
        };

        if (this.isDead) {
            // DEATH STATE: Wings collapsed, rigid
            this.drawEagleBody(ctx, cols);
            this.drawWingsCollapsed(ctx, cols);
        } else {
            // LIVING STATE
            this.drawEagleBody(ctx, cols);

            // Wing Logic
            if (this.velocity < -100) {
                // Rising: Powerful stroke
                const flapCycle = Math.sin(Date.now() / 80);
                this.drawWingsFlying(ctx, cols, flapCycle);
            } else if (this.game.input.isDown && this.velocity > 200) {
                // DIVING: Tucked wings
                this.drawWingsTucked(ctx, cols);
            } else {
                // Gliding / Falling
                let tremble = 0;
                if (this.velocity > 400) { // Fast fall
                    tremble = (Math.random() - 0.5) * 5;
                }
                this.drawWingsGliding(ctx, cols, tremble);
            }
        }

        ctx.restore();
    }

    drawEagleBody(ctx, c) {
        // Main Body - elongated, heavy chest
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head - "Head silhouette must be clearly hooked beak"
        ctx.fillStyle = c.bodyLight;
        ctx.beginPath();
        ctx.arc(15, -8, 12, 0, Math.PI * 2);
        ctx.fill();

        // Beak - Hooked
        ctx.fillStyle = c.beak;
        ctx.beginPath();
        ctx.moveTo(25, -8);
        ctx.lineTo(35, -2); // Tip
        ctx.lineTo(25, 4);  // Jaw
        ctx.quadraticCurveTo(22, -2, 25, -8);
        ctx.fill();

        // Eye - Sharp predator focus
        ctx.fillStyle = c.eye;
        ctx.beginPath();
        ctx.arc(18, -10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(19, -10, 1.5, 0, Math.PI * 2); // Pupil forward
        ctx.fill();

        // Brow ridge (angry look)
        ctx.strokeStyle = c.bodyDark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, -14);
        ctx.lineTo(22, -11);
        ctx.stroke();
    }

    drawWingsFlying(ctx, c, cycle) {
        // cycle -1 to 1
        const wingY = cycle * 20;

        ctx.fillStyle = c.primary;
        // Far Wing (behind)
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(-20, -40 + wingY * 0.5);
        ctx.lineTo(40, -30 + wingY); // Tip
        ctx.lineTo(10, -5);
        ctx.fill();

        // Near Wing (Front)
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-25, -50 + wingY * 0.8);
        ctx.lineTo(50, -40 + wingY * 1.2); // Long span
        // Finger feathers
        ctx.lineTo(45, -35 + wingY);
        ctx.lineTo(48, -30 + wingY);
        ctx.lineTo(15, 5);
        ctx.fill();
    }

    drawWingsGliding(ctx, c, tremble) {
        ctx.fillStyle = c.primary;
        // Far Wing
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(50, -25 + tremble);
        ctx.lineTo(10, -5);
        ctx.fill();

        // Near Wing
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        // Wide span (2.5x body width approx)
        ctx.lineTo(70, -30 + tremble);

        // Trailing edge with fingers
        ctx.lineTo(60, -20 + tremble);
        ctx.lineTo(65, -15 + tremble);
        ctx.lineTo(15, 5);
        ctx.fill();
    }

    drawWingsCollapsed(ctx, c) {
        // Folded in death
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-10, -15);
        ctx.lineTo(10, 10);
        ctx.fill();
    }

    drawWingsTucked(ctx, c) {
        // Streamlined for diving
        ctx.fillStyle = c.primary;
        // Tucked against body
        ctx.beginPath();
        ctx.moveTo(10, -5);
        ctx.lineTo(-10, -10); // Back
        ctx.lineTo(-20, 0);   // Tip back
        ctx.lineTo(15, 5);    // Front
        ctx.fill();

        // Second wing (visible slightly)
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-12, -5);
        ctx.lineTo(-22, 5);
        ctx.lineTo(15, 8);
        ctx.fill();
    }
}
