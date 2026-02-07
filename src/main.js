import { Game } from './core/Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();

    // Expose for debugging
    window.game = game;
});
