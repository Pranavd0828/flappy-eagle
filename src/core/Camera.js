export class Camera {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.shakeStrength = 0;
        this.targetZoom = 1;
        this.baseScale = 1; // Default
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.shakeStrength = 0;
        this.targetZoom = 1;
    }

    shake(amount) {
        this.shakeStrength = amount;
    }

    update(dt) {
        // Smooth Zoom
        // Logic: specific to eagle state passed via game.eagle
        if (this.game.eagle) {
            // Dive Logic: Zoom out if falling fast
            if (this.game.eagle.velocity > 400) {
                this.targetZoom = 0.9; 
            } else if (this.game.eagle.velocity < -200) {
                this.targetZoom = 1.05; // Zoom in slightly on climb
            } else {
                this.targetZoom = 1.0;
            }
        }

        // Lerp zoom
        this.zoom += (this.targetZoom - this.zoom) * 2.0 * dt;

        // Shake decay
        if (this.shakeStrength > 0) {
            this.shakeStrength -= 30 * dt;
            if (this.shakeStrength < 0) this.shakeStrength = 0;
        }

        // Vertical panning (Lookahead)
        // If eagle is high, look up? 
        // Actually, just center the view vertically better?
        // Since eagle Y changes, maybe we just want to keep the eagle slightly above center?
        // Current Game: Eagle starts at height * 0.4.
        // Let's allow the camera to track Y loosely.
        const targetY = (this.game.eagle.y - this.game.height * 0.4) * 0.3; // Parallax-ish vertical follow
        this.y += (targetY - this.y) * 2.0 * dt;
    }

    apply(ctx) {
        const cx = this.game.width / 2;
        const cy = this.game.height / 2;

        ctx.translate(cx, cy);
        ctx.scale(this.zoom, this.zoom);
        
        // Shake
        if (this.shakeStrength > 0) {
            const dx = (Math.random() - 0.5) * this.shakeStrength;
            const dy = (Math.random() - 0.5) * this.shakeStrength;
            ctx.translate(dx, dy);
        }

        // Pan
        ctx.translate(-cx, -cy - this.y); 
        // Note: -this.y moves the world UP if y is positive (tracking down)
    }
}
