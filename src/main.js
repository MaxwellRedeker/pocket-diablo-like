import Phaser from "phaser";

const SAVE_KEY = "pocketDiabloSave_v1";

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {}

    create() {
        this.worldWidth = 2000;
        this.worldHeight = 2000;
        this.projectiles = [];
        this.gold = 0;
        this.inventory = {};

        this.itemTypes = {
            tornCloth: { name: "Torn Cloth", rarity: "common" },
            rustyDagger: { name: "Rusty Dagger", rarity: "uncommon" },
            slimeGel: { name: "Slime Gel", rarity: "common" },
            greenCore: { name: "Green Core", rarity: "rare" },
            boneShard: { name: "Bone Shard", rarity: "common" },
            ratFang: { name: "Rat Fang", rarity: "uncommon" },
            emberCore: { name: "Ember Core", rarity: "rare" },
            burntHorn: { name: "Burnt Horn", rarity: "uncommon" }
        };

        this.classes = {
            warrior: {
                name: "Warrior",
                color: 0xff4444,
                level: 1,
                exp: 0,
                expToNext: 100,
                maxHp: 150,
                currentHp: 150,
                mana: 25,
                speed: 4,
                ability: {
                    name: "Slash",
                    damage: 30,
                    range: 90,
                    type: "physical",
                    projectile: false
                },
                secondary: {
                    name: "Guard",
                    type: "defense"
                }
            },
            wizard: {
                name: "Wizard",
                color: 0x3399ff,
                level: 1,
                exp: 0,
                expToNext: 100,
                maxHp: 80,
                currentHp: 80,
                mana: 120,
                speed: 4,
                ability: {
                    name: "Fireball",
                    damage: 22,
                    range: 320,
                    type: "fire",
                    projectile: true,
                    projectileColor: 0xff6600,
                    projectileSize: 16,
                    projectileSpeed: 8
                },
                secondary: {
                    name: "Arcane Guard",
                    type: "defense"
                }
            },
            archer: {
                name: "Archer",
                color: 0x44ff44,
                level: 1,
                exp: 0,
                expToNext: 100,
                maxHp: 100,
                currentHp: 100,
                mana: 60,
                speed: 5,
                ability: {
                    name: "Arrow Shot",
                    damage: 18,
                    range: 420,
                    type: "piercing",
                    projectile: true,
                    projectileColor: 0xffff66,
                    projectileSize: 10,
                    projectileSpeed: 11
                },
                secondary: {
                    name: "Dodge Guard",
                    type: "defense"
                }
            }
        };

        this.enemyTypes = [
            {
                name: "Training Goblin",
                color: 0xff0000,
                size: 50,
                hp: 100,
                expReward: 35,
                goldMin: 5,
                goldMax: 12,
                speed: 1.3,
                chaseRange: 450,
                attackRange: 55,
                damage: 8,
                lootTable: [
                    { itemKey: "tornCloth", chance: 70 },
                    { itemKey: "rustyDagger", chance: 20 }
                ]
            },
            {
                name: "Forest Slime",
                color: 0x33cc33,
                size: 60,
                hp: 140,
                expReward: 45,
                goldMin: 3,
                goldMax: 9,
                speed: 0.9,
                chaseRange: 350,
                attackRange: 60,
                damage: 6,
                lootTable: [
                    { itemKey: "slimeGel", chance: 85 },
                    { itemKey: "greenCore", chance: 12 }
                ]
            },
            {
                name: "Bone Rat",
                color: 0xcccccc,
                size: 35,
                hp: 70,
                expReward: 25,
                goldMin: 2,
                goldMax: 7,
                speed: 2.2,
                chaseRange: 500,
                attackRange: 45,
                damage: 10,
                lootTable: [
                    { itemKey: "boneShard", chance: 75 },
                    { itemKey: "ratFang", chance: 25 }
                ]
            },
            {
                name: "Ash Imp",
                color: 0xff8800,
                size: 42,
                hp: 90,
                expReward: 55,
                goldMin: 10,
                goldMax: 22,
                speed: 1.6,
                chaseRange: 550,
                attackRange: 50,
                damage: 14,
                lootTable: [
                    { itemKey: "emberCore", chance: 30 },
                    { itemKey: "burntHorn", chance: 45 }
                ]
            }
        ];

        this.currentClassKey = "wizard";

        this.createWorldGrid();

        this.player = this.add.rectangle(
            400,
            300,
            40,
            40,
            this.getCurrentClass().color
        );

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

        this.combatText = this.add.text(14, 14, "", {
            fontSize: "18px",
            color: "#ffff99",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 }
        });
        this.combatText.setScrollFactor(0);

        this.inventoryText = this.add.text(14, 14, "", {
            fontSize: "18px",
            color: "#ccffcc",
            backgroundColor: "#00000088",
            padding: { x: 8, y: 6 },
            align: "right"
        });
        this.inventoryText.setScrollFactor(0);

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

        this.enemyAttackCooldown = false;
        this.secondaryCooldown = false;

        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(1);

        this.scale.on("resize", this.handleResize, this);
        this.handleResize({ width: this.scale.width, height: this.scale.height });

        this.spawnEnemy();
        this.updateHud();
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.enemyHudText?.setPosition(width - 14, 14).setOrigin(1, 0);
        this.inventoryText?.setPosition(width - 14, height - 14).setOrigin(1, 1);
        this.combatText?.setPosition(14, height - 120).setOrigin(0, 0);
        this.controlsText?.setPosition(14, height - 14).setOrigin(0, 1);
        this.chatPlaceholderText?.setPosition(width - 14, height - 170).setOrigin(1, 1);
    }

    saveGame() {
        const saveData = {
            version: 1,
            gold: this.gold,
            inventory: this.inventory,
            classes: this.classes,
            currentClassKey: this.currentClassKey,
            playerPosition: {
                x: this.player.x,
                y: this.player.y
            }
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

        this.combatText.setText("Game saved.\nLocal browser save created.");
    }

    loadGame() {
        const rawSave = localStorage.getItem(SAVE_KEY);

        if (!rawSave) {
            this.combatText.setText("No save file found.");
            return;
        }

        try {
            const saveData = JSON.parse(rawSave);

            this.gold = saveData.gold ?? 0;
            this.inventory = saveData.inventory ?? {};
            this.classes = saveData.classes ?? this.classes;
            this.currentClassKey = saveData.currentClassKey ?? "wizard";

            if (saveData.playerPosition) {
                this.player.x = Phaser.Math.Clamp(
                    saveData.playerPosition.x,
                    20,
                    this.worldWidth - 20
                );
                this.player.y = Phaser.Math.Clamp(
                    saveData.playerPosition.y,
                    20,
                    this.worldHeight - 20
                );
            }

            this.player.fillColor = this.getCurrentClass().color;

            for (const projectile of this.projectiles) {
                projectile.destroy();
            }
            this.projectiles = [];

            this.spawnEnemy();
            this.updateHud();

            this.combatText.setText("Game loaded.\nProgress restored from browser save.");
        } catch (error) {
            console.error(error);
            this.combatText.setText("Save file failed to load.");
        }
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

    spawnEnemy() {
        if (this.enemy) this.enemy.destroy();
        if (this.enemyHpText) this.enemyHpText.destroy();

        const enemyTemplate = Phaser.Utils.Array.GetRandom(this.enemyTypes);

        const spawnDistance = Phaser.Math.Between(250, 450);
        const spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        const rawSpawnX = this.player.x + Math.cos(spawnAngle) * spawnDistance;
        const rawSpawnY = this.player.y + Math.sin(spawnAngle) * spawnDistance;

        const spawnX = Phaser.Math.Clamp(rawSpawnX, 80, this.worldWidth - 80);
        const spawnY = Phaser.Math.Clamp(rawSpawnY, 80, this.worldHeight - 80);

        this.enemy = this.add.rectangle(
            spawnX,
            spawnY,
            enemyTemplate.size,
            enemyTemplate.size,
            enemyTemplate.color
        );

        this.enemyStats = {
            ...enemyTemplate,
            maxHp: enemyTemplate.hp,
            alive: true
        };

        this.enemyHpText = this.add.text(this.enemy.x - 45, this.enemy.y - 50, "", {
            fontSize: "16px",
            color: "#ffaaaa"
        });

        this.updateEnemyHud();

        if (this.combatText) {
            this.combatText.setText(`${this.enemyStats.name} appeared.`);
        }
    }

    getCurrentClass() {
        return this.classes[this.currentClassKey];
    }

    switchClass(classKey) {
        this.currentClassKey = classKey;
        this.player.fillColor = this.getCurrentClass().color;
        this.combatText.setText(`Switched to ${this.getCurrentClass().name}.`);
        this.updateHud();
    }

    useMainAttack() {
        const currentClass = this.getCurrentClass();
        const ability = currentClass.ability;

        if (!this.enemyStats || !this.enemyStats.alive) {
            this.combatText.setText("Enemy defeated. Respawning soon...");
            return;
        }

        const distanceToEnemy = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.enemy.x,
            this.enemy.y
        );

        if (distanceToEnemy > ability.range) {
            this.combatText.setText(`${ability.name} missed. Enemy is too far away.`);
            return;
        }

        if (ability.projectile) {
            this.fireProjectile(currentClass, ability);
            return;
        }

        this.enemyStats.hp -= ability.damage;
        this.showAttackFlash(ability.range);

        this.combatText.setText(
            `${currentClass.name} used ${ability.name}.\n` +
            `${ability.damage} ${ability.type} damage.`
        );

        if (this.enemyStats.hp <= 0) {
            this.enemyStats.hp = 0;
            this.killEnemy();
        }

        this.updateEnemyHud();
        this.updateHud();
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

    fireProjectile(currentClass, ability) {
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            this.enemy.x,
            this.enemy.y
        );

        const projectile = this.add.circle(
            this.player.x,
            this.player.y,
            ability.projectileSize,
            ability.projectileColor
        );

        projectile.projectileInfo = {
            damage: ability.damage,
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

        this.combatText.setText(`${currentClass.name} fired ${ability.name}.`);
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

            if (this.enemyStats && this.enemyStats.alive && this.enemy && this.enemy.active) {
                const distanceToEnemy = Phaser.Math.Distance.Between(
                    projectile.x,
                    projectile.y,
                    this.enemy.x,
                    this.enemy.y
                );

                const hitRange = this.enemyStats.size / 2 + info.projectileSize;

                if (distanceToEnemy <= hitRange) {
                    this.enemyStats.hp -= info.damage;

                    this.combatText.setText(
                        `${info.name} hit ${this.enemyStats.name}.\n` +
                        `${info.damage} ${info.type} damage.`
                    );

                    projectile.destroy();
                    this.projectiles.splice(i, 1);

                    if (this.enemyStats.hp <= 0) {
                        this.enemyStats.hp = 0;
                        this.killEnemy();
                    } else {
                        this.updateEnemyHud();
                        this.updateHud();
                    }

                    continue;
                }
            }

            if (info.distanceTraveled >= info.range) {
                projectile.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    rollEnemyLoot() {
        const foundItems = [];

        for (const drop of this.enemyStats.lootTable || []) {
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

    getInventoryLines() {
        const itemKeys = Object.keys(this.inventory);

        if (itemKeys.length === 0) {
            return ["Inventory: Empty"];
        }

        return [
            "Inventory",
            ...itemKeys.slice(0, 6).map((itemKey) => {
                const item = this.itemTypes[itemKey];
                return `${item.name} x${this.inventory[itemKey]}`;
            }),
            itemKeys.length > 6 ? `+${itemKeys.length - 6} more items` : ""
        ].filter(Boolean);
    }

    showAttackFlash(range) {
        const flash = this.add.circle(this.player.x, this.player.y, range, 0xffffff, 0.12);

        this.time.delayedCall(120, () => {
            flash.destroy();
        });
    }

    killEnemy() {
        const goldReward = Phaser.Math.Between(
            this.enemyStats.goldMin,
            this.enemyStats.goldMax
        );

        this.gold += goldReward;

        const foundItems = this.rollEnemyLoot();
        const lootMessage =
            foundItems.length > 0
                ? `Loot: ${foundItems.join(", ")}.\n`
                : "Loot: Nothing dropped.\n";

        this.enemyStats.alive = false;
        this.enemy.setFillStyle(0x555555);

        const levelUpMessage = this.gainExp(this.enemyStats.expReward);

        this.combatText.setText(
            `${this.enemyStats.name} defeated.\n` +
            `+${this.enemyStats.expReward} EXP | +${goldReward} Gold\n` +
            lootMessage +
            `${levelUpMessage}` +
            "Respawning in 4 sec..."
        );

        this.time.delayedCall(4000, () => {
            this.spawnEnemy();
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
            currentClass.maxHp += 10;
            currentClass.currentHp = currentClass.maxHp;
            currentClass.mana += 5;
            currentClass.ability.damage += 3;

            levelUpMessage += `${currentClass.name} leveled up to ${currentClass.level}!\n`;
            levelUpMessage += `Damage increased to ${currentClass.ability.damage}.\n`;
        }

        this.updateHud();
        return levelUpMessage;
    }

    updateEnemyHud() {
        if (!this.enemyHpText || !this.enemyStats) return;

        this.enemyHpText.setText(
            `${this.enemyStats.name}\nHP: ${this.enemyStats.hp} / ${this.enemyStats.maxHp}`
        );

        this.enemyHpText.x = this.enemy.x - 45;
        this.enemyHpText.y = this.enemy.y - 50;
    }

    updateHud() {
        const currentClass = this.getCurrentClass();

        this.playerHudText.setText(
            [
                `${currentClass.name} Lv.${currentClass.level}`,
                `EXP: ${currentClass.exp}/${currentClass.expToNext}`,
                `Gold: ${this.gold}`,
                `HP: ${currentClass.currentHp}/${currentClass.maxHp}`,
                `Mana: ${currentClass.mana}`,
                `Q: ${currentClass.ability.name}`,
                `E: ${currentClass.secondary.name}`
            ].join("\n")
        );

        this.enemyHudText.setText(
            this.enemyStats
                ? [
                    "Enemy",
                    `${this.enemyStats.name}`,
                    `HP: ${this.enemyStats.hp}/${this.enemyStats.maxHp}`,
                    `DMG: ${this.enemyStats.damage}`,
                    `EXP: ${this.enemyStats.expReward}`
                ].join("\n")
                : "Enemy\nNone"
        );

        this.inventoryText.setText(this.getInventoryLines().join("\n"));

        this.controlsText.setText(
            [
                "1 Warrior | 2 Wizard | 3 Archer",
                "Q Main | E Secondary",
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
        if (!this.enemyStats || !this.enemyStats.alive) return;

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.enemy.x,
            this.enemy.y,
            this.player.x,
            this.player.y
        );

        if (distanceToPlayer <= this.enemyStats.chaseRange) {
            const angle = Phaser.Math.Angle.Between(
                this.enemy.x,
                this.enemy.y,
                this.player.x,
                this.player.y
            );

            this.enemy.x += Math.cos(angle) * this.enemyStats.speed;
            this.enemy.y += Math.sin(angle) * this.enemyStats.speed;
        }

        if (distanceToPlayer <= this.enemyStats.attackRange) {
            this.enemyAttackPlayer();
        }

        this.updateEnemyHud();
    }

    enemyAttackPlayer() {
        if (this.enemyAttackCooldown) return;

        const currentClass = this.getCurrentClass();

        currentClass.currentHp -= this.enemyStats.damage;

        this.combatText.setText(
            `${this.enemyStats.name} hit ${currentClass.name} for ${this.enemyStats.damage} damage.`
        );

        if (currentClass.currentHp <= 0) {
            currentClass.currentHp = 0;
            this.playerDeath();
        }

        this.enemyAttackCooldown = true;

        this.time.delayedCall(900, () => {
            this.enemyAttackCooldown = false;
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