
class Base
{
	constructor
	(
		name,
		pos,
		ownerName,
		population,
		landUsage,
		foodStockpiled,
		industry
	)
	{
		this.name = name;
		this.pos = pos;
		this.ownerName = ownerName;
		this.population = population;
		this.landUsage = landUsage;
		this.foodStockpiled = foodStockpiled;
		this.industry = industry;
	}

	initialize(world)
	{
		// todo
	}

	toStringDetails(world)
	{
		var defn = this.defn(world);

		var lines =
		[
			"Name: " + this.id,
			"Onwer:" + this.ownerName,
			"Position: " + this.pos.toString(),
			"Population: " + this.population,
			"Food: " + this.foodStockpiled,
			this.landUsage.toString(),
			this.industry.toString()
		];

		var linesJoined = lines.join("<br />");

		return linesJoined;
	}

	toStringForList()
	{
		return this.name + " @" + this.pos.toString();
	}

	turnAdvance(world)
	{
		this.landUsage.turnAdvance(world, this);
		this.industry.turnAdvance(world, this);
	}
}

class BaseImprovementDefn
{
	constructor(name, effect)
	{
		this.name = name;
		this.effect = effect;
	}
}

class BaseIndustry
{
	constructor(buildableInProgressName, industryStockpiled)
	{
		this.buildableInProgressName = buildableInProgressName;
		this.industryStockpiled = industryStockpiled;
	}

	toString()
	{
		var returnValue =
			"Building: "
			+ this.buildableInProgressName
			+ this.industryStockpiled
			+ "/?"; // todo

		return returnValue;
	}

	turnAdvance(world, base)
	{
		// todo
	}
}

class BaseLandUsage
{
	constructor(offsetsInUse)
	{
		this.offsetsInUse = offsetsInUse;
	}

	toString()
	{
		return "Land Usage: " + this.offsetsInUse.map(x => x.toString()).join(";");
	}

	turnAdvance(world, base)
	{
		var basePos = base.pos;
		var cellsInUsePositions =
			this.offsetsInUse.map(x => x.clone().add(basePos));
		var map = world.map();
		var cellsInUse =
			cellsInUsePositions.map(x => map.cellAtPosInCells(x) );
		var resourcesProducedByCells =
			cellsInUse.map(x => x.resourcesProduced(world, base) );
		var resourcesProducedByBase =
			ResourceProduction.create();
		resourcesProducedByCells.forEach(x => resourcesProducedByBase.add(x) );
		// todo
	}
}
