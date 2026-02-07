export class Background {
    constructor(game) {
        this.game = game;
        this.layers = [
            { speed: 0.2, yOffset: 0, elements: [] },  // Far (Clouds/Mountains)
            { speed: 0.5, yOffset: 50, elements: [] }, // Mid (Distant Ruins/Hills)
            { speed: 1.0, yOffset: 0, elements: [] }   // Near (just behind obstacles - Atmospheric fog?)
        ];

        // Seed initial elements
        this.populateLayer(0, 10);
        this.populateLayer(1, 5);
    }

    populateLayer(layerIndex, count) {
        const layer = this.layers[layerIndex];
        for (let i = 0; i < count; i++) {
            layer.elements.push({
                x: Math.random() * this.game.width * 2,
                y: Math.random() * this.game.height * 0.6 + layer.yOffset,
                width: 100 + Math.random() * 300,
                height: 50 + Math.random() * 100,
                type: Math.random() > 0.5 ? 'cloud' : 'peak'
            });
        }
    }

    update(dt, worldSpeed) {
        this.layers.forEach(layer => {
            const moveSpeed = worldSpeed * layer.speed;

            layer.elements.forEach(el => {
                el.x -= moveSpeed * dt;

                // Wrap around
                if (el.x + el.width < -100) {
                    el.x = this.game.width + Math.random() * 200;
                    el.y = Math.random() * this.game.height * 0.6 + layer.yOffset;
                }
            });
        });
    }

    draw(ctx) {
        this.layers.forEach((layer, index) => {
            // Color based on depth
            // Far = paler, Mid = clearer
            if (index === 0) ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Very faint
            if (index === 1) ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            if (index === 2) ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

            layer.elements.forEach(el => {
                if (el.type === 'cloud') {
                    this.drawCloud(ctx, el);
                } else {
                    this.drawPeak(ctx, el);
                }
            });
        });
    }

    drawCloud(ctx, el) {
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.height / 2, 0, Math.PI * 2);
        ctx.arc(el.x + 40, el.y - 10, el.height / 2 * 1.2, 0, Math.PI * 2);
        ctx.arc(el.x + 80, el.y, el.height / 2 * 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPeak(ctx, el) {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y + el.height);
        ctx.lineTo(el.x + el.width / 2, el.y); // Peak
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.fill();
    }
}
