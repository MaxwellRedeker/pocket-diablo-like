import Phaser from "phaser";

const prefixes = [
    {
        name: "Sharp",
        damageMultiplier: 1.25
    },
    {
        name: "Heavy",
        damageMultiplier: 1.4,
        speedBonus: -0.15
    },
    {
        name: "Flaming",
        effects: [
            {
                type: "burnChance",
                chance: 15,
                damagePerTick: 3,
                durationMs: 3000
            }
        ]
    },
    {
        name: "Jagged",
        effects: [
            {
                type: "bleedChance",
                chance: 20,
                damagePerTick: 2,
                durationMs: 3000
            }
        ]
    }
];

export function generateItem(baseItem) {
    const generatedItem = structuredClone(baseItem);

    const shouldAddPrefix = Phaser.Math.Between(1, 100) <= 35;

    if (!shouldAddPrefix) {
        return generatedItem;
    }

    const prefix = Phaser.Utils.Array.GetRandom(prefixes);

    generatedItem.name = `${prefix.name} ${generatedItem.name}`;

    if (generatedItem.damageBonus && prefix.damageMultiplier) {
        generatedItem.damageBonus = Math.ceil(
            generatedItem.damageBonus * prefix.damageMultiplier
        );
    }

    if (prefix.speedBonus) {
        generatedItem.speedBonus =
            (generatedItem.speedBonus ?? 0) + prefix.speedBonus;
    }

    if (prefix.effects) {
        generatedItem.effects = [
            ...(generatedItem.effects ?? []),
            ...prefix.effects
        ];
    }

    return generatedItem;
}