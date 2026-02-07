import { Game } from './core/Game.js';

// Error Trap
window.onerror = function (msg, url, line, col, error) {
    document.body.innerHTML += `<div style="color:red; background:black; padding:10px; position:absolute; top:0; left:0; z-index:9999;">
        <h3>CRITICAL ERROR</h3>
        <p>${msg}</p>
        <p>${url}:${line}</p>
    </div>`;
};

window.onload = () => {
    const game = new Game();
    game.start();
};
