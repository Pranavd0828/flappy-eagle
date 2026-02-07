import { Obstacle } from './Obstacle.js';

export class World {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.speed = 250;
        this.speedMultiplier = 1.0; // Modifier for Soar State
        this.spawnTimer = 0;
        this.spawnInterval = 2.5;

        this.distance = 0;
    }

    update(dt) {
        // Move obstacles
        // Increase base speed over distance?
        const currentSpeed = (this.speed + (this.distance * 0.05)) * this.speedMultiplier;

        this.distance += currentSpeed * dt * 0.01; // Fake meters

        // Only spawn if game is playing
        if (this.game.state === 'PLAYING') {
            this.spawnTimer += dt;
            // Adjusted interval
            const adjustedInterval = this.spawnInterval / this.speedMultiplier;

            if (this.spawnTimer >= adjustedInterval) {
                this.spawnObstacle();
                this.spawnTimer = 0;
            }
        } else if (this.game.state === 'INTRO') {
            this.spawnTimer = 0;
        }

        // Update Obstacles
        this.obstacles.forEach(ob => ob.update(dt, currentSpeed));

        // Cull off-screen
        this.obstacles = this.obstacles.filter(ob => !ob.markedForDeletion);
    }

    spawnObstacle() {
        const minGapY = 150;
        const maxGapY = this.game.height - 150;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        const gapHeight = 220;

        const obstacle = new Obstacle(
            this.game,
            this.game.width,
            gapY,
            gapHeight
        );

        // Inherit biome color
        if (this.game.biomeManager && this.game.biomeManager.biomes) {
            // Use interpolated color if available
            if (this.game.biomeManager.currentObstacleColor) {
                obstacle.color = this.game.biomeManager.currentObstacleColor;
            } else {
                const currentBiome = this.game.biomeManager.currentBiome;
                obstacle.color = this.game.biomeManager.biomes[currentBiome].obstacleColor;
            }
        }

        this.obstacles.push(obstacle);
    }

    draw(ctx) {
        this.obstacles.forEach(ob => ob.draw(ctx));
    }

    checkCollisions(eagle) {
        for (const ob of this.obstacles) {
            if (ob.checkCollision(eagle)) {
                return true;
            }
        }
        return false;
    }

    checkGrazes(eagle) {
        let count = 0;
        for (const ob of this.obstacles) {
            if (ob.checkGraze(eagle)) {
                count++;
            }
        }
        return count;
    }
}
