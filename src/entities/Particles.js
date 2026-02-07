export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }

    emit(x, y, type = 'feather', count = 5) {
        for (let i = 0; i < count; i++) {
            const p = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1.0, // Seconds
                type: type, // 'feather', 'dust', 'spark', 'speed_line', 'debris'
                color: '#fff',
                size: Math.random() * 4 + 2,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 10
            };

            // Specific initialization
            if (type === 'feather') {
                p.color = '#fbbf24';
            } else if (type === 'speed_line') {
                p.vx = -400 - Math.random() * 200; // Fast backward
                p.vy = 0;
                p.life = 0.3; // Short life
                p.size = Math.random() * 20 + 20; // Length
                p.color = 'rgba(255, 255, 255, 0.5)';
            } else if (type === 'debris') {
                p.color = '#475569'; // Rock color
                p.size = Math.random() * 8 + 4;
                p.life = 2.0;
            } else if (type === 'spark') {
                p.color = '#22d3ee'; // Cyan (Electric)
                p.size = Math.random() * 3 + 2;
                p.life = 0.5;
                p.vx = (Math.random() - 0.5) * 300;
                p.vy = (Math.random() - 0.5) * 300;
            } else if (type === 'rain') {
                p.color = '#a5f3fc'; // Cyan 200
                p.size = Math.random() * 10 + 10; // Length
                p.vy = 800 + Math.random() * 400; // Fast fall
                p.vx = -200; // Slight wind slant
                p.life = 1.5;
            } else if (type === 'snow') {
                p.color = '#fff';
                p.size = Math.random() * 3 + 1;
                p.vy = 50 + Math.random() * 50; // Slow fall
                p.vx = -150 - Math.random() * 100; // Wind
                p.life = 3.0;
            }

            this.particles.push(p);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === 'speed_line') {
                // No rotation
                p.x += p.vx * dt;
            } else if (p.type === 'rain') {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.rotation = 0.2; // Slant
            } else if (p.type === 'snow') {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.x += Math.sin(p.life * 5) * 1; // Sway
            } else {
                // Default Physics
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                p.rotation += p.rotSpeed * dt;
                // Gravity
                p.vy += 500 * dt;
                // Wind drag
                p.vx -= 100 * dt;
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);

            if (p.type === 'speed_line') {
                // No rotation for speed lines, horizontal
            } else {
                ctx.rotate(p.rotation);
            }

            ctx.globalAlpha = p.life; // Fade out
            ctx.fillStyle = p.color;

            if (p.type === 'feather') {
                // Simple leaf/feather shape
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'speed_line') {
                // Draw horizontal streak
                ctx.fillRect(0, -1, p.size, 2);
            } else if (p.type === 'rain') {
                // Rain drop (long thin line)
                ctx.globalAlpha = 0.6;
                ctx.fillRect(0, 0, 2, p.size);
            } else if (p.type === 'snow') {
                // Soft circle
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'debris') {
                // Jagged rock chunk
                ctx.beginPath();
                ctx.moveTo(-p.size / 2, -p.size / 2);
                ctx.lineTo(p.size / 2, -p.size / 3);
                ctx.lineTo(p.size / 3, p.size / 2);
                ctx.lineTo(-p.size / 2, p.size / 3);
                ctx.fill();
            } else {
                // Dust/Spark
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            ctx.restore();
        });
        ctx.globalAlpha = 1.0;
    }
}
