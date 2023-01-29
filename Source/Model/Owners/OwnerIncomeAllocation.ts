
class OwnerIncomeAllocation
{
	moneyFraction: number;
	researchFraction: number;
	luxuriesFraction: number;

	constructor
	(
		moneyFraction: number,
		researchFraction: number,
		luxuriesFraction: number
	)
	{
		this.moneyFraction = moneyFraction;
		this.researchFraction = researchFraction;
		this.luxuriesFraction = luxuriesFraction;
	}

	static default(): OwnerIncomeAllocation
	{
		return new OwnerIncomeAllocation(.5, .5, 0);
	}

	isValid(): boolean
	{
		var sumOfFractions =
			this.moneyFraction
			+ this.researchFraction
			+ this.luxuriesFraction;

		return (sumOfFractions == 1);
	}
}
