
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
		this.id = IdHelper.idNext();

		this.name = name || ("City" + this.id);
		this.pos = pos;
		this.ownerName = ownerName;
		this.population = population;
		this.landUsage = landUsage;
		this.foodStockpiled = foodStockpiled;
		this.industry = industry;

		this.unitsSupportedIds = [];
	}

	category()
	{
		return SelectableCategory.Instances().Bases;
	}

	initialize(world)
	{
		// todo
	}

	isIdle()
	{
		return (this.industry.buildableInProgressName == null);
	}

	owner(world)
	{
		return world.owners.find(x => x.name == this.ownerName);
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

	turnUpdate(world)
	{
		this.landUsage.turnUpdate(world, this);
		this.industry.turnUpdate(world, this);
	}

	unitSupport(unit)
	{
		this.unitsSupportedIds.push(unit.id);
	}

	unitsSupported(world)
	{
		return this.unitsSupportedIds.map(x => world.unitById(x));
	}
}

class BaseBuildable
{
	static byName(name)
	{
		var returnValue = null;

		var unitDefn = UnitDefn.byName(name);
		if (unitDefn != null)
		{
			returnValue = unitDefn;
		}
		else
		{
			var improvementDefn = BaseImprovementDefn.byName(name);
			returnValue = improvementDefn;
		}

		return returnValue;
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

	buildableInProgress(world, base)
	{
		var returnValue = null;

		if (this.buildableInProgressName != null)
		{
			var owner = base.owner(world);
			returnValue = BaseBuildable.byName
			(
				this.buildableInProgressName
			);
		}

		return returnValue;
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
		var industryThisTurn = 1; // hack
		this.industryStockpiled += industryThisTurn;
		var buildableInProgress = this.buildableInProgress(world);
		var industryRequired = buildableInProgress.industryToBuild;
		if (this.industryStockpiled >= industryRequired)
		{
			buildable.build(world, base);
		}
	}
}

class BaseLandUsage
{
	constructor(offsetsInUse)
	{
		this.offsetsInUse = offsetsInUse || [];
	}

	static default()
	{
		return new BaseLandUsage(null);
	}

	optimize(base)
	{
		this.offsetsInUse.length = 0;

		var offset = Coords.create();

		for (var y = -2; y <= 2; y++)
		{
			offset.y = y;

			for (var x = -2; x <= 2; x++)
			{
				offset.x = x;

				this.offsetsInUse.push(offset.clone());
			}
		}
	}

	toString()
	{
		var returnValue =
			"Land Usage: "
			+ this.offsetsInUse.map(x => x.toString()).join(";");

		return returnValue;
	}

	turnUpdate(world, base)
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
