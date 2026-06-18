import Phaser from "phaser";

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
                damage: 8
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
                damage: 6
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
                damage: 10
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
                damage: 14
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
            secondary: "E"
        });

        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.Q,
            Phaser.Input.Keyboard.KeyCodes.E
        ]);

        this.hudText = this.add.text(10, 10, "", {
            fontSize: "18px",
            color: "#ffffff"
        });
        this.hudText.setScrollFactor(0);

        this.combatText = this.add.text(10, 300, "", {
            fontSize: "18px",
            color: "#ffff99"
        });
        this.combatText.setScrollFactor(0);

        this.enemyAttackCooldown = false;
        this.secondaryCooldown = false;

        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(1);

        this.spawnEnemy();
        this.updateHud();
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
            name: enemyTemplate.name,
            hp: enemyTemplate.hp,
            maxHp: enemyTemplate.hp,
            expReward: enemyTemplate.expReward,
            goldMin: enemyTemplate.goldMin,
            goldMax: enemyTemplate.goldMax,
            alive: true,
            speed: enemyTemplate.speed,
            chaseRange: enemyTemplate.chaseRange,
            attackRange: enemyTemplate.attackRange,
            damage: enemyTemplate.damage,
            size: enemyTemplate.size
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

    showAttackFlash(range) {
        const flash = this.add.circle(this.player.x, this.player.y, range, 0xffffff, 0.12);

        this.time.delayedCall(120, () => {
            flash.destroy();
        });
    }

    killEnemy() {
        const currentClass = this.getCurrentClass();
        const goldReward = Phaser.Math.Between(
            this.enemyStats.goldMin,
            this.enemyStats.goldMax
        );

        this.gold += goldReward;

        this.enemyStats.alive = false;
        this.enemy.setFillStyle(0x555555);

        const levelUpMessage = this.gainExp(this.enemyStats.expReward);

        this.combatText.setText(
            `${this.enemyStats.name} defeated.\n` +
            `${currentClass.name} gained ${this.enemyStats.expReward} EXP.\n` +
            `Found ${goldReward} gold.\n` +
            `${levelUpMessage}` +
            "Enemy respawning in 4 seconds..."
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

            levelUpMessage += `${currentClass.name} leveled up to Level ${currentClass.level}!\n`;
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

        this.hudText.setText(
            [
                `Class: ${currentClass.name}`,
                `Level: ${currentClass.level}`,
                `EXP: ${currentClass.exp} / ${currentClass.expToNext}`,
                `Gold: ${this.gold}`,
                `HP: ${currentClass.currentHp} / ${currentClass.maxHp}`,
                `Mana: ${currentClass.mana}`,
                `Q Main: ${currentClass.ability.name}`,
                `E Secondary: ${currentClass.secondary.name}`,
                `Damage: ${currentClass.ability.damage}`,
                `Range: ${currentClass.ability.range}`,
                `Type: ${currentClass.ability.type}`,
                "",
                "Enemy:",
                this.enemyStats
                    ? `${this.enemyStats.name} - HP ${this.enemyStats.hp}/${this.enemyStats.maxHp}`
                    : "None",
                "",
                "1 = Warrior",
                "2 = Wizard",
                "3 = Archer",
                "Q = Main Attack",
                "E = Secondary / Shield",
                "WASD = Move"
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
    width: 800,
    height: 600,
    backgroundColor: "#111111",
    scene: GameScene
};

new Phaser.Game(config);