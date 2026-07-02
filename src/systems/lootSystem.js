import Phaser from "phaser";
import { generateItem } from "./itemGenerator.js";

export function dropEnemyLoot(scene, enemyObj) {
    const droppedItems = [];

    for (const drop of enemyObj.stats.lootTable || []) {
        const roll = Phaser.Math.Between(1, 100);

        if (roll <= drop.chance) {
            const baseItem = scene.itemTypes[drop.itemKey];
            const item = generateItem(baseItem);

            const rarity =
                scene.rarityStyles[item.rarity] ??
                scene.rarityStyles.common;

            const lootShape = scene.add.circle(
                enemyObj.shape.x + Phaser.Math.Between(-25, 25),
                enemyObj.shape.y + Phaser.Math.Between(-25, 25),
                10,
                rarity.worldColor
            );

            const lootText = scene.add.text(
                lootShape.x - 30,
                lootShape.y - 30,
                `[${rarity.label}] ${item.name}`,
                {
                    fontSize: "14px",
                    color: rarity.textColor,
                    backgroundColor: "#00000088",
                    padding: { x: 4, y: 2 }
                }
            );

            scene.groundLoot.push({
                itemKey: drop.itemKey,
                item,
                shape: lootShape,
                text: lootText
            });

            droppedItems.push(item.name);
        }
    }

    return droppedItems;
}

export function updateGroundLootPickup(scene) {
    for (let i = scene.groundLoot.length - 1; i >= 0; i--) {
        const loot = scene.groundLoot[i];

        const distance = Phaser.Math.Distance.Between(
            scene.player.x,
            scene.player.y,
            loot.shape.x,
            loot.shape.y
        );

        if (distance <= 45) {
            scene.addGeneratedItemToInventory(loot.itemKey, loot.item);

            const item = loot.item;

            const rarity =
                scene.rarityStyles[item.rarity] ??
                scene.rarityStyles.common;

            scene.combatText.setText(
                `Picked up [${rarity.label}] ${item.name}.`
            );

            loot.shape.destroy();
            loot.text.destroy();

            scene.groundLoot.splice(i, 1);
            scene.updateHud();
        }
    }
}