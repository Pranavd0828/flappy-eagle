export class BiomeManager {
    constructor(game) {
        this.game = game;
        this.currentBiome = 'dawn';
        this.transitionFactor = 0; // 0 to 1

        this.biomes = {
            dawn: {
                bg: '#cbd5e1', // Slate 300
                obstacleColor: '#1e293b', // Slate 800
                name: 'Early Sketch'
            },
            noon: {
                bg: '#7dd3fc', // Sky 300
                obstacleColor: '#0c4a6e', // Sky 900
                name: 'Open Sky'
            },
            dusk: {
                bg: '#fca5a5', // Red 300
                obstacleColor: '#450a0a', // Red 950
                name: 'Twilight'
            }
        };

        this.weather = 'clear';
        this.weatherTimer = 0;
    }

    update(dt, distance) {
        // Cycle length in meters
        const dayLength = 1000;
        const cycleProgress = (distance % dayLength) / dayLength;

        // 0.0 - 0.33: Dawn
        // 0.33 - 0.66: Noon
        // 0.66 - 1.0: Dusk

        let targetBiome;
        let nextBiome;
        let t;

        if (cycleProgress < 0.33) {
            this.currentBiome = 'dawn';
            targetBiome = this.biomes.dawn;
            nextBiome = this.biomes.noon;
            t = cycleProgress / 0.33;
        } else if (cycleProgress < 0.66) {
            this.currentBiome = 'noon';
            targetBiome = this.biomes.noon;
            nextBiome = this.biomes.dusk;
            t = (cycleProgress - 0.33) / 0.33;
        } else {
            this.currentBiome = 'dusk';
            targetBiome = this.biomes.dusk;
            nextBiome = this.biomes.dawn; // Loop back
            t = (cycleProgress - 0.66) / 0.33;
        }

        // Interpolate Background
        this.currentBg = this.lerpColor(targetBiome.bg, nextBiome.bg, t);

        // Interpolate Obstacle Color (Store it for World to use)
        this.currentObstacleColor = this.lerpColor(targetBiome.obstacleColor, nextBiome.obstacleColor, t);

        // Weather Cycle
        this.updateWeather(dt);
    }

    updateWeather(dt) {
        this.weatherTimer -= dt;
        if (this.weatherTimer <= 0) {
            // Change Weather
            const rand = Math.random();
            if (rand < 0.5) this.weather = 'clear';
            else if (rand < 0.8) this.weather = 'rain';
            else this.weather = 'snow';

            this.weatherTimer = 10 + Math.random() * 20; // 10-30s duration
            console.log("Weather Change:", this.weather);
        }

        // Spawn Weather Particles
        if (this.weather === 'rain') {
            // High frequency spawns
            if (Math.random() < 0.8) {
                // Spawn line at top, random X
                const x = Math.random() * this.game.width;
                this.game.particles.emit(x, -50, 'rain', 1);
            }
        } else if (this.weather === 'snow') {
            if (Math.random() < 0.3) {
                const x = Math.random() * (this.game.width + 200); // Spans offscreen
                this.game.particles.emit(x, -50, 'snow', 1);
            }
        }

        // Update Audio Ambience
        this.game.audio.setWeather(this.weather);
    }

    // Helper: Linear Interpolation for Hex Colors
    lerpColor(a, b, amount) {
        var ah = parseInt(a.replace(/#/g, ''), 16),
            ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
            bh = parseInt(b.replace(/#/g, ''), 16),
            br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);

        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }

    getBackgroundColor() {
        return this.currentBg || this.biomes.dawn.bg;
    }
}
