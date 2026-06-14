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