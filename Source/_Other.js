class Color
{
	constructor(name, systemColor)
	{
		this.name = name;
		this.systemColor = systemColor;
	}
}

class IdHelper
{
	static _idNext = 0;

	static idNext()
	{
		var id = this._idNext;
		this._idNext++;
		return id;
	}
}

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
	}
}

class SelectableCategory
{
	constructor(index, name)
	{
		this.index = index;
		this.name = name;
	}

	static Instances()
	{
		if (SelectableCategory._instances == null)
		{
			SelectableCategory._instances = new SelectableCategory_Instances();
		}
		return SelectableCategory._instances;
	}

	static byName(name)
	{
		return SelectableCategory.Instances().byName(name);
	}
}

class SelectableCategory_Instances
{
	constructor()
	{
		this.Bases = new SelectableCategory(0, "Bases");
		this.Units = new SelectableCategory(1, "Units");

		this._All =
		[
			this.Bases,
			this.Units
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) )
	}
}

class Universe
{
	constructor(display, inputHelper, outputLog, world)
	{
		this.display = display;
		this.inputHelper = inputHelper;
		this.outputLog = outputLog;
		this.world = world;
	}

	initialize()
	{
		this.inputHelper.initialize(this);
		this.display.initialize(this);
		this.world.initialize(this);
	}
}
