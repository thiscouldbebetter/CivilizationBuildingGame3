"use strict";
class OwnerIncomeAllocation {
    constructor(moneyFraction, researchFraction, luxuriesFraction) {
        this.moneyFraction = moneyFraction;
        this.researchFraction = researchFraction;
        this.luxuriesFraction = luxuriesFraction;
    }
    static default() {
        return new OwnerIncomeAllocation(.5, .5, 0);
    }
    isValid() {
        var sumOfFractions = this.moneyFraction
            + this.researchFraction
            + this.luxuriesFraction;
        return (sumOfFractions == 1);
    }
}
