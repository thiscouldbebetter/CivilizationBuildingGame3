"use strict";
class Government {
    constructor(name, taxRateMax, foodConsumedPerSettler, discontentPopulationMitigatedByMartialLaw, corruptionPerUnitDistanceFromCapital, industryConsumedByUnitsSupportedByBase) {
        this.name = name;
        this.taxRateMax = taxRateMax;
        this.foodConsumedPerSettler = foodConsumedPerSettler;
        this.discontentPopulationMitigatedByMartialLaw =
            discontentPopulationMitigatedByMartialLaw;
        this.corruptionPerUnitDistanceFromCapital =
            corruptionPerUnitDistanceFromCapital;
        this._industryConsumedByUnitsSupportedByBase =
            industryConsumedByUnitsSupportedByBase;
    }
    static Instances() {
        if (Government._instances == null) {
            Government._instances = new Government_Instances();
        }
        return Government._instances;
    }
    static byName(name) {
        return Government.Instances().byName(name);
    }
    industryConsumedByUnitsSupportedByBase(base) {
        return this._industryConsumedByUnitsSupportedByBase(base);
    }
}
class Government_Instances {
    constructor() {
        var cpudfcTodo = 0; // corruptionPerUnitDistanceFromCapital
        // var supportTodo = (base: any, world: World) => 0;
        var supportPastBaseSize = (industryPerUnitSupportedPastBaseSize) => {
            var returnMethod = (base) => {
                var unitsToSupportCount = base.unitsSupportedCount() - base.population();
                if (unitsToSupportCount < 0) {
                    unitsToSupportCount = 0;
                }
                var industryToSupportUnits = industryPerUnitSupportedPastBaseSize
                    * unitsToSupportCount;
                return industryToSupportUnits;
            };
            return returnMethod;
        };
        var supportPastUnitCount = (industryPerUnitSupportedPastFreeCount, unitsSupportedForFreeCount) => {
            var returnMethod = (base) => {
                var unitsToSupportCount = base.unitsSupportedCount() - unitsSupportedForFreeCount;
                if (unitsToSupportCount < 0) {
                    unitsToSupportCount = 0;
                }
                var industryToSupportUnits = industryPerUnitSupportedPastFreeCount
                    * unitsToSupportCount;
                return industryToSupportUnits;
            };
            return returnMethod;
        };
        // var discontentPopulationMitigatedByMartialLaw = 3;
        var g = (n, t, fps, ml, cor, sup) => new Government(n, t, fps, ml, cor, sup);
        // 						name				tax 	fps, 	mart'l law,	corruption		support
        this.Anarchy = g("Anarchy", .6, 1, 0, cpudfcTodo, supportPastBaseSize(1));
        this.Communism = g("Communism", .8, 2, 3, cpudfcTodo, supportPastUnitCount(1, 3));
        this.Democracy = g("Democracy", 1, 2, 0, cpudfcTodo, supportPastUnitCount(1, 0));
        this.Despotism = g("Despotism", .6, 1, 2, cpudfcTodo, supportPastBaseSize(1));
        this.Fundamentalism = g("Fundamentalism", .8, 2, 3, cpudfcTodo, supportPastUnitCount(1, 10));
        this.Monarchy = g("Monarchy", .7, 1, 3, cpudfcTodo, supportPastUnitCount(1, 3));
        this.Republic = g("Republic", .8, 2, 1, cpudfcTodo, supportPastUnitCount(1, 0));
        this._All =
            [
                this.Anarchy,
                this.Communism,
                this.Democracy,
                this.Despotism,
                this.Fundamentalism,
                this.Monarchy,
                this.Republic
            ];
        this._AllByName = new Map(this._All.map(x => [x.name, x]));
    }
    byName(name) {
        return this._AllByName.get(name);
    }
}
