
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

		this.improvementsPresentNames = [];
		this.unitsSupportedIds = [];
	}

	static fromNamePosAndOwnerName(name, pos, ownerName)
	{
		return new Base(name, pos, ownerName, null, null, null, null);
	}

	buildableStart(buildableToBuild, world)
	{
		var owner = this.owner(world);
		this.industry.buildableStart
		(
			buildableToBuild, world, owner, this
		);
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

	isExperiencingUnrest(world)
	{
		var difficultyLevel = world.difficultyLevel();
		var populationMaxBeforeUnhappiness =
			difficulty.basePopulationBeforeUnhappiness;

		var unhappinessDueToOverpopulation =
			this.population - populationMaxBeforeUnhappiness;
		if (unhappinessDueToOverpopulation < 0)
		{
			unhappinessDueToOverpopulation = 0;
		}

		var unhappinessDueToMilitaryDeployment = 0;
		var unitsSupported = this.unitsSupported();
		var unitsMilitary = unitsSupported.filter(x => x.isMilitary())
		var unitsMilitaryDeployed =
			unitsMilitary.filter(x => x.isInHomeBase() == false);
		var unitsMilitaryDeployedCount = unitsMilitaryDeployed.length;
		if (unitsMilitaryDeployedCount > 0)
		{
			var governments = Government.Instances();

			if (owner.governmentIs(governments.Republic))
			{
				unhappinessDueToMilitaryDeployment +=
					unitsMilitaryDeployedCount;
			}
			else if (owner.governmentIs(governments.Democracy))
			{
				unhappinessDueToMilitaryDeployment +=
					unitsMilitaryDeployedCount * 2;
			}

			var hasPoliceStation = this.hasImprovementPoliceStation();
			if (hasPoliceStation)
			{
				unhappinessDueToMilitaryDeployment--;
			}

			if (unhappinessDueToMilitaryDeployment < 0)
			{
				unhappinessDueToMilitaryDeployment = 0;
			}
		}

		var improvementsPresent = this.improvementsPresent();

		if (unhappyPopulationCount > 0)
		{
			var unhappinessMitigatedByImprovements = 0;
			improvementsPresent.forEach
			(
				x => unhappinessMitigatedByImprovements += x.unhappyPopulationMitigated()
			);

			var owner = this.owner(world);
			var ownerGovernment = owner.government;
			var unitsPresentMilitary = this.unitsPresentMilitary();
			var unhappinessMitigatedByMartialLaw =
				unitsPresentMilitary.length;
			var martialLawMax =
				ownerGovernment.unhappyPopulationMitigatedByMartialLaw;
			if (unhappinessMitigatedByMartialLaw > martialLawMax)
			{
				unhappinessMitigatedByMartialLaw = martialLawMax;
			}

			var unhappinessMitigatedTotal =
				unhappinessMitigatedByImprovements
				+ unhappinessMitigatedByMartialLaw;

			unhappyPopulationCount -= unhappinessMitigatedTotal;
		}

		var returnValue = (unhappyPopulationCount > 0);
		return isExperiencingUnrest;
	}

	isIdle()
	{
		return (this.industry.buildableInProgressName == null);
	}

	mapCellOccupied(world)
	{
		return world.map.cellAtPosInCells(this.pos);
	}

	owner(world)
	{
		return world.owners.find(x => x.name == this.ownerName);
	}

	populationAdd(populationChange)
	{
		this.population += populationChange;
	}

	populationCanGrow()
	{
		var canGrow;

		var improvements = BaseImprovementDefn.Instances();

		if (this.population < 8)
		{
			canGrow = true;
		}
		else if
		(
			this.population < 12
			&& this.hasImprovement(improvements.Aqueduct)
		)
		{
			canGrow = true;
		}
		else if (this.hasImprovement(improvements.SewerSystem))
		{
			canGrow = true;
		}
		else
		{
			canGrow = false;
		}

		return canGrow;
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

		var foodThisTurnNet = this.foodThisTurnNet(world);
		this.foodStockpiled += foodThisTurnNet;
		var foodNeededToGrow = this.foodNeededToGrow();
		if (this.foodStockpiled < 0)
		{
			this.populationAdd(-1);
			if (this.population <= 0)
			{
				world.baseRemove(this);
			}
			this.landUsage.offsetRemoveWorst(world, this);
		}
		else if (this.foodStockpiled >= foodNeededToGrow)
		{
			if (this.populationCanGrow())
			{
				this.foodStockpiled = foodNeededToGrow;

				this.populationAdd(1);

				var granary = BaseImprovementDefn.Instances().Granary;
				var hasGranary = this.hasImprovement(granary);
				if (hasGranary)
				{
					this.foodStockpiled = this.foodNeededToGrow() / 2;
				}
				else
				{
					this.foodStockpiled = 0;
				}

				this.landUsage.offsetChooseOptimumFromAvailable
				(
					world, this
				);
			}
		}
	}

	// Improvements.

	hasImprovement(improvement)
	{
		return this.improvementsPresentNames.some(x => x == improvement.name);
	}

	improvementAdd(improvement)
	{
		this.improvementsPresentNames.push(improvement.name);
	}

	improvementsPresent()
	{
		return this.improvementsPresentNames.map(x => BaseImprovementDefn.byName(x));
	}

	// Resources.

	corruptionPerUnitDistanceFromCapital(world)
	{
		var owner = this.owner(world);
		return owner.government.corruptionPerUnitDistanceFromCapital;
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

	foodConsumedPerPopulation()
	{
		return 2;
	}

	foodConsumedPerSettler(world)
	{
		return this.owner(world).foodConsumedPerSettler();
	}

	foodNeededToGrow()
	{
		return this.population * this.foodNeededToGrowPerPopulation();
	}

	foodNeededToGrowPerPopulation()
	{
		return 16; // ?
	}

	foodThisTurnGross(world)
	{
		return this.resourcesProducedThisTurn(world).food;
	}

	foodThisTurnNet(world)
	{
		var gross = this.foodThisTurnGross(world);

		var consumedByPopulation =
			this.population * this.foodConsumedPerPopulation();

		var unitsSupported = this.unitsSupported(world);
		var settlersSupported = unitsSupported.filter
		(
			x => x.defnName == UnitDefn.Instances().Settlers.name
		);
		var settlerCount = settlersSupported.length;
		var consumedBySettlers =
			settlerCount * this.foodConsumedPerSettler(world);

		var consumed =
			consumedByPopulation + consumedBySettlers;

		var net = gross - consumed;

		return net;
	}

	industryThisTurnGross(world)
	{
		return this.resourcesProducedThisTurn(world).industry;
	}

	industryThisTurnNet(world)
	{
		var gross = this.industryThisTurnGross(world);
		var unitsSupportedCount = this.unitsSupportedCount();
		var costToSupportUnits = 0; // todo
		var upkeep = gross - costToSupportUnits;
		return upkeep;
	}

	industryThisTurnNet(world)
	{
		var gross = this.industryThisTurnGross(world);
		var owner = this.owner(world);
		var unitsSupportedCount = this.unitsSupported(world).length;
		var upkeep = owner.industryConsumedByUnitCount(unitsSupportedCount);
		var net = gross - upkeep;
		return net;
	}

	landUsageOptimize(world)
	{
		this.landUsage.optimize(world, this);
	}

	luxuriesThisTurn(world)
	{
		var tradeThisTurn = this.tradeThisTurnNet(world);
		var moneyThisTurn = this.moneyThisTurnGross(world);
		var researchThisTurn = this.researchThisTurn(world);
		var luxuriesThisTurn = tradeThisTurn - moneyThisTurn - researchThisTurn;
		return luxuriesThisTurn;
	}

	moneyThisTurnGross(world)
	{
		var tradeThisTurn = this.tradeThisTurnNet(world);
		var owner = this.owner(world);
		var taxRate = owner.taxRate();
		var moneyThisTurn = Math.round(taxRate * tradeThisTurn);
		return moneyThisTurn;
	}

	moneyThisTurnNet(world)
	{
		var gross = this.moneyThisTurnGross(world);
		var upkeep = this.improvementsUpkeepCost();
		var net = gross - upkeep;
		return net; // todo - What if this is negative?
	}

	moneyThisTurnNetIsNegative()
	{
		return (this.moneyThisTurnNet() < 0);
	}

	researchThisTurn(world)
	{
		var tradeThisTurn = this.tradeThisTurnNet(world);
		var moneyThisTurn = this.moneyThisTurnGross(world)
		var researchPlusLuxuriesThisTurn = tradeThisTurn - moneyThisTurn;
		var owner = this.owner(world);
		var researchPlusLuxuriesRate = 1 - owner.taxRate();
		var researchRate = owner.researchRate();
		var researchThisTurn = Math.round
		(
			researchPlusLuxuriesThisTurn
			* researchRate
			/ researchPlusLuxuriesRate
		);
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

	unitsPresent(world)
	{
		var mapCell = this.mapCellOccupied(world);
		var returnValues = mapCell.unitsPresent(world);
		return returnValues;
	}

	unitsPresentMilitary(world)
	{
		var unitsPresent = this.unitsPresent(world);
		var returnValues = unitsPresent.filter
		(
			x =>
			{
				var defn = x.defn(world);
				var isGroundMilitary =
					(defn.isMilitary() && defn.isGroundUnit());
				return isGroundMilitary
			}
		);
		return returnValues;
	}

	unitsSupported(world)
	{
		return this.unitsSupportedIds.map(x => world.unitById(x));
	}

	unitsSupportedCount()
	{
		return this.unitsSupportedIds.length;
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
			if (improvementDefn != null)
			{
				returnValue = improvementDefn;
			}
			else
			{
				var starshipPart = StarshipPart.byName(name);
				returnValue = starshipPart;
			}
		}

		return returnValue;
	}
}

class BaseImprovementDefn
{
	constructor(name, industryToBuild)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
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

	build(world, base)
	{
		base.improvementAdd(this);
	}

	unhappyPopluationMitigated(owner)
	{
		var returnValue = 0;
 
		var improvements = BaseImprovementDefn.Instances();
		var techs = Technology.Instances();

		if (this == improvements.Temple)
		{
			returnValue += 1;

			if (owner.technologyIsKnown(techs.Mysticism))
			{
				returnValue += 1;
			}
		}
		else if (this == improvements.Colosseum)
		{
			returnValue += 3;

			if (owner.technologyIsKnown(techs.Electronics))
			{
				returnValue += 1;
			}
		}
		else if (this == improvements.Cathedral)
		{
			returnValue += 3;

			if (owner.technologyIsKnown(techs.Theology))
			{
				returnValue += 1;
			}
			
			if (owner.technologyIsKnown(techs.Communism))
			{
				returnValue -= 1;
			}
		}

		return returnValue;
	}
}

class BaseImprovementDefn_Instances
{
	constructor()
	{
		var bid = (n, i) => new BaseImprovementDefn(n, i);

		this.Airport 				= bid("Airport", 				160);
		this.Aqueduct 				= bid("Aqueduct", 				80);
		this.Bank 					= bid("Bank", 					120);
		this.Barracks 				= bid("Barracks", 				40);
		this.Capitalization 		= bid("Capitalization", 		null);
		this.Cathedral 				= bid("Cathedral", 				120);
		this.CityWalls 				= bid("City Walls", 			80);
		this.CoastalFortress 		= bid("Coastal Fortress", 		80);
		this.Colosseum				= bid("Colosseum", 				100);
		this.Courthouse 			= bid("Courthouse", 			80);
		this.Factory 				= bid("Factory", 				200);
		this.Granary 				= bid("Granary", 				60);
		this.Harbor 				= bid("Harbor",					60);
		this.HydroPlant 			= bid("HydroPlant", 			240);
		this.Library 				= bid("Library", 				80);
		this.ManufacturingPlant 	= bid("Manufacturing Plant", 	320);
		this.Marketplace			= bid("Marketplace", 			80);
		this.MassTransit			= bid("Mass Transit", 			160);
		this.NuclearPlant			= bid("Nuclear Plant", 			160);
		this.OffshorePlatform 		= bid("Offshore Platform", 		160);
		this.Palace 				= bid("Palace", 				10);
		this.PoliceStation 			= bid("Police Station", 		60);
		this.PortFacility 			= bid("Port Facility", 			80);
		this.PowerPlant 			= bid("Power Plant", 			160);
		this.RecyclingCenter		= bid("Recycling Center", 		200);
		this.ResearchLab			= bid("Research Lab", 			160);
		this.SamMissileBattery 		= bid("SAM Missile Battery", 	100);
		this.SdiDefense 			= bid("SDI Defense", 			200);
		this.SewerSystem 			= bid("Sewer System", 			120);
		this.SolarPlant				= bid("Solar Plant", 			320);
		this.StockExchange 			= bid("Stock Exchange", 		160);
		this.Superhighways			= bid("Superhighways",			200);
		this.Supermarkets			= bid("Supermarkets",			80);
		this.Temple 				= bid("Temple", 				40);
		this.University 			= bid("University",				160);

		this.AdamSmithsTradingCo 	= bid("Adam Smith's Trading Co",400);
		this.ApolloProgram 			= bid("Apollo Program",			600);
		this.Colossus 				= bid("Colossus",				200);
		this.CopernicusObservatory 	= bid("Copernicus' Observatory",300);
		this.CureForCancer 			= bid("Cure for Cancer",		600);
		this.DarwinsVoyage 			= bid("Darwin's Voyage",		400);
		this.EiffelTower 			= bid("Eiffel Tower",			300);
		this.GreatLibrary 			= bid("Great Library",			300);
		this.GreatWall 				= bid("GreatWall",				300);
		this.HangingGardens 		= bid("HangingGardens",			200);
		this.HooverDam 				= bid("Hoover Dam",				600);
		this.IsaacNewtonsCollege 	= bid("Isaac Newton's College",	400);
		this.JsBachsCathedral		= bid("J.S. Bach's Cathedral",	400);
		this.KingRichardsCrusade 	= bid("King Richard's Crusade",	300);
		this.LeonardosWorkshop 		= bid("Leonardo's Workshop",	400);
		this.Lighthouse 			= bid("Lighthouse",				200);
		this.MagellansExpedition 	= bid("Magellan's Expedition",	400);
		this.ManhattanProject 		= bid("Manhattan Project",		600);
		this.MarcoPolosEmbassy 		= bid("Marco's Polo's Embassy", 200);
		this.MichelangelosChapel 	= bid("Michelangelo's Chapel", 	400);
		this.Oracle					= bid("Oracle",					300);
		this.Pyramids 				= bid("Pyramids",				200);
		this.SetiProgram 			= bid("SETI Program",			600);
		this.ShakespearesTheatre 	= bid("Shakespeare's Theatre",	300);
		this.StatueOfLiberty 		= bid("Statue of Liberty",		400);
		this.SunTzusWarAcademy 		= bid("Sun Tzu's War Academy", 	300);
		this.UnitedNations 			= bid("United Nations",			600);
		this.WomensSuffrage 		= bid("Women's Suffrage",		600);

		this._All =
		[
			// City improvements.

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
			this.SewerSystem,
			this.SolarPlant,
			this.StockExchange,
			this.Superhighways,
			this.Supermarkets,
			this.Temple,
			this.University,

			// Wonders.

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
			this.WomensSuffrage,
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

	buildableStart(buildableToBuild, world, owner, base)
	{
		var buildableName = buildableToBuild.name;

		if (buildableToBuild == null)
		{
			throw new Error("Unrecognized buildable name: " + buildableName);
		}
		else if (owner.canBuildBuildable(buildableToBuild) == false)
		{
			throw new Error("Cannot build buildable with name: " + buildableName);
		}
		else
		{
			this.buildableInProgressName = buildableName;
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

	canBuildBuildable(buildable, world)
	{
		var canBuild = this.owner(world).canBuildBuildable(buildable);
		// todo - Some bases can't build some things, for instance, boats.
		return canBuild;
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

		this._cellPos = Coords.create();
		this._offset = Coords.create();
		this._resourcesProducedThisTurn = ResourceProduction.create();
	}

	static default()
	{
		return new BaseLandUsage(null);
	}

	offsetChooseOptimumFromAvailable(world, base)
	{
		var map = world.map;

		var offsetValueMaxSoFar = 0;
		var offsetWithValueMaxSoFar = null;

		var offset = this._offset;
		var cellPos = this._cellPos;

		for (var y = -2; y <= 2; y++)
		{
			offset.y = y;

			for (var x = -2; x <= 2; x++)
			{
				offset.x = x;

				var offsetAbsoluteSumOfDimensions =
					offset.clone().absolute().sumOfDimensions();
				var offsetIsInRange =
				(
					offsetAbsoluteSumOfDimensions > 0
					&& offsetAbsoluteSumOfDimensions < 4
				);

				var offsetIsInUse =
					this.offsetsInUse.some(x => x.equals(offset));

				var offsetIsAvailable =
					offsetIsInRange && (offsetIsInUse == false);

				if (offsetIsAvailable)
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

	offsetRemoveWorst(world, base)
	{
		var map = world.map;

		var offset = this._offset;
		var cellPos = this._cellPos;

		var offsetWithValueMinSoFar = this.offsetsInUse[1]; // Can't remove offset 0.
		cellPos.overwriteWith(base.pos).add(offsetWithValueMinSoFar);
		var cellAtOffset = map.cellAtPosInCells(cellPos);
		var offsetValueMinSoFar = cellAtOffset.value(world, base);

		for (var i = 2; i < this.offsetsInUse.length; i++)
		{
			cellPos.overwriteWith(base.pos).add(offset);
			var cellAtOffset = map.cellAtPosInCells(cellPos);
			var offsetValue = cellAtOffset.value(world, base);

			if (offsetValue < offsetValueMinSoFar)
			{
				offsetValueMinSoFar = offsetValue;
				offsetWithValueMinSoFar = offset;
			}
		}

		this.offsetsInUse.splice
		(
			this.offsetsInUse.indexOf(offsetWithValueMinSoFar),
			1 // numberToRemove
		)
	}

	optimize(world, base)
	{
		// todo - This isn't very efficient.

		this.offsetsInUse.length = 0;

		var offset = this._offset.clear(); // The center is always in use.
		this.offsetsInUse.push(offset.clone());

		for (var p = 0; p < base.population; p++)
		{
			this.offsetChooseOptimumFromAvailable(world, base);
		}

		return this;
	}

	resourcesProducedThisTurn(world, base)
	{
		var resourcesProducedThisTurn =
			this._resourcesProducedThisTurn.clear();

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
			x => resourcesProducedThisTurn.add(x)
		);

		return resourcesProducedThisTurn;
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
