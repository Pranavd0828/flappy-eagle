export class Input {
    constructor() {
        this.tapped = false;

        const handler = (e) => {
            if (e.type === 'touchstart') e.preventDefault(); // Stop scroll
            this.tapped = true;
        };

        window.addEventListener('mousedown', handler);
        window.addEventListener('touchstart', handler, { passive: false });
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.tapped = true;
        });
    }

    check() {
        if (this.tapped) {
            this.tapped = false;
            return true;
        }
        return false;
    }
}
