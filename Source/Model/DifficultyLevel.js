"use strict";
class DifficultyLevel {
    constructor(name, turnsMax, startingCash, basePopulationBeforeDiscontent, buildDiscountForComputerPlayers, barbarianAttackMultiplier) {
        this.name = name;
        this.turnsMax = turnsMax;
        this.startingCash = startingCash;
        this.basePopulationBeforeDiscontent = basePopulationBeforeDiscontent;
        this.buildDiscountForComputerPlayers = buildDiscountForComputerPlayers;
        this.barbarianAttackMultiplier = barbarianAttackMultiplier;
    }
    static Instances() {
        if (DifficultyLevel._instances == null) {
            DifficultyLevel._instances = new DifficultyLevel_Instances();
        }
        return DifficultyLevel._instances;
    }
    static byName(name) {
        return DifficultyLevel.Instances().byName(name);
    }
}
class DifficultyLevel_Instances {
    constructor() {
        var dl = (n, tm, sc, bpbu, bdfcp, bam) => new DifficultyLevel(n, tm, sc, bpbu, bdfcp, bam);
        // 					 name			turns	cash, 	bpbu,	bdfcp,	bam
        this.Chieftan = dl("Chieftan", 570, 50, 6, 0, 0.25);
        this.Warlord = dl("Warlord", 545, 0, 5, 0, 0.5);
        this.Prince = dl("Prince", 520, 0, 4, 0, 0.75);
        this.King = dl("King", 470, 0, 3, 0, 1);
        this.Emperor = dl("Emperor", 445, 0, 2, .2, 1.25);
        this.Deity = dl("Deity", 420, 0, 1, .4, 1.5);
        this._All =
            [
                this.Chieftan,
                this.Warlord,
                this.Prince,
                this.King,
                this.Emperor,
                this.Deity
            ];
        this._AllByName = new Map(this._All.map(x => [x.name, x]));
    }
    byName(name) {
        return this._AllByName.get(name);
    }
}
