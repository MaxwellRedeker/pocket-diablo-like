import { saveGame, loadGame } from "./systems/saveSystem.js";
import { dropEnemyLoot, updateGroundLootPickup } from "./systems/lootSystem.js";
import Phaser from "phaser";
import { itemTypes } from "./data/items.js";
import { enemyTypes } from "./data/enemies.js";
import { playerClasses } from "./data/classes.js";
import { equipmentSlots } from "./data/equipmentSlots.js";
import { rarityStyles } from "./data/rarities.js";

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {}

    create() {
        this.worldWidth = 2000;
        this.worldHeight = 2000;
        this.projectiles = [];
        this.enemies = [];
        this.maxEnemies = 6;
        this.gold = 0;
        this.inventory = {};
        this.equipment = structuredClone(equipmentSlots);
        this.groundLoot = [];

        this.itemTypes = itemTypes;
        this.rarityStyles = rarityStyles;
        this.classes = structuredClone(playerClasses);
        this.enemyTypes = enemyTypes;
        this.currentClassKey = "wizard";

        this.createWorldGrid();
        
        this.inventoryOpen = false;

        this.inventorySelection = 0;

        this.player = this.add.rectangle(
            400,
            300,
            40,
            40,
            this.getCurrentClass().color
        );

        this.equipment.weapon = {
            name: "Training Sword",
            damageBonus: 3
        };

        this.cursors = this.input.keyboard.addKeys({
            up: "W",
            down: "S",
            left: "A",
            right: "D"
        });

        this.keys = this.input.keyboard.addKeys({
            warrior: "ONE",
            wizard: "TWO",
            archer: "THREE",
            skillPower: "FOUR",
            skillVitality: "FIVE",
            skillUtility: "SIX",
            equipBestWeapon: "SEVEN",
            equipBestArmor: "EIGHT",
            inventory: "I",
            inventoryUp: "UP",
            inventoryDown: "DOWN",
            inventorySelect: "ENTER",
            mainAttack: "Q",
            secondary: "E",
            saveGame: "F6",
            loadGame: "F9"
        });

        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.Q,
            Phaser.Input.Keyboard.KeyCodes.E,
            Phaser.Input.Keyboard.KeyCodes.F6,
            Phaser.Input.Keyboard.KeyCodes.F9
        ]);

        this.playerHudText = this.add.text(14, 14, "", {
            fontSize: "18px",
            color: "#ffffff",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 }
        });
        this.playerHudText.setScrollFactor(0);

        this.enemyHudText = this.add.text(14, 14, "", {
            fontSize: "18px",
            color: "#ffcccc",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 },
            align: "right"
        });
        this.enemyHudText.setScrollFactor(0);

        this.inventoryText = this.add.text(600, 20, "", {
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#111111",
            padding: { x: 10, y: 10 }
        });

        this.inventoryText.setScrollFactor(0);
        this.inventoryText.setVisible(false);

        this.combatText = this.add.text(14, 14, "", {
            fontSize: "18px",
            color: "#ffff99",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 }
        });
        this.combatText.setScrollFactor(0);

        this.controlsText = this.add.text(14, 14, "", {
            fontSize: "16px",
            color: "#dddddd",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 }
        });
        this.controlsText.setScrollFactor(0);

        this.chatPlaceholderText = this.add.text(14, 14, "", {
            fontSize: "16px",
            color: "#99ccff",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 },
            align: "right"
        });
        this.chatPlaceholderText.setScrollFactor(0);

        this.secondaryCooldown = false;

        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(1);

        this.scale.on("resize", this.handleResize, this);
        this.handleResize({ width: this.scale.width, height: this.scale.height });

        this.spawnInitialEnemies();
        this.updateHud();
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.enemyHudText?.setPosition(width - 14, 14).setOrigin(1, 0);
        this.inventoryText?.setPosition(width - 14, height - 14).setOrigin(1, 1);
        this.combatText?.setPosition(14, height - 120).setOrigin(0, 0);
        this.controlsText?.setPosition(14, height - 14).setOrigin(0, 1);
        this.chatPlaceholderText?.setPosition(width - 14, height - 260).setOrigin(1, 1);
    }

    ensureClassProgressionFields() {
        for (const classKey of Object.keys(this.classes)) {
            const classData = this.classes[classKey];

            if (classData.skillPoints === undefined) {
                classData.skillPoints = 0;
            }

            if (!classData.skills) {
                classData.skills = {
                    power: { name: "Power", level: 0, maxLevel: 5 },
                    vitality: { name: "Vitality", level: 0, maxLevel: 5 },
                    utility: { name: "Utility", level: 0, maxLevel: 5 }
                };
            }
        }
    }

    saveGame() {
        saveGame(this);
    }

    loadGame() {
        loadGame(this);
    }

    getWeaponDamageBonus() {
        return this.equipment.weapon?.damageBonus ?? 0;
    }

    getTotalArmorBonus() {
        let totalArmor = 0;

        for (const item of Object.values(this.equipment)) {
            totalArmor += item?.armorBonus ?? 0;
        }

        return totalArmor;
    }

    getEquipmentDamageBonus() {
        let totalDamage = 0;

        for (const item of Object.values(this.equipment)) {
            totalDamage += item?.damageBonus ?? 0;
        }

        return totalDamage;
    }

    createWorldGrid() {
        const graphics = this.add.graphics();

        graphics.fillStyle(0x151515, 1);
        graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

        graphics.lineStyle(1, 0x333333, 1);

        const tileSize = 100;

        for (let x = 0; x <= this.worldWidth; x += tileSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.worldHeight);
        }

        for (let y = 0; y <= this.worldHeight; y += tileSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.worldWidth, y);
        }

        graphics.strokePath();

        graphics.lineStyle(6, 0xffffff, 1);
        graphics.strokeRect(0, 0, this.worldWidth, this.worldHeight);
    }

    clearEnemies() {
        for (const enemyObj of this.enemies) {
            enemyObj.shape?.destroy();
            enemyObj.hpText?.destroy();
        }

        this.enemies = [];
    }

    spawnInitialEnemies() {
        for (let i = 0; i < this.maxEnemies; i++) {
            this.spawnEnemy();
        }

        this.combatText.setText(`${this.maxEnemies} enemies appeared.`);
    }

    spawnEnemy() {
        const enemyTemplate = Phaser.Utils.Array.GetRandom(this.enemyTypes);

        const spawnDistance = Phaser.Math.Between(250, 650);
        const spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        const rawSpawnX = this.player.x + Math.cos(spawnAngle) * spawnDistance;
        const rawSpawnY = this.player.y + Math.sin(spawnAngle) * spawnDistance;

        const spawnX = Phaser.Math.Clamp(rawSpawnX, 80, this.worldWidth - 80);
        const spawnY = Phaser.Math.Clamp(rawSpawnY, 80, this.worldHeight - 80);

        const shape = this.add.rectangle(
            spawnX,
            spawnY,
            enemyTemplate.size,
            enemyTemplate.size,
            enemyTemplate.color
        );

        const stats = {
            ...enemyTemplate,
            maxHp: enemyTemplate.hp,
            alive: true,
            activeEffects: []
        };

        const hpText = this.add.text(shape.x - 45, shape.y - 50, "", {
            fontSize: "16px",
            color: "#ffaaaa"
        });

        const enemyObj = {
            shape,
            hpText,
            stats,
            attackCooldown: false
        };

        this.enemies.push(enemyObj);
        this.updateSingleEnemyHud(enemyObj);

        return enemyObj;
    }

    getCurrentClass() {
        return this.classes[this.currentClassKey];
    }

    getAliveEnemies() {
        return this.enemies.filter((enemyObj) => enemyObj.stats.alive);
    }

    getNearestEnemy(maxRange = Infinity) {
        let nearestEnemy = null;
        let nearestDistance = Infinity;

        for (const enemyObj of this.getAliveEnemies()) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                enemyObj.shape.x,
                enemyObj.shape.y
            );

            if (distance < nearestDistance && distance <= maxRange) {
                nearestDistance = distance;
                nearestEnemy = enemyObj;
            }
        }

        return nearestEnemy;
    }

    switchClass(classKey) {
        this.currentClassKey = classKey;
        this.player.fillColor = this.getCurrentClass().color;
        this.combatText.setText(`Switched to ${this.getCurrentClass().name}.`);
        this.updateHud();
    }

    spendSkillPoint(skillKey) {
        const currentClass = this.getCurrentClass();
        const skill = currentClass.skills[skillKey];

        if (!skill) return;

        if (currentClass.skillPoints <= 0) {
            this.combatText.setText("No skill points available.\nLevel up to earn more.");
            return;
        }

        if (skill.level >= skill.maxLevel) {
            this.combatText.setText(`${skill.name} is already maxed.`);
            return;
        }

        currentClass.skillPoints -= 1;
        skill.level += 1;

        if (skillKey === "power") {
            currentClass.ability.damage += 5;
        }

        if (skillKey === "vitality") {
            currentClass.maxHp += 20;
            currentClass.currentHp += 20;
        }

        if (skillKey === "utility") {
            currentClass.speed += 0.4;
            currentClass.mana += 10;
        }

        this.combatText.setText(
            `${currentClass.name} upgraded ${skill.name}.\n` +
            `${skill.name}: ${skill.level}/${skill.maxLevel}`
        );

        this.updateHud();
    }

    useMainAttack() {
        const currentClass = this.getCurrentClass();
        const ability = currentClass.ability;
        const totalDamage = ability.damage + this.getEquipmentDamageBonus();

        const targetEnemy = this.getNearestEnemy(ability.range);

        if (!targetEnemy) {
            this.combatText.setText(`${ability.name} missed. No enemy in range.`);
            return;
        }

        if (ability.projectile) {
            this.fireProjectile(currentClass, ability, targetEnemy, totalDamage);
            return;
        }

        targetEnemy.stats.hp -= totalDamage;
        this.applyEquipmentEffectsToEnemy(enemyObj);
        this.applyEquipmentEffectsToEnemy(targetEnemy);
        this.showAttackFlash(ability.range);

        this.combatText.setText(
            `${currentClass.name} used ${ability.name}.\n` +
            `${totalDamage} ${ability.type} damage.`
        );

        if (targetEnemy.stats.hp <= 0) {
            targetEnemy.stats.hp = 0;
            this.killEnemy(targetEnemy);
        } else {
            this.updateSingleEnemyHud(targetEnemy);
            this.updateHud();
        }
    }

    useSecondary() {
        if (this.secondaryCooldown) return;

        const currentClass = this.getCurrentClass();
        const secondary = currentClass.secondary;

        this.combatText.setText(
            `${currentClass.name} used ${secondary.name}.\n` +
            "Secondary slot reserved for shield / future skill."
        );

        const guardFlash = this.add.circle(
            this.player.x,
            this.player.y,
            70,
            0x99ccff,
            0.18
        );

        this.secondaryCooldown = true;

        this.time.delayedCall(250, () => {
            guardFlash.destroy();
        });

        this.time.delayedCall(1200, () => {
            this.secondaryCooldown = false;
        });
    }

    fireProjectile(currentClass, ability, targetEnemy, totalDamage) {
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            targetEnemy.shape.x,
            targetEnemy.shape.y
        );

        const projectile = this.add.circle(
            this.player.x,
            this.player.y,
            ability.projectileSize,
            ability.projectileColor
        );

        projectile.projectileInfo = {
            damage: totalDamage,
            type: ability.type,
            name: ability.name,
            className: currentClass.name,
            speed: ability.projectileSpeed,
            range: ability.range,
            projectileSize: ability.projectileSize,
            distanceTraveled: 0,
            velocityX: Math.cos(angle) * ability.projectileSpeed,
            velocityY: Math.sin(angle) * ability.projectileSpeed
        };

        this.projectiles.push(projectile);

        this.combatText.setText(
            `${currentClass.name} fired ${ability.name}.\n` +
            `Damage: ${totalDamage}`
        );
    }

    applyEquipmentEffectsToEnemy(enemyObj) {
    const equippedItems = Object.values(this.equipment).filter(Boolean);
    const now = this.time.now;

    for (const item of equippedItems) {
        const effects = item.effects ?? [];

        for (const effect of effects) {
            const roll = Phaser.Math.Between(1, 100);

            if (roll > effect.chance) {
                continue;
            }

            if (effect.type === "bleedChance") {
                enemyObj.stats.activeEffects.push({
                    type: "bleed",
                    damagePerTick: effect.damagePerTick,
                    tickRateMs: 1000,
                    nextTickAt: now + 1000,
                    expiresAt: now + effect.durationMs
                });

                this.combatText.setText(
                    `${enemyObj.stats.name} is bleeding.`
                );
            }

            if (effect.type === "burnChance") {
                enemyObj.stats.activeEffects.push({
                    type: "burn",
                    damagePerTick: effect.damagePerTick,
                    tickRateMs: 1000,
                    nextTickAt: now + 1000,
                    expiresAt: now + effect.durationMs
                });

                this.combatText.setText(
                    `${enemyObj.stats.name} is burning.`
                );
            }
        }
    }
}
    updateStatusEffects() {
        const now = this.time.now;

        for (const enemyObj of this.getAliveEnemies()) {
            const effects = enemyObj.stats.activeEffects ?? [];

            for (let i = effects.length - 1; i >= 0; i--) {
                const effect = effects[i];

                if (now >= effect.expiresAt) {
                    effects.splice(i, 1);
                    continue;
                }

                if (now >= effect.nextTickAt) {
                    enemyObj.stats.hp -= effect.damagePerTick;
                    effect.nextTickAt = now + effect.tickRateMs;

                    this.combatText.setText(
                        `${enemyObj.stats.name} suffers ${effect.damagePerTick} ${effect.type} damage.`
                    );

                    if (enemyObj.stats.hp <= 0) {
                        enemyObj.stats.hp = 0;
                        this.killEnemy(enemyObj);
                        break;
                    }

                    this.updateSingleEnemyHud(enemyObj);
                }
            }

            enemyObj.stats.activeEffects = effects;
        }
    }
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (!projectile || !projectile.active || !projectile.projectileInfo) {
                this.projectiles.splice(i, 1);
                continue;
            }

            const info = projectile.projectileInfo;

            projectile.x += info.velocityX;
            projectile.y += info.velocityY;
            info.distanceTraveled += info.speed;

            let didHit = false;

            for (const enemyObj of this.getAliveEnemies()) {
                const distanceToEnemy = Phaser.Math.Distance.Between(
                    projectile.x,
                    projectile.y,
                    enemyObj.shape.x,
                    enemyObj.shape.y
                );

                const hitRange = enemyObj.stats.size / 2 + info.projectileSize;

                if (distanceToEnemy <= hitRange) {
                    enemyObj.stats.hp -= info.damage;
                    this.applyEquipmentEffectsToEnemy(enemyObj);

                    this.combatText.setText(
                        `${info.name} hit ${enemyObj.stats.name}.\n` +
                        `${info.damage} ${info.type} damage.`
                    );

                    projectile.destroy();
                    this.projectiles.splice(i, 1);
                    didHit = true;

                    if (enemyObj.stats.hp <= 0) {
                        enemyObj.stats.hp = 0;
                        this.killEnemy(enemyObj);
                    } else {
                        this.updateSingleEnemyHud(enemyObj);
                        this.updateHud();
                    }

                    break;
                }
            }

            if (didHit) continue;

            if (info.distanceTraveled >= info.range) {
                projectile.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    rollEnemyLoot(enemyObj) {
        const foundItems = [];

        for (const drop of enemyObj.stats.lootTable || []) {
            const roll = Phaser.Math.Between(1, 100);

            if (roll <= drop.chance) {
                this.addItemToInventory(drop.itemKey, 1);
                foundItems.push(this.itemTypes[drop.itemKey].name);
            }
        }

        return foundItems;
    }

    addItemToInventory(itemKey, amount) {
        if (!this.inventory[itemKey]) {
            this.inventory[itemKey] = 0;
        }

        this.inventory[itemKey] += amount;
    }

    equipBestWeapon() {
        let bestWeaponKey = null;
        let bestDamage = this.equipment.weapon?.damageBonus ?? 0;

        for (const itemKey of Object.keys(this.inventory)) {
            const item = this.itemTypes[itemKey];

            if (!item || item.itemType !== "weapon") continue;

            if (item.damageBonus > bestDamage) {
                bestDamage = item.damageBonus;
                bestWeaponKey = itemKey;
            }
        }

        if (!bestWeaponKey) {
            this.combatText.setText("No better weapon found in inventory.");
            return;
        }

        const bestWeapon = this.itemTypes[bestWeaponKey];

        this.equipment.weapon = {
            name: bestWeapon.name,
            damageBonus: bestWeapon.damageBonus,
            effects: bestWeapon.effects ?? []
        };

        this.combatText.setText(
            `Equipped ${bestWeapon.name}.\nWeapon damage bonus is now +${bestWeapon.damageBonus}.`
        );

        this.updateHud();
    }

    equipBestArmor() {
    const armorSlots = ["helmet", "chest", "gloves", "boots"];

    let equippedCount = 0;

    for (const slot of armorSlots) {
        let bestItem = null;

        for (const itemKey of Object.keys(this.inventory)) {
            const item = this.itemTypes[itemKey];

            if (!item) continue;
            if (item.itemType !== "armor") continue;
            if (item.slot !== slot) continue;

            if (
                !bestItem ||
                (item.armorBonus ?? 0) > (bestItem.armorBonus ?? 0)
            ) {
                bestItem = item;
            }
        }

        if (bestItem) {
            this.equipment[slot] = {
                name: bestItem.name,
                armorBonus: bestItem.armorBonus ?? 0,
                damageBonus: bestItem.damageBonus ?? 0,
                speedBonus: bestItem.speedBonus ?? 0
            };

            equippedCount++;
        }
    }

    if (equippedCount === 0) {
        this.combatText.setText("No armor found in inventory.");
        return;
    }

    this.combatText.setText(
        `Equipped ${equippedCount} armor pieces.\nArmor is now +${this.getTotalArmorBonus()}.`
    );

    this.updateHud();
    }

    toggleInventory() {
    this.inventoryOpen = !this.inventoryOpen;

    console.log("Inventory toggled:", this.inventoryOpen);

    if (!this.inventoryOpen) {
        this.inventoryText.setVisible(false);
        return;
    }

    this.inventoryText.setText(
        this.getInventoryLines().join("\n")
    );

    this.inventoryText.setVisible(true);
    }

equipSelectedInventoryItem() {
    const itemKeys = Object.keys(this.inventory);

    if (itemKeys.length === 0) {
        return;
    }

    const itemKey = itemKeys[this.inventorySelection];
    const item = this.itemTypes[itemKey];

    if (!item) {
        return;
    }

    if (item.itemType === "weapon") {
        this.equipment.weapon = {
            name: item.name,
            damageBonus: item.damageBonus ?? 0,
            effects: item.effects ?? []
        };

        this.combatText.setText(`Equipped ${item.name}`);
        this.updateHud();
        return;
    }

    if (item.itemType === "armor" && item.slot) {
        this.equipment[item.slot] = {
            name: item.name,
            armorBonus: item.armorBonus ?? 0,
            damageBonus: item.damageBonus ?? 0,
            speedBonus: item.speedBonus ?? 0
        };

        this.combatText.setText(`Equipped ${item.name}`);
        this.updateHud();
        return;
    }

    this.combatText.setText(`${item.name} cannot be equipped.`);
}

getInventoryLines() {
    const itemKeys = Object.keys(this.inventory);

    const lines = ["Inventory", ""];

    if (itemKeys.length === 0) {
        lines.push("Inventory Empty");
    } else {
        itemKeys.slice(0, 10).forEach((itemKey, index) => {
            const item = this.itemTypes[itemKey];

            const prefix =
                index === this.inventorySelection
                    ? "> "
                    : "  ";

            const rarity =
                this.rarityStyles[item.rarity] ??
                this.rarityStyles.common;

            lines.push(
                `${prefix}[${rarity.label}] ${item.name} x${this.inventory[itemKey]}`
            );
        });

        if (itemKeys.length > 10) {
            lines.push(
                `+${itemKeys.length - 10} more items`
            );
        }
    }

    lines.push("");
    lines.push("----------------");
    lines.push("");
    lines.push("Selected Item");
    lines.push("");

    if (itemKeys.length === 0) {
        lines.push("None");
    } else {
        const selectedItemKey = itemKeys[this.inventorySelection];
        const selectedItem = this.itemTypes[selectedItemKey];

        if (selectedItem) {
            const rarity =
                this.rarityStyles[selectedItem.rarity] ??
                this.rarityStyles.common;

            lines.push(selectedItem.name);
            lines.push(`Rarity: ${rarity.label}`);
            lines.push(`Type: ${selectedItem.itemType ?? "material"}`);

            if (selectedItem.slot) {
                lines.push(`Slot: ${selectedItem.slot}`);
            }

            if (selectedItem.damageBonus) {
                lines.push(`Damage: +${selectedItem.damageBonus}`);
            }

            if (selectedItem.armorBonus) {
                lines.push(`Armor: +${selectedItem.armorBonus}`);
            }

            if (selectedItem.speedBonus) {
                lines.push(`Speed: +${selectedItem.speedBonus}`);
            }

            if (selectedItem.description) {
                lines.push("");
                lines.push(selectedItem.description);
            }
        }
    }

    lines.push("");
    lines.push("----------------");
    lines.push("");
    lines.push("Equipped");
    lines.push("");

    lines.push(
        `Weapon: ${this.equipment.weapon?.name ?? "None"}`
    );

    lines.push(
        `Helmet: ${this.equipment.helmet?.name ?? "None"}`
    );

    lines.push(
        `Chest: ${this.equipment.chest?.name ?? "None"}`
    );

    lines.push(
        `Gloves: ${this.equipment.gloves?.name ?? "None"}`
    );

    lines.push(
        `Boots: ${this.equipment.boots?.name ?? "None"}`
    );

    return lines;
}

    showAttackFlash(range) {
        const flash = this.add.circle(this.player.x, this.player.y, range, 0xffffff, 0.12);

        this.time.delayedCall(120, () => {
            flash.destroy();
        });
    }

    killEnemy(enemyObj) {
        const stats = enemyObj.stats;
        const goldReward = Phaser.Math.Between(stats.goldMin, stats.goldMax);

        this.gold += goldReward;

        const foundItems = dropEnemyLoot(this, enemyObj);
        const lootMessage =
            foundItems.length > 0
                ? `Loot: ${foundItems.join(", ")}.\n`
                : "Loot: Nothing dropped.\n";

        stats.alive = false;
        enemyObj.shape.setFillStyle(0x555555);

        const levelUpMessage = this.gainExp(stats.expReward);

        this.combatText.setText(
            `${stats.name} defeated.\n` +
            `+${stats.expReward} EXP | +${goldReward} Gold\n` +
            lootMessage +
            `${levelUpMessage}` +
            "Respawning in 4 sec..."
        );

        this.time.delayedCall(4000, () => {
            enemyObj.shape.destroy();
            enemyObj.hpText.destroy();

            this.enemies = this.enemies.filter((enemy) => enemy !== enemyObj);

            if (this.enemies.length < this.maxEnemies) {
                this.spawnEnemy();
            }

            this.updateHud();
        });

        this.updateHud();
    }

    gainExp(amount) {
        const currentClass = this.getCurrentClass();
        let levelUpMessage = "";

        currentClass.exp += amount;

        while (currentClass.exp >= currentClass.expToNext) {
            currentClass.exp -= currentClass.expToNext;
            currentClass.level += 1;
            currentClass.expToNext = Math.floor(currentClass.expToNext * 1.4);
            currentClass.skillPoints += 1;
            currentClass.maxHp += 10;
            currentClass.currentHp = currentClass.maxHp;
            currentClass.mana += 5;
            currentClass.ability.damage += 2;

            levelUpMessage += `${currentClass.name} leveled up to ${currentClass.level}!\n`;
            levelUpMessage += `+1 Skill Point. Damage increased to ${currentClass.ability.damage}.\n`;
        }

        this.updateHud();
        return levelUpMessage;
    }

    updateSingleEnemyHud(enemyObj) {
        if (!enemyObj.hpText || !enemyObj.stats) return;

        const activeEffects =
            enemyObj.stats.activeEffects?.map((effect) => effect.type).join(", ") || "none";

        enemyObj.hpText.setText(
            `${enemyObj.stats.name}\nHP: ${enemyObj.stats.hp} / ${enemyObj.stats.maxHp}\nEffects: ${activeEffects}`
);

        enemyObj.hpText.x = enemyObj.shape.x - 45;
        enemyObj.hpText.y = enemyObj.shape.y - 50;
    }

    updateAllEnemyHuds() {
        for (const enemyObj of this.enemies) {
            this.updateSingleEnemyHud(enemyObj);
        }
    }

    updateHud() {
        const currentClass = this.getCurrentClass();
        const nearestEnemy = this.getNearestEnemy();

        this.playerHudText.setText(
            [
                `${currentClass.name} Lv.${currentClass.level}`,
                `EXP: ${currentClass.exp}/${currentClass.expToNext}`,
                `Skill Points: ${currentClass.skillPoints}`,
                `Gold: ${this.gold}`,
                `HP: ${currentClass.currentHp}/${currentClass.maxHp}`,
                `Mana: ${currentClass.mana}`,
                `Q: ${currentClass.ability.name}`,
                `E: ${currentClass.secondary.name}`,
                `Weapon: ${this.equipment.weapon?.name ?? "None"}`,
                `Weapon DMG: +${this.getWeaponDamageBonus()}`,
                `Armor: +${this.getTotalArmorBonus()}`,
                `Gear DMG: +${this.getEquipmentDamageBonus()}`,
                "",
                "Skills",
                `4 ${currentClass.skills.power.name}: ${currentClass.skills.power.level}/${currentClass.skills.power.maxLevel}`,
                `5 ${currentClass.skills.vitality.name}: ${currentClass.skills.vitality.level}/${currentClass.skills.vitality.maxLevel}`,
                `6 ${currentClass.skills.utility.name}: ${currentClass.skills.utility.level}/${currentClass.skills.utility.maxLevel}`
            ].join("\n")
        );

        this.enemyHudText.setText(
            nearestEnemy
                ? [
                    "Nearest Enemy",
                    `${nearestEnemy.stats.name}`,
                    `HP: ${nearestEnemy.stats.hp}/${nearestEnemy.stats.maxHp}`,
                    `DMG: ${nearestEnemy.stats.damage}`,
                    `EXP: ${nearestEnemy.stats.expReward}`,
                    `Alive: ${this.getAliveEnemies().length}/${this.maxEnemies}`
                ].join("\n")
                : "Enemy\nNone"
        );

        if (this.inventoryOpen) {
            this.inventoryText.setText(
            this.getInventoryLines().join("\n")
        );
    }

        this.controlsText.setText(
            [
                "1 Warrior | 2 Wizard | 3 Archer",
                "Q Main | E Secondary",
                "4/5/6 Skill | 7 Weapon | 8 Armor | I Inventory",
                "F6 Save | F9 Load",
                "WASD Move"
            ].join("\n")
        );

        this.chatPlaceholderText.setText(
            [
                "Chat",
                "Coming later with multiplayer",
                "Socket.IO / server-backed"
            ].join("\n")
        );
    }

    updatePlayerMovement() {
        const currentClass = this.getCurrentClass();
        const speed = currentClass.speed;

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) moveX -= speed;
        if (this.cursors.right.isDown) moveX += speed;
        if (this.cursors.up.isDown) moveY -= speed;
        if (this.cursors.down.isDown) moveY += speed;

        this.player.x += moveX;
        this.player.y += moveY;

        this.player.x = Phaser.Math.Clamp(this.player.x, 20, this.worldWidth - 20);
        this.player.y = Phaser.Math.Clamp(this.player.y, 20, this.worldHeight - 20);
    }

    updateEnemyAi() {
        const currentClass = this.getCurrentClass();

        for (const enemyObj of this.getAliveEnemies()) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                enemyObj.shape.x,
                enemyObj.shape.y,
                this.player.x,
                this.player.y
            );

            if (distanceToPlayer <= enemyObj.stats.chaseRange) {
                const angle = Phaser.Math.Angle.Between(
                    enemyObj.shape.x,
                    enemyObj.shape.y,
                    this.player.x,
                    this.player.y
                );

                enemyObj.shape.x += Math.cos(angle) * enemyObj.stats.speed;
                enemyObj.shape.y += Math.sin(angle) * enemyObj.stats.speed;
            }

            if (distanceToPlayer <= enemyObj.stats.attackRange) {
                this.enemyAttackPlayer(enemyObj, currentClass);
            }

            this.updateSingleEnemyHud(enemyObj);
        }
    }

    enemyAttackPlayer(enemyObj, currentClass) {
        if (enemyObj.attackCooldown) return;

        const armorReduction = this.getTotalArmorBonus();
        const finalDamage = Math.max(1, enemyObj.stats.damage - armorReduction);

        currentClass.currentHp -= finalDamage;

        this.combatText.setText(
            `${enemyObj.stats.name} hit ${currentClass.name} for ${finalDamage} damage.\n` +
            `Armor blocked ${armorReduction}.`
        );

        if (currentClass.currentHp <= 0) {
            currentClass.currentHp = 0;
            this.playerDeath();
        }

        enemyObj.attackCooldown = true;

        this.time.delayedCall(900, () => {
            enemyObj.attackCooldown = false;
        });

        this.updateHud();
    }

    playerDeath() {
        const currentClass = this.getCurrentClass();

        this.combatText.setText(
            `${currentClass.name} was defeated.\nRespawning at start position.`
        );

        this.player.x = 400;
        this.player.y = 300;

        this.time.delayedCall(1500, () => {
            currentClass.currentHp = currentClass.maxHp;
            this.updateHud();
            this.combatText.setText(`${currentClass.name} recovered.`);
        });
    }

    updateControls() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.warrior)) {
            this.switchClass("warrior");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.wizard)) {
            this.switchClass("wizard");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.archer)) {
            this.switchClass("archer");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.skillPower)) {
            this.spendSkillPoint("power");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.skillVitality)) {
            this.spendSkillPoint("vitality");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.skillUtility)) {
            this.spendSkillPoint("utility");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.equipBestWeapon)) {
            this.equipBestWeapon();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.equipBestArmor)) {
        this.equipBestArmor();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.inventory)) {
        this.toggleInventory();
        }

        if (
        this.inventoryOpen &&
        Phaser.Input.Keyboard.JustDown(this.keys.inventoryUp)
        ) {
        this.inventorySelection--;

        if (this.inventorySelection < 0) {
        this.inventorySelection = 0;
        }

        this.updateHud();
        }

        if (
        this.inventoryOpen &&
        Phaser.Input.Keyboard.JustDown(this.keys.inventoryDown)
        ) {
        const maxIndex =
        Math.max(
            0,
            Object.keys(this.inventory).length - 1
        );

        this.inventorySelection++;

        if (this.inventorySelection > maxIndex) {
        this.inventorySelection = maxIndex;
        }

        this.updateHud();
        }

        if (
        this.inventoryOpen &&
        Phaser.Input.Keyboard.JustDown(this.keys.inventorySelect)
        ) {
        this.equipSelectedInventoryItem();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.mainAttack)) {
            this.useMainAttack();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.secondary)) {
            this.useSecondary();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.saveGame)) {
            this.saveGame();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.loadGame)) {
            this.loadGame();
        }
    }

    update() {
        this.updatePlayerMovement();
        this.updateEnemyAi();
        this.updateProjectiles();
        this.updateStatusEffects();
        updateGroundLootPickup(this);
        this.updateControls();
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#111111",
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

new Phaser.Game(config);