
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
		this.population = population || 1;
		this.landUsage = landUsage || BaseLandUsage.default();
		this.foodStockpiled = foodStockpiled || 0;
		this.industry = industry || BaseIndustry.default();

		this.unitsSupportedIds = [];
	}

	static fromNamePosAndOwnerName(name, pos, ownerName)
	{
		return new Base(name, pos, ownerName, null, null, null, null);
	}

	buildableBuildByDefnName(buildableToBuildDefnName, world, owner)
	{
		this.industry.buildableBuildByDefnName(buildableToBuildDefnName, world, owner, this);
	}

	buildablesAvailableNames(world)
	{
		var owner = this.owner(world);
		var buildablesKnownNames = owner.buildablesKnownNames(world);
		var buildablesAvailableNames = buildablesKnownNames; // todo
		return buildablesAvailableNames;
	}

	category()
	{
		return SelectableCategory.Instances().Bases;
	}

	distanceFromCapital(world)
	{
		var owner = this.owner(world);
		var returnValue = Math.floor
		(
			owner.baseCapital().pos.clone().subtract(this.pos).absolute().magnitude()
		);
		return returnValue;
	}

	initialize(world)
	{
		var cellOccupied = world.map.cellAtPosInCells(this.pos);
		cellOccupied.improvementAddIrrigation();
		cellOccupied.improvementAddRoads();
		this.landUsage.optimize(world, this);
	}

	isBuildingSomething()
	{
		return (this.isIdle() == false);
	}

	isIdle()
	{
		return (this.industry.buildableInProgressName == null);
	}

	owner(world)
	{
		return world.owners.find(x => x.name == this.ownerName);
	}

	resourcesProducedThisTurn(world)
	{
		return this.landUsage.resourcesProducedThisTurn(world, this);
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

	// Resources.

	corruptionPerUnitDistanceFromCapital()
	{
		return 0; // todo
	}

	corruptionThisTurn(world)
	{
		var distanceFromCapital = this.distanceFromCapital(world);
		var owner = this.owner(world);
		var corruptionPerUnitDistance =
			owner.corruptionPerUnitDistanceFromCapital();
		var corruptionThisTurn = Math.floor
		(
			corruptionPerUnitDistance * distanceFromCapital
		);
		return corruptionThisTurn;
	}

	foodThisTurn()
	{
		return this.resourcesProducedThisTurn().food;
	}

	industryThisTurn()
	{
		return this.resourcesProducedThisTurn().industry;
	}

	landUsageOptimize(world)
	{
		this.landUsage.optimize(world, this);
	}

	luxuriesThisTurn()
	{
		return 0; // todo
	}

	moneyThisTurn(world)
	{
		var tradeThisTurn = this.tradeThisTurnNet(world);
		var owner = this.owner(world);
		var taxRate = owner.taxRate();
		var moneyThisTurn = Math.ceil(taxRate * tradeThisTurn);
		return moneyThisTurn;
	}

	researchThisTurn(world)
	{
		var tradeThisTurnNet = this.tradeThisTurnNet(world);
		var moneyThisTurn = this.moneyThisTurn(world);
		var researchThisTurn = tradeThisTurnNet - moneyThisTurn;
		return researchThisTurn;
	}

	tradeThisTurnGross(world)
	{
		var resources = this.resourcesProducedThisTurn(world);
		return resources.trade;
	}

	tradeThisTurnNet(world)
	{
		var gross = this.tradeThisTurnGross(world);
		var corruption = this.corruptionThisTurn(world);
		var net = gross - corruption;
		return net;
	}

	// Units.

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
	constructor(name, industryToBuild, effect)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
		this.effect = effect;
	}

	static Instances()
	{
		if (BaseImprovementDefn._instances == null)
		{
			BaseImprovementDefn._instances = new BaseImprovementDefn_Instances();
		}
		return BaseImprovementDefn._instances;
	}

	static byName(name)
	{
		return BaseImprovementDefn.Instances().byName(name);
	}
}

class BaseImprovementDefn_Instances
{
	constructor()
	{
		var effectTodo = "todo";
		var bid = (n, i, e) => new BaseImprovementDefn(n, i, e);

		this.Airport 			= bid("Airport", 			160, 	effectTodo);
		this.Aqueduct 			= bid("Aqueduct", 			80, 	effectTodo);
		this.Bank 				= bid("Bank", 				120, 	effectTodo);
		this.Barracks 			= bid("Barracks", 			40, 	effectTodo);
		this.Capitalization 	= bid("Capitalization", 	null, 	effectTodo);
		this.Cathedral 			= bid("Cathedral", 			120, 	effectTodo);
		this.CityWalls 			= bid("City Walls", 		80, 	effectTodo);
		this.CoastalFortress 	= bid("Coastal Fortress", 	80, 	effectTodo);
		this.Colosseum			= bid("Colosseum", 			100, 	effectTodo);
		this.Courthouse 		= bid("Courthouse", 		80, 	effectTodo);
		this.Factory 			= bid("Factory", 			200, 	effectTodo);
		this.Granary 			= bid("Granary", 			60, 	effectTodo);
		this.Harbor 			= bid("Harbor",				60,		effectTodo);
		this.HydroPlant 		= bid("HydroPlant", 		240,	effectTodo);
		this.Library 			= bid("Library", 			80, 	effectTodo);
		this.ManufacturingPlant = bid("Manufacturing Plant", 320, 	effectTodo);
		this.Marketplace		= bid("Marketplace", 		80, 	effectTodo);
		this.MassTransit		= bid("Mass Transit", 		160, 	effectTodo);
		this.NuclearPlant		= bid("Nuclear Plant", 		160, 	effectTodo);
		this.OffshorePlatform 	= bid("Offshore Platform", 	160,	effectTodo);
		this.Palace 			= bid("Palace", 			10, 	effectTodo);
		this.PoliceStation 		= bid("Police Station", 	60, 	effectTodo);
		this.PortFacility 		= bid("Port Facility", 		80, 	effectTodo);
		this.PowerPlant 		= bid("Power Plant", 		160,	effectTodo);
		this.RecyclingCenter	= bid("Recycling Center", 	200, 	effectTodo);
		this.ResearchLab		= bid("Research Lab", 		160,	effectTodo);
		this.SamMissileBattery 	= bid("SAM Missile Battery", 100,	effectTodo);
		this.SdiDefense 		= bid("SDI Defense", 		200, 	effectTodo);
		this.SsComponent		= bid("SS Component",		160, 	effectTodo);
		this.SsModule 			= bid("SS Module", 			320, 	effectTodo);
		this.SsStructural		= bid("SS Structural",		80, 	effectTodo);
		this.SewerSystem 		= bid("Sewer System", 		120, 	effectTodo);
		this.SolarPlant			= bid("Solar Plant", 		320, 	effectTodo);
		this.StockExchange 		= bid("Stock Exchange", 	160, 	effectTodo);
		this.Superhighways		= bid("Superhighways",		200, 	effectTodo);
		this.Supermarket		= bid("Supermarket",		80,		effectTodo);
		this.Temple 			= bid("Temple", 			40, 	effectTodo);
		this.University 		= bid("University",			160,	effectTodo);

		this.AdamSmithsTradingCo 	= bid("Adam Smith's Trading Co",	400, effectTodo);
		this.ApolloProgram 			= bid("Apollo Program",				600, effectTodo);
		this.Colossus 				= bid("Colossus",					200, effectTodo);
		this.CopernicusObservatory 	= bid("Copernicus' Observatory",	300, effectTodo);
		this.CureForCancer 			= bid("Cure for Cancer",			600, effectTodo);
		this.DarwinsVoyage 			= bid("Darwin's Voyage",			400, effectTodo);
		this.EiffelTower 			= bid("Eiffel Tower",				300, effectTodo);
		this.GreatLibrary 			= bid("Great Library",				300, effectTodo);
		this.GreatWall 				= bid("GreatWall",					300, effectTodo);
		this.HangingGardens 		= bid("HangingGardens",				200, effectTodo);
		this.HooverDam 				= bid("Hoover Dam",					600, effectTodo);
		this.IsaacNewtonsCollege 	= bid("Isaac Newton's College",		400, effectTodo);
		this.JsBachsCathedral		= bid("J.S. Bach's Cathedral",		400, effectTodo);
		this.KingRichardsCrusade 	= bid("King Richard's Crusade",		300, effectTodo);
		this.LeonardosWorkshop 		= bid("Leonardo's Workshop",		400, effectTodo);
		this.Lighthouse 			= bid("Lighthouse",					200, effectTodo);
		this.MagellansExpedition 	= bid("Magellan's Expedition",		400, effectTodo);
		this.ManhattanProject 		= bid("Manhattan Project",			600, effectTodo);
		this.MarcoPolosEmbassy 		= bid("Marco's Polo's Embassy", 	200, effectTodo);
		this.MichelangelosChapel 	= bid("Michelangelo's Chapel", 		400, effectTodo);
		this.Oracle					= bid("Oracle",						300, effectTodo);
		this.Pyramids 				= bid("Pyramids",					200, effectTodo);
		this.SetiProgram 			= bid("SETI Program",				600, effectTodo);
		this.ShakespearesTheatre 	= bid("Shakespeare's Theatre",		300, effectTodo);
		this.StatueOfLiberty 		= bid("Statue of Liberty",			400, effectTodo);
		this.SunTzusWarAcademy 		= bid("Sun Tzu's War Academy", 		300, effectTodo);
		this.UnitedNations 			= bid("United Nations",				600, effectTodo);
		this.WomensSuffrage 		= bid("Women's Suffrage",			600, effectTodo);

		this._All =
		[
			this.Airport,
			this.Aqueduct,
			this.Bank,
			this.Barracks,
			this.Capitalization,
			this.Cathedral,
			this.CityWalls,
			this.CoastalFortress,
			this.Colosseum,
			this.Courthouse,
			this.Factory,
			this.Granary,
			this.Harbor,
			this.HydroPlant,
			this.Library,
			this.ManufacturingPlant,
			this.Marketplace,
			this.MassTransit,
			this.NuclearPlant,
			this.OffshorePlatform,
			this.Palace,
			this.PoliceStation,
			this.PortFacility,
			this.PowerPlant,
			this.RecyclingCenter,
			this.ResearchLab,
			this.SamMissileBattery,
			this.SdiDefense,
			this.SsComponent,
			this.SsModule,
			this.SsStructural,
			this.SewerSystem,
			this.SolarPlant,
			this.StockExchange,
			this.Superhighways,
			this.Supermarket,
			this.Temple,
			this.University,

			this.AdamSmithsTradingCo,
			this.ApolloProgram,
			this.Colossus,
			this.CopernicusObservatory,
			this.CureForCancer,
			this.DarwinsVoyage,
			this.EiffelTower,
			this.GreatLibrary,
			this.GreatWall,
			this.HangingGardens,
			this.HooverDam,
			this.IsaacNewtonsCollege,
			this.JsBachsCathedral,
			this.KingRichardsCrusade,
			this.LeonardosWorkshop,
			this.Lighthouse,
			this.MagellansExpedition,
			this.ManhattanProject,
			this.MarcoPolosEmbassy,
			this.MichelangelosChapel,
			this.Oracle,
			this.Pyramids,
			this.SetiProgram,
			this.ShakespearesTheatre,
			this.StatueOfLiberty,
			this.SunTzusWarAcademy,
			this.UnitedNations,
			this.WomensSuffrage
		];

		this._AllByName = new Map(this._All.map(x => [ x.name, x ] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
	}
}

class BaseIndustry
{
	constructor(buildableInProgressName, industryStockpiled)
	{
		this.buildableInProgressName = buildableInProgressName;
		this.industryStockpiled = industryStockpiled || 0;
	}

	static default()
	{
		return new BaseIndustry(null, 0);
	}

	buildableBuildByDefnName(buildableToBuildDefnName, world, owner, base)
	{
		var buildableToBuild = BaseBuildable.byName(buildableToBuildDefnName)
		if (buildableToBuild == null)
		{
			throw new Error("Unrecognized buildable name: " + buildableToBuildDefnName);
		}
		else if (owner.canBuildBuildableWithDefnName(buildableToBuildDefnName) == false)
		{
			throw new Error("Cannot build buildable with name: " + buildableToBuildDefnName);
		}
		else
		{
			this.buildableInProgressName = buildableToBuildDefnName;
			this.industryStockpiled = 0;
		}
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

	buildableInProgressClear()
	{
		this.buildableInProgressName = null;
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

	turnUpdate(world, base)
	{
		var buildableInProgress = this.buildableInProgress(world, base);
		if (buildableInProgress != null)
		{
			var resourcesThisTurn = base.resourcesProducedThisTurn(world);
			var industryThisTurn = resourcesThisTurn.industry;
			this.industryStockpiled += industryThisTurn;
			var industryRequired = buildableInProgress.industryToBuild;
			if (this.industryStockpiled >= industryRequired)
			{
				buildableInProgress.build(world, base);
				this.buildableInProgressClear();
			}
		}
	}
}

class BaseLandUsage
{
	constructor(offsetsInUse)
	{
		this.offsetsInUse = offsetsInUse || [];

		this._resourcesProducedThisTurn = ResourceProduction.create();
	}

	static default()
	{
		return new BaseLandUsage(null);
	}

	optimize(world, base)
	{
		// todo - This isn't very efficient.

		this._resourcesProducedThisTurn = null;

		var map = world.map;

		this.offsetsInUse.length = 0;

		var offset = Coords.zeroes(); // The center is always in use.
		this.offsetsInUse.push(offset.clone());

		var cellPos = Coords.create();

		for (var p = 0; p < base.population; p++)
		{
			var offsetValueMaxSoFar = 0;
			var offsetWithValueMaxSoFar = null;

			for (var y = -2; y <= 2; y++)
			{
				offset.y = y;

				for (var x = -2; x <= 2; x++)
				{
					offset.x = x;

					var offsetAbsoluteSumOfDimensions =
						offset.clone().absolute().sumOfDimensions();
					var isAvailableOffset =
					(
						offsetAbsoluteSumOfDimensions > 0
						&& offsetAbsoluteSumOfDimensions < 4
					);

					if (isAvailableOffset)
					{
						cellPos.overwriteWith(base.pos).add(offset);
						var cellAtOffset = map.cellAtPosInCells(cellPos);
						var offsetValue = cellAtOffset.value(world, base);

						if (offsetValue > offsetValueMaxSoFar)
						{
							offsetValueMaxSoFar = offsetValue;
							offsetWithValueMaxSoFar = offset.clone();
						}
					}
				}
			}

			this.offsetsInUse.push(offsetWithValueMaxSoFar);
		}

		return this;
	}

	resourcesProducedThisTurn(world, base)
	{
		if (this._resourcesProducedThisTurn == null)
		{
			this._resourcesProducedThisTurn = ResourceProduction.create();

			var basePos = base.pos;
			var cellsInUsePositions =
				this.offsetsInUse.map(x => x.clone().add(basePos));
			var map = world.map;
			var cellsInUse =
				cellsInUsePositions.map(x => map.cellAtPosInCells(x) );
			var resourcesProducedByCells =
				cellsInUse.map(x => x.resourcesProduced(world, base) );
			resourcesProducedByCells.forEach
			(
				x => this._resourcesProducedThisTurn.add(x)
			);
		}
		return this._resourcesProducedThisTurn;
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
		// todo
	}
}
