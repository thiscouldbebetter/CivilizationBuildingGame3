class ResourceProduction
{
	food: number;
	industry: number;
	trade: number;

	constructor(food: number, industry: number, trade: number)
	{
		this.food = food;
		this.industry = industry;
		this.trade = trade;
	}

	static create(): ResourceProduction
	{
		return new ResourceProduction(0, 0, 0);
	}

	add(other: ResourceProduction): ResourceProduction
	{
		this.food += other.food;
		this.industry += other.industry;
		this.trade += other.trade;
		return this;
	}

	clear(): ResourceProduction
	{
		this.food = 0;
		this.industry = 0;
		this.trade = 0;
		return this;
	}

	clone(): ResourceProduction
	{
		return new ResourceProduction
		(
			this.food, this.industry, this.trade
		);
	}

	equals(other: ResourceProduction): boolean
	{
		var returnValue =
		(
			this.food == other.food
			&& this.industry == other.industry
			&& this.trade == other.trade
		);

		return returnValue;
	}

	overwriteWith(other: ResourceProduction): ResourceProduction
	{
		this.food = other.food;
		this.industry = other.industry;
		this.trade = other.trade;
		return this;
	}

	sumOfResourceQuantities(): number
	{
		return this.food + this.industry + this.trade;
	}
}
