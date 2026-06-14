import Phaser from "phaser";

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {}

    create() {
        this.worldWidth = 2000;
        this.worldHeight = 2000;

        this.classes = {
            warrior: {
                name: "Warrior",
                color: 0xff4444,
                level: 1,
                exp: 0,
                expToNext: 100,
                hp: 150,
                mana: 25,
                speed: 4,
                ability: "Slash"
            },
            wizard: {
                name: "Wizard",
                color: 0x3399ff,
                level: 1,
                exp: 0,
                expToNext: 100,
                hp: 80,
                mana: 120,
                speed: 4,
                ability: "Fireball"
            },
            archer: {
                name: "Archer",
                color: 0x44ff44,
                level: 1,
                exp: 0,
                expToNext: 100,
                hp: 100,
                mana: 60,
                speed: 5,
                ability: "Arrow Shot"
            }
        };

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
            ability: "SPACE"
        });

        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.SPACE
        ]);

        this.hudText = this.add.text(10, 10, "", {
            fontSize: "18px",
            color: "#ffffff"
        });

        this.hudText.setScrollFactor(0);

        this.updateHud();

        this.cameras.main.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(1);
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

    getCurrentClass() {
        return this.classes[this.currentClassKey];
    }

    switchClass(classKey) {
        this.currentClassKey = classKey;
        this.player.fillColor = this.getCurrentClass().color;
        this.updateHud();
    }

    useAbility() {
        const currentClass = this.getCurrentClass();

        console.log(`${currentClass.name} used ${currentClass.ability}`);

        // No EXP here.
        // EXP will come later from killing enemies.
    }

    updateHud() {
        const currentClass = this.getCurrentClass();

        this.hudText.setText(
            [
                `Class: ${currentClass.name}`,
                `Level: ${currentClass.level}`,
                `EXP: ${currentClass.exp} / ${currentClass.expToNext}`,
                `HP: ${currentClass.hp}`,
                `Mana: ${currentClass.mana}`,
                `Ability: ${currentClass.ability}`,
                "",
                "1 = Warrior",
                "2 = Wizard",
                "3 = Archer",
                "SPACE = Use Ability",
                "WASD = Move"
            ].join("\n")
        );
    }

    update() {
        const currentClass = this.getCurrentClass();
        const speed = currentClass.speed;

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) {
            moveX -= speed;
        }

        if (this.cursors.right.isDown) {
            moveX += speed;
        }

        if (this.cursors.up.isDown) {
            moveY -= speed;
        }

        if (this.cursors.down.isDown) {
            moveY += speed;
        }

        this.player.x += moveX;
        this.player.y += moveY;

        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            20,
            this.worldWidth - 20
        );

        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            20,
            this.worldHeight - 20
        );

        if (Phaser.Input.Keyboard.JustDown(this.keys.warrior)) {
            this.switchClass("warrior");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.wizard)) {
            this.switchClass("wizard");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.archer)) {
            this.switchClass("archer");
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ability)) {
            this.useAbility();
        }
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