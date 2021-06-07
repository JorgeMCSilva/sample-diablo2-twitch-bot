module.exports = {
    fbr: {
        default: 'Please utilize the command as the following example "!fbr barbarian" (without the quotes)',
        amazon: {
            default: 'Please provide additional options. 1hand or other',
            "1hand": 'Amazon hit by 1hand -> %FBR Frames => 0% 17 - 4% 16 - 6% 15 - 11% 14 - 15% 13 - 23% 12 - 29% 11 - 40% 10 - 56% 9 - 80% 8 - 120% 7 - 200% 6 - 480% 5',
            other: 'Amazon hit by other -> %FBR Frames => 0% 5 - 13% 4 - 32% 3 - 86% 2 - 600% 1',
        },
        assassin: 'assassin -> %FBR Frames => 0% 5 - 13% 4 - 32% 3 - 86% 2 - 600% 1',
        barbarian: 'barbarian -> %FBR Frames => 0% 7 - 9% 6 - 20% 5 - 42% 4 - 86% 3 - 280% 2',
        druid: {
            default: 'druid -> %FBR Frames => 0% 11 - 6% 10 - 13% 9 - 20% 8 - 32% 7 - 52% 6 - 86% 5 - 174% 4 - 600% 3',
            wolf: 'druid_wolf -> %FBR Frames => 0% 9 - 7% 8 - 15% 7 - 27% 6 - 48% 5 - 86% 4 - 200% 3',
            bear: 'druid_bear -> %FBR Frames => 0% 12 - 5% 11 - 10% 10 - 16% 9 - 27% 8 - 40% 7 - 65% 6 - 109% 5 - 223% 4',
        },
        necromancer: 'necromancer -> %FBR Frames => 0% 11 - 6% 10 - 13% 9 - 20% 8 - 32% 7 - 52% 6 - 86% 5 - 174% 4 - 600% 3',
        paladin:{
            default: 'Please provide additional options. holy or normal shield. Example "!fbr paladin holy" (without the quotes)',
            holy: 'paladin with holy shield -> %FBR Frames => 0% 2 - 86% 1',
            normal: 'paladin with normal shield -> %FBR Frames => 0% 5 - 13% 4 - 32% 3 - 86% 2 - 600% 1',
        },
        sorceress: 'sorceress -> %FBR Frames => 0% 9 - 7% 8 - 15% 7 - 27% 6 - 48% 5 - 86% 4 - 200% 3 - 4680% 2',
    },
};
