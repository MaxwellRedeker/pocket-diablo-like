export const enemyTypes = [
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