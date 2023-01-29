"use strict";
class OwnerFinances {
    constructor(moneyStockpiled, incomeAllocation) {
        this._moneyStockpiled = moneyStockpiled;
        this.incomeAllocation = incomeAllocation;
    }
    static default() {
        return new OwnerFinances(0, OwnerIncomeAllocation.default());
    }
    moneyStockpiled() {
        return this._moneyStockpiled;
    }
    moneyStockpiledAdd(moneyToAdd, world, owner) {
        this._moneyStockpiled += moneyToAdd;
        var bases = owner.bases;
        var salePricePerIndustryToBuild = 1; // todo
        while (this._moneyStockpiled < 0) {
            // Negative money is not allowed.  Have to sell some things.
            var areThereAnyImprovementsLeftToSell = bases.some(x => x.improvementsPresent().length > 0);
            if (areThereAnyImprovementsLeftToSell == false) {
                this._moneyStockpiled = 0;
                break;
            }
            else {
                var baseMoneyThisTurnNetMinSoFar = bases[0].moneyThisTurnNet(world);
                var baseWithBiggestDeficitSoFar = bases[0];
                for (var i = 1; i < bases.length; i++) {
                    var base = bases[i];
                    var baseMoneyThisTurnNet = base.moneyThisTurnNet(world);
                    if (baseMoneyThisTurnNet < baseMoneyThisTurnNetMinSoFar) {
                        baseMoneyThisTurnNetMinSoFar = baseMoneyThisTurnNet;
                        baseWithBiggestDeficitSoFar = base;
                    }
                }
                var improvements = baseWithBiggestDeficitSoFar.improvementsPresent();
                var improvementToSell = improvements[improvements.length - 1];
                var improvementSalePrice = improvementToSell.industryToBuild * salePricePerIndustryToBuild;
                this._moneyStockpiled += improvementSalePrice;
            }
        }
    }
    moneyStockpiledSubtract(moneyToSubtract) {
        if (this._moneyStockpiled < moneyToSubtract) {
            throw new Error("Cannot subtract more money than stockpiled.");
        }
        this._moneyStockpiled -= moneyToSubtract;
    }
}
