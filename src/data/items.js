export const itemTypes = {
    tornCloth: {
        name: "Torn Cloth",
        rarity: "common",
        itemType: "material",
        effects: []
    },

    rustyDagger: {
        name: "Rusty Dagger",
        rarity: "uncommon",
        itemType: "weapon",
        damageBonus: 4,
        effects: [
            {
                type: "bleedChance",
                chance: 100,
                damagePerTick: 2,
                durationMs: 3000
            }
        ]
    },

    slimeGel: {
        name: "Slime Gel",
        rarity: "common",
        itemType: "material",
        effects: []
    },

    greenCore: {
        name: "Green Core",
        rarity: "rare",
        itemType: "material",
        effects: []
    },

    boneShard: {
        name: "Bone Shard",
        rarity: "common",
        itemType: "material",
        effects: []
    },

    ratFang: {
        name: "Rat Fang",
        rarity: "uncommon",
        itemType: "material",
        effects: []
    },

    emberCore: {
        name: "Ember Core",
        rarity: "rare",
        itemType: "material",
        effects: []
    },

    burntHorn: {
        name: "Burnt Horn",
        rarity: "uncommon",
        itemType: "material",
        effects: []
    },

    trainingSword: {
        name: "Training Sword",
        rarity: "common",
        itemType: "weapon",
        damageBonus: 3,
        effects: []
    },

    goblinBlade: {
        name: "Goblin Blade",
        rarity: "uncommon",
        itemType: "weapon",
        damageBonus: 7,
        effects: []
    },

    emberWand: {
        name: "Ember Wand",
        rarity: "rare",
        itemType: "weapon",
        damageBonus: 10,
        effects: [
            {
                type: "burnChance",
                chance: 100,
                damagePerTick: 3,
                durationMs: 3000
            }
        ]
    },

    clothCap: {
        name: "Cloth Cap",
        rarity: "common",
        itemType: "armor",
        slot: "helmet",
        armorBonus: 2,
        effects: []
    },

    goblinVest: {
        name: "Goblin Vest",
        rarity: "uncommon",
        itemType: "armor",
        slot: "chest",
        armorBonus: 5,
        effects: []
    },

    ratHideBoots: {
        name: "Rat-Hide Boots",
        rarity: "uncommon",
        itemType: "armor",
        slot: "boots",
        armorBonus: 3,
        speedBonus: 0.3,
        effects: []
    },

    emberGloves: {
        name: "Ember Gloves",
        rarity: "rare",
        itemType: "armor",
        slot: "gloves",
        armorBonus: 4,
        damageBonus: 2,
        effects: [
            {
                type: "burnChance",
                chance: 15,
                damagePerTick: 3,
                durationMs: 3000
            }
        ]
    }
};