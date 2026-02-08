export class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.master.gain.value = 0.3;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.ctx.resume();
        this.initialized = true;
    }

    playTone(type, freq, decay, vol = 1) {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type; // 'sine', 'sawtooth', 'triangle', 'square'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + decay);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + decay);
    }

    // Archetype Sounds
    playFlap(persona) {
        if (!this.initialized) return;
        switch (persona) {
            case 'STOIC':
                this.playTone('sine', 400, 0.3, 0.5); // Soft bloop
                break;
            case 'ACE':
                this.playTone('triangle', 600, 0.1, 0.4); // Sharp blip
                break;
            case 'PANIC':
                this.playTone('sawtooth', 150 + Math.random() * 200, 0.1, 0.3); // Erratic buzz
                break;
            default:
                this.playTone('sine', 400, 0.1);
        }
    }

    playScore(persona) {
        if (!this.initialized) return;
        switch (persona) {
            case 'STOIC':
                this.playTone('sine', 800, 1.0, 0.3); // Bell
                break;
            case 'ACE':
                this.playTone('square', 800, 0.1, 0.2); // Coin
                break;
            case 'PANIC':
                this.playTone('sawtooth', 800, 0.3, 0.2); // Alarm
                break;
        }
    }

    playCrash() {
        if (!this.initialized) return;
        this.playTone('sawtooth', 100, 0.5, 0.5);
    }
}
