export const playerClasses = {
    warrior: {
        name: "Warrior",
        color: 0xff4444,
        level: 1,
        exp: 0,
        expToNext: 100,
        skillPoints: 0,
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
        },

        skills: {
            power: {
                name: "Sword Mastery",
                level: 0,
                maxLevel: 5
            },

            vitality: {
                name: "Iron Body",
                level: 0,
                maxLevel: 5
            },

            utility: {
                name: "Battle Footwork",
                level: 0,
                maxLevel: 5
            }
        }
    },

    wizard: {
        name: "Wizard",
        color: 0x3399ff,
        level: 1,
        exp: 0,
        expToNext: 100,
        skillPoints: 0,
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
        },

        skills: {
            power: {
                name: "Fire Mastery",
                level: 0,
                maxLevel: 5
            },

            vitality: {
                name: "Mana Shielding",
                level: 0,
                maxLevel: 5
            },

            utility: {
                name: "Arcane Flow",
                level: 0,
                maxLevel: 5
            }
        }
    },

    archer: {
        name: "Archer",
        color: 0x44ff44,
        level: 1,
        exp: 0,
        expToNext: 100,
        skillPoints: 0,
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
        },

        skills: {
            power: {
                name: "Precision",
                level: 0,
                maxLevel: 5
            },

            vitality: {
                name: "Survivalist",
                level: 0,
                maxLevel: 5
            },

            utility: {
                name: "Quick Step",
                level: 0,
                maxLevel: 5
            }
        }
    }
};