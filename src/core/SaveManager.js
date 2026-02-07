export class SaveManager {
    constructor() {
        this.saveData = {
            feathers: 0,
            highScore: 0,
            unlockedSkins: ['default']
        };
        this.load();
    }

    load() {
        const data = localStorage.getItem('flappy_eagle_save');
        if (data) {
            try {
                this.saveData = { ...this.saveData, ...JSON.parse(data) };
            } catch (e) {
                console.error("Save Corrupt", e);
            }
        }
    }

    save() {
        localStorage.setItem('flappy_eagle_save', JSON.stringify(this.saveData));
    }

    addFeathers(amount) {
        this.saveData.feathers += amount;
        this.save();
    }
}
