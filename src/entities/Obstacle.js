export class Obstacle {
    constructor(game, x, gapY, gapHeight) {
        this.game = game;
        this.x = x;
        this.gapY = gapY; // Center Y of the gap
        this.gapHeight = gapHeight;
        this.width = 90; // Slightly wider for block look
        this.markedForDeletion = false;
        this.color = null; // Set by World
        this.grazed = false;
    }

    update(dt, speed) {
        this.x -= speed * dt;

        if (this.x + this.width + 100 < 0) { // Buffer for wide blocks
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        // Main Pillar Color
        const baseColor = this.color || '#1e293b';
        ctx.fillStyle = baseColor;

        // Draw Top Pillar
        const topHeight = this.gapY - (this.gapHeight / 2);
        this.drawPillar(ctx, this.x, 0, this.width, topHeight, true);

        // Draw Bottom Pillar
        const bottomY = this.gapY + (this.gapHeight / 2);
        const bottomHeight = this.game.height - bottomY;
        this.drawPillar(ctx, this.x, bottomY, this.width, bottomHeight, false);
    }

    drawPillar(ctx, x, y, w, h, isTop) {
        // "Stacked Stone" Look
        const blockSize = 40;
        const blocks = Math.ceil(h / blockSize);

        for (let i = 0; i < blocks; i++) {
            let currentY, currentH;

            if (isTop) {
                // Top pillar: draw from bottom up so the "ragged" end is at the gap
                currentY = y + h - ((i + 1) * blockSize);
                currentH = blockSize;
                // Clip start
                if (currentY < y) {
                    currentH -= (y - currentY);
                    currentY = y;
                }
            } else {
                // Bottom pillar: draw from top down
                currentY = y + (i * blockSize);
                currentH = blockSize;
                // Clip end
                if (currentY + currentH > y + h) {
                    currentH = y + h - currentY;
                }
            }

            // Randomize X slightly for "ancient" look
            // Use pseudo-random based on position so it doesn't jitter every frame
            const seed = (Math.floor(x) + i * 10);
            const offsetX = (seed % 7) - 3;

            // Draw Block
            ctx.fillStyle = this.color;
            ctx.fillRect(x + offsetX, currentY, w, currentH);

            // 3D Highlight (Left/Top)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(x + offsetX, currentY, 4, currentH); // Left highlight
            ctx.fillRect(x + offsetX, currentY, w, 4); // Top highlight

            // 3D Shadow (Right/Bottom)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(x + offsetX + w - 4, currentY, 4, currentH); // Right shadow
            ctx.fillRect(x + offsetX, currentY + currentH - 4, w, 4); // Bottom shadow

            // Gap End Decoration (The "broken" part)
            // Just add a dark band at the gap edge
            if (isTop) {
                if (i === 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.fillRect(x + offsetX + 5, currentY + currentH - 8, w - 10, 8);
                }
            } else {
                if (i === 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.fillRect(x + offsetX + 5, currentY, w - 10, 8);
                }
            }
        }
    }

    checkCollision(eagle) {
        // Simple AABB for now, but sensitive to the "gap"
        // Check if eagle is within the horiz range
        if (eagle.x + eagle.width > this.x && eagle.x < this.x + this.width) {
            // Check vertical: if ABOVE top of gap OR BELOW bottom of gap
            const topEdge = this.gapY - (this.gapHeight / 2);
            const bottomEdge = this.gapY + (this.gapHeight / 2);

            // Use efficient hitbox (slightly smaller than visual)
            const hitMargin = 10;

            if (eagle.y + hitMargin < topEdge || eagle.y + eagle.height - hitMargin > bottomEdge) {
                return true;
            }
        }
        return false;
    }

    checkGraze(eagle) {
        if (this.grazed) return false;

        // Graze distance (pixels)
        const grazeMargin = 50;

        // Check if we are passing the obstacle
        if (eagle.x + eagle.width > this.x && eagle.x < this.x + this.width) {

            const topY = this.gapY - (this.gapHeight / 2);
            const bottomY = this.gapY + (this.gapHeight / 2);

            // Check if we are CLOSE to top or bottom but NOT colliding
            const distToTop = eagle.y - topY;
            const distToBottom = bottomY - (eagle.y + eagle.height);

            // We want to be within [0, grazeMargin] of the gap edges (inside buffer)
            // Note: Collisions are handled separately. If we didn't collide, we are inside the gap.
            // So distToTop > 0 and distToBottom > 0 usually, unless we are perfectly aligned or colliding.

            // "Graze" means getting close to the dangers
            if (Math.abs(distToTop) < grazeMargin || Math.abs(distToBottom) < grazeMargin) {
                this.grazed = true;
                return true;
            }
        }
        return false;
    }
}
