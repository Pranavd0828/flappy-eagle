export class Input {
    constructor() {
        this.tapped = false;
        this.isDown = false; // New: Track hold state
        this.handlers = [];

        // Bind methods
        this.handleStart = this.handleStart.bind(this);
        this.handleEnd = this.handleEnd.bind(this);

        // Listen for both touch and mouse
        window.addEventListener('touchstart', this.handleStart, { passive: false });
        window.addEventListener('mousedown', this.handleStart);

        window.addEventListener('touchend', this.handleEnd);
        window.addEventListener('mouseup', this.handleEnd);

        // Keyboard support for desktop debugging (Spacebar)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.handleStart(e);
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.handleEnd(e);
            }
        });
    }

    handleStart(e) {
        if (e.type === 'touchstart') {
            // Prevent default to avoid scrolling or double-firing mouse events
            // e.preventDefault(); 
        }

        if (!this.isDown) {
            this.tapped = true;
            // Notify subscribers only on initial tap
            this.handlers.forEach(cb => cb());
        }
        this.isDown = true;
    }

    handleEnd(e) {
        this.isDown = false;
    }

    onTap(callback) {
        this.handlers.push(callback);
    }

    isTapped() {
        const wasTapped = this.tapped;
        this.tapped = false;
        return wasTapped;
    }
}
