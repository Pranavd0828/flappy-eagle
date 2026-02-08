export class PersonaSystem {
    constructor(game) {
        this.game = game;

        // Data Collection
        this.flaps = [];
        this.altitudes = [];
        this.pipePasses = 0;
        this.lastAnalysisTime = 0;

        // State
        this.currentPersona = 'STOIC'; // STOIC, ACE, PANIC
        this.confidence = 0;
        this.diving = false;

        // Visuals
        this.particles = [];
        this.messages = [];

        // Color State (Lerping)
        this.currentSkyTop = [112, 197, 206]; // #70c5ce
        this.currentSkyBot = [255, 255, 255]; // #ffffff
        this.targetSkyTop = [112, 197, 206];
        this.targetSkyBot = [255, 255, 255];
        this.particleColor = 'rgba(255,255,255,0.4)';
        this.particleType = 'float';
    }

    onFlap() {
        if (this.game.state === 'OVER') return;

        const now = Date.now();
        this.flaps.push(now);
        // Keep last 10 seconds of data
        const cutoff = now - 10000;
        this.flaps = this.flaps.filter(t => t > cutoff);

        this.analyze(now);
    }

    update(dt) {
        if (this.game.state === 'OVER') {
            // Freeze Analysis, just update visuals
            this.updateVisuals(dt);
            return;
        }

        // Track altitude variance
        this.altitudes.push(this.game.eagle.y);
        if (this.altitudes.length > 600) this.altitudes.shift();

        // Analyze periodically 
        if (Date.now() - this.lastAnalysisTime > 1000) {
            this.analyze(Date.now());
        }

        this.updateVisuals(dt);
        this.checkMicroEvents();

        // Update Messages
        this.messages.forEach(m => {
            m.life -= dt;
            m.y -= 20 * dt; // Float up
        });
        this.messages = this.messages.filter(m => m.life > 0);
    }

    checkMicroEvents() {
        // 1. Graze Detection (Close but safe)
        const eagle = this.game.eagle;
        this.game.world.pipes.forEach(p => {
            if (eagle.x + eagle.radius > p.x && eagle.x - eagle.radius < p.x + 60) {
                const distTop = Math.abs(eagle.y - eagle.radius - p.topH);
                const botY = p.topH + 160;
                const distBot = Math.abs(eagle.y + eagle.radius - botY);

                if ((distTop < 15 || distBot < 15) && !p.grazed) {
                    p.grazed = true;
                    // Commentary removed
                }
            }
        });

        // 2. Dive Detection
        if (eagle.velocity > 400 && !this.diving) {
            this.diving = true;
            // Commentary removed
        }
        if (eagle.velocity < 0) this.diving = false;
    }

    addComment(text) {
        // Function kept for future use, but currently unused
        this.messages.push({
            text: text,
            x: this.game.eagle.x + 20,
            y: this.game.eagle.y - 20,
            life: 1.5,
            alpha: 1.0
        });
    }

    getPsychProfile() {
        const avgY = this.altitudes.reduce((a, b) => a + b, 0) / this.altitudes.length;
        const screenPct = avgY / this.game.height;

        let profile = "";

        if (this.game.score < 2) return "Analysis incomplete.\nSubject hesitation detected.";

        if (this.currentPersona === 'STOIC') {
            profile = "Subject exhibits high efficiency.\nMinimalist. Calm. In flow.";
        } else if (this.currentPersona === 'ACE') {
            profile = "Subject thrives on risk.\nHigh precision inputs detected.";
        } else {
            profile = "Subject unstable.\nErratic rhythm detected. Recommendation: Breathe.";
        }

        if (screenPct < 0.3) profile += "\nPreference for high altitude indicating avoidance.";
        else if (screenPct > 0.7) profile += "\nPreference for low altitude indicating grounding.";

        return profile;
    }

    analyze(now) {
        this.lastAnalysisTime = now;

        const flapsPerSecond = this.flaps.length / 10;
        const meanY = this.altitudes.reduce((a, b) => a + b, 0) / this.altitudes.length || 0;
        const variance = this.altitudes.reduce((a, b) => a + Math.pow(b - meanY, 2), 0) / this.altitudes.length || 0;
        const stdDev = Math.sqrt(variance);

        let newPersona = 'STOIC';

        if (flapsPerSecond > 2.5 || stdDev > 150) {
            newPersona = 'PANIC';
        } else if (this.game.score > 5 && flapsPerSecond > 1.5) {
            newPersona = 'ACE';
        } else {
            newPersona = 'STOIC';
        }

        if (this.currentPersona !== newPersona) {
            this.currentPersona = newPersona;
            this.updateTheme();
        }
    }

    updateTheme() {
        switch (this.currentPersona) {
            case 'STOIC':
                // Neutral Blue
                this.targetSkyTop = [125, 211, 252]; // Sky Blue 300
                this.targetSkyBot = [224, 242, 254]; // Sky Blue 100
                this.particleColor = 'rgba(255,255,255,0.4)';
                this.particleType = 'float';
                break;
            case 'ACE':
                // Faded Slate/Purple (Pastel)
                this.targetSkyTop = [71, 85, 105];   // Slate 600
                this.targetSkyBot = [192, 132, 252]; // Purple 400
                this.particleColor = '#a78bfa';      // Violet 400
                this.particleType = 'spark';
                break;
            case 'PANIC':
                // Faded Warm/Orange (Pastel)
                this.targetSkyTop = [120, 53, 15];   // Brown/Red Faded
                this.targetSkyBot = [251, 146, 60];  // Orange 400
                this.particleColor = '#fdba74';      // Orange 300
                this.particleType = 'static';
                break;
        }
    }

    lerpColor(current, target, dt) {
        const speed = 2.0; // Smooth speed
        return [
            current[0] + (target[0] - current[0]) * dt * speed,
            current[1] + (target[1] - current[1]) * dt * speed,
            current[2] + (target[2] - current[2]) * dt * speed
        ];
    }

    updateVisuals(dt) {
        // Smooth Color Transition
        this.currentSkyTop = this.lerpColor(this.currentSkyTop, this.targetSkyTop, dt);
        this.currentSkyBot = this.lerpColor(this.currentSkyBot, this.targetSkyBot, dt);

        // Spawn Particles based on theme
        if (Math.random() < 0.1) {
            const p = {
                x: this.game.width,
                y: Math.random() * this.game.height,
                vx: -100 - Math.random() * 200,
                vy: (Math.random() - 0.5) * 50,
                life: 1.0,
                color: this.particleColor
            };

            if (this.particleType === 'spark') {
                p.vx = -400;
                p.life = 0.5;
            } else if (this.particleType === 'static') {
                p.vx = -1000;
                p.x = Math.random() * this.game.width;
                p.life = 0.1;
            }

            this.particles.push(p);
        }

        // Move
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });

        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw(ctx) {
        // Draw Gradient Background using Lerped Colors
        const grad = ctx.createLinearGradient(0, 0, 0, this.game.height);

        const c1 = this.currentSkyTop.map(Math.round);
        const c2 = this.currentSkyBot.map(Math.round);

        grad.addColorStop(0, `rgb(${c1[0]}, ${c1[1]}, ${c1[2]})`);
        grad.addColorStop(1, `rgb(${c2[0]}, ${c2[1]}, ${c2[2]})`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // Draw Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            if (this.particleType === 'static') {
                ctx.fillRect(p.x, p.y, Math.random() * 20, 2);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw Commentary
        ctx.font = 'bold 16px monospace';
        this.messages.forEach(m => {
            ctx.fillStyle = `rgba(255, 255, 255, ${m.life})`;
            ctx.fillText(m.text, m.x, m.y);
        });
    }
}
