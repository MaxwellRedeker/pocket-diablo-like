export const SAVE_KEY = "pocketDiabloSave_v1";

export function createSaveData(scene) {
    return {
        version: 2,
        gold: scene.gold,
        inventory: scene.inventory,
        classes: scene.classes,
        currentClassKey: scene.currentClassKey,
        playerPosition: {
            x: scene.player.x,
            y: scene.player.y
        }
    };
}

export function saveGame(scene) {
    const saveData = createSaveData(scene);

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

    scene.combatText.setText("Game saved.\nLocal browser save created.");
}

export function loadGame(scene) {
    const rawSave = localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
        scene.combatText.setText("No save file found.");
        return;
    }

    try {
        const saveData = JSON.parse(rawSave);

        scene.gold = saveData.gold ?? 0;
        scene.inventory = saveData.inventory ?? {};
        scene.classes = saveData.classes ?? scene.classes;
        scene.currentClassKey = saveData.currentClassKey ?? "wizard";

        scene.ensureClassProgressionFields();

        if (saveData.playerPosition) {
            scene.player.x = Phaser.Math.Clamp(
                saveData.playerPosition.x,
                20,
                scene.worldWidth - 20
            );

            scene.player.y = Phaser.Math.Clamp(
                saveData.playerPosition.y,
                20,
                scene.worldHeight - 20
            );
        }

        scene.player.fillColor = scene.getCurrentClass().color;

        for (const projectile of scene.projectiles) {
            projectile.destroy();
        }

        scene.projectiles = [];

        scene.clearEnemies();
        scene.spawnInitialEnemies();
        scene.updateHud();

        scene.combatText.setText("Game loaded.\nProgress restored from browser save.");
    } catch (error) {
        console.error(error);
        scene.combatText.setText("Save file failed to load.");
    }
}