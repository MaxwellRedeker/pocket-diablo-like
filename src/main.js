import Phaser from "phaser";

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {}

    create() {
        this.player = this.add.rectangle(
            400,
            300,
            40,
            40,
            0x3399ff
        );

        this.cursors = this.input.keyboard.addKeys({
            up: "W",
            down: "S",
            left: "A",
            right: "D"
        });

        this.worldWidth = 2000;
        this.worldHeight = 2000;

        this.add.rectangle(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.worldWidth,
            this.worldHeight
        )
        .setStrokeStyle(4, 0xffffff);

        this.cameras.main.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.cameras.main.startFollow(this.player, true);

        this.cameras.main.setZoom(1);
    }

    update() {
        const speed = 4;

        if (this.cursors.left.isDown) {
            this.player.x -= speed;
        }

        if (this.cursors.right.isDown) {
            this.player.x += speed;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= speed;
        }

        if (this.cursors.down.isDown) {
            this.player.y += speed;
        }

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