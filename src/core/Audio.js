export class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.windGain = null;
        this.windOsc = null;
        this.musicNodes = [];
        this.initialized = false;
        this.musicPlaying = false;
    }

    async init() {
        if (this.initialized) return;

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        // --- Wind Sfx (Pink Noise approximation) ---
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        this.windOsc = this.ctx.createBufferSource();
        this.windOsc.buffer = noiseBuffer;
        this.windOsc.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.value = 400;

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0;

        this.windOsc.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.ctx.destination);

        this.windOsc.start();
        this.initialized = true;
    }

    startMusic() {
        if (!this.initialized || this.musicPlaying) return;
        this.musicPlaying = true;

        // Ambient Drone (Tense)
        const createDrone = (freq, type, pan) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const panner = this.ctx.createStereoPanner();

            osc.type = type;
            osc.frequency.value = freq;

            gain.gain.value = 0; // fade in

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.ctx.destination);
            panner.pan.value = pan;

            osc.start();

            // Fade in
            gain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 2);

            return { osc, gain };
        };

        // Low drone C2
        this.musicNodes.push(createDrone(65.41, 'triangle', -0.5));
        // Detuned C2
        this.musicNodes.push(createDrone(65.00, 'sine', 0.5));
    }

    stopMusic() {
        if (!this.musicPlaying) return;
        this.musicNodes.forEach(node => {
            node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
            node.osc.stop(this.ctx.currentTime + 0.5);
        });
        this.musicNodes = [];
        this.musicPlaying = false;
    }

    updateWind(speedRatio) {
        if (!this.initialized) return;
        const targetGain = 0.1 + (speedRatio * 0.2);
        const targetFreq = 400 + (speedRatio * 1000);

        this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
        this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }

    setWeather(type) {
        if (!this.initialized) return;

        if (type === 'rain') {
            this.startRain();
            // Increase wind base
            this.windGain.gain.setTargetAtTime(0.2, this.ctx.currentTime, 1);
        } else {
            this.stopRain();
        }
    }

    startRain() {
        if (this.rainNode) return;

        // Brown noise for rain
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const rainSrc = this.ctx.createBufferSource();
        rainSrc.buffer = buffer;
        rainSrc.loop = true;

        const rainGain = this.ctx.createGain();
        rainGain.gain.value = 0;

        rainSrc.connect(rainGain);
        rainGain.connect(this.ctx.destination);

        rainSrc.start();

        // Fade in
        rainGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 2);

        this.rainNode = { src: rainSrc, gain: rainGain };
    }

    stopRain() {
        if (!this.rainNode) return;
        this.rainNode.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 1);
        this.rainNode.src.stop(this.ctx.currentTime + 1);
        this.rainNode = null;
    }

    playFlap() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playScreech() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        // High pitch slide
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.4);

        // Filter to take edge off
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    playImpact() {
        if (!this.initialized) return;

        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playGraze() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime); // High pitch
        osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playSoar() {
        if (!this.initialized) return;

        // Cinematic boom/whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 1.0); // Riserrr

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 2.0);
    }
}
