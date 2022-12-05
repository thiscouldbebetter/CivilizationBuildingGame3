class ResourceProduction
{
	constructor(food, industry, trade)
	{
		this.food = food;
		this.industry = industry;
		this.trade = trade;
	}

	static create()
	{
		return new ResourceProduction(0, 0, 0);
	}

	add(other)
	{
		this.food += other.food;
		this.industry += other.industry;
		this.trade += other.trade;
		return this;
	}

	clear()
	{
		this.food = 0;
		this.industry = 0;
		this.trade = 0;
		return this;
	}

	clone()
	{
		return new ResourceProduction(this.food, this.industry, this.trade);
	}

	equals(other)
	{
		var returnValue =
		(
			this.food == other.food
			&& this.industry == other.industry
			&& this.trade == other.trade
		);

		return returnValue;
	}

	overwriteWith(other)
	{
		this.food = other.food;
		this.industry = other.industry;
		this.trade = other.trade;
		return this;
	}

	sumOfResourceQuantities()
	{
		return this.food + this.industry + this.trade;
	}
}
