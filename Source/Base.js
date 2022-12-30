
class Base
{
	constructor
	(
		name,
		pos,
		ownerName,
		demographics,
		landUsage,
		foodStockpiled,
		industry,
		improvementsPresentNames
	)
	{
		this.id = IdHelper.idNext();

		this.name = name || ("City" + this.id);
		this.pos = pos;
		this.ownerName = ownerName;
		this.demographics = demographics || BaseDemographics.fromPopulation(1);
		this.landUsage = landUsage || BaseLandUsage.default();
		this.foodStockpiled = foodStockpiled || 0;
		this.industry = industry || BaseIndustry.default();

		this.improvementsPresentNames = improvementsPresentNames || [];
		this.unitsSupportedIds = [];
	}

	static fromNamePosAndOwnerName(name, pos, ownerName)
	{
		return new Base(name, pos, ownerName, null, null, null, null, null);
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
		this.laborOptimizeForWorld(world);
	}

	isBuildingSomething()
	{
		return (this.isIdle() == false);
	}

	isIdle()
	{
		return (this.industry.buildableInProgressName == null);
	}

	mapCellOccupied(world)
	{
		return world.map.cellAtPosInCells(this.pos);
	}

	mapCellsUsable(world)
	{
		return this.landUsage.cellsUsableForBaseAndMap(this, world.map);
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

		var demographics =
			"Demographics: "
			+ this.demographics.toStringDetails(world, this);

		var foodGross = this.foodThisTurnGross(world);
		var foodNet = this.foodThisTurnNet(world);
		var foodConsumed = foodGross - foodNet;

		var food =
			"Food: "
			+ foodGross + " produced, "
			+ foodConsumed + " consumed, "
			+ foodNet + " netted, " 
			+ this.foodStockpiled + " stored, "
			+ this.foodNeededToGrow() + " to grow";

		var industryGross = this.industryThisTurnGross(world);
		var industryLostToCorruption = 0; // todo 
		var industryConsumedByUnits = this.industryNeededToSupportUnits(world);

		var industryNet = this.industryThisTurnNet(world);
		var industry =
			"Industry: "
			+ industryGross + " produced, "
			+ industryLostToCorruption + " wasted, "
			+ industryConsumedByUnits + " to support " + this.unitsSupportedCount() + " units, "
			+ industryNet + " netted"
			+ "\n"
			+ this.industry.toString(world, this);

		var tradeGross = this.tradeThisTurnGross(world);
		var tradeNet = this.tradeThisTurnNet(world);
		var tradeLostToCorruption = tradeGross - tradeNet;

		var trade =
			"Trade: "
			+ tradeGross + " produced, "
			+ tradeLostToCorruption + " stolen, "
			+ tradeNet + " netted, "
			+ this.luxuriesThisTurnFromTrade(world) + " to luxuries, "
			+ this.researchThisTurn(world) + " to research, "
			+ this.moneyThisTurnGross(world) + " to taxes, "
			+ this.moneyThisTurnNet(world) + " after expenses";

		var improvements =
			"Improvements: "
			+ this.improvementsPresent().map
			(
				x => x.name + " (" + x.costPerTurn + ")"
			).join(", ");

		var landUsage =
			this.landUsage.toStringVisualForWorldAndBase(world, this);

		var lines =
		[
			"Name: " + this.id,
			"Onwer:" + this.ownerName,
			"Position: " + this.pos.toStringXY(),
			demographics,
			food,
			industry,
			trade,
			improvements,
			landUsage,
		];

		var linesJoined = lines.join("\n");

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
			if (this.population() <= 0)
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

	// Demographics.

	isExperiencingUnrest(world)
	{
		var discontentPopulationCount =
			this.populationDiscontent(world, this);

		var happyPopulationCount =
			this.populationHappy(world, this);

		var returnValue = (discontentPopulationCount > happyPopulationCount);

		return returnValue;
	}

	population()
	{
		return this.demographics.population;
	}

	populationAdd(populationChange)
	{
		this.demographics.populationAdd(populationChange);
	}

	populationCanGrow()
	{
		return this.demographics.populationCanGrow(this);
	}

	populationHappy(world)
	{
		return this.demographics.populationHappy(world, this);
	}

	populationDiscontent(world)
	{
		return this.demographics.populationDiscontent(world, this);
	}

	whileDiscontentReassignLaborersAsEntertainers(world)
	{
		// hack
		// It may not always be possible to restore order with just entertainers.
		while (this.isExperiencingUnrest(world))
		{
			this.laborerWorstReassignAsEntertainer(world);
		}
	}

	laborerWorstReassignAsEntertainer(world)
	{
		this.landUsage.offsetRemoveWorst(world, this);
		this.demographics.entertainerAdd();
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

	improvementsCostPerTurn()
	{
		var costPerTurnTotal = 0;
		var improvements = this.improvementsPresent();
		improvements.forEach(x => costPerTurnTotal += x.costPerTurn);
		return costPerTurnTotal;
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
		return this.population() * this.foodNeededToGrowPerPopulation();
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
			this.population() * this.foodConsumedPerPopulation();

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
		var industryWastedDueToCorruption = 0; // todo
		var costToSupportUnits = this.industryNeededToSupportUnits(world);
		var net = gross - costToSupportUnits;
		var isExperiencingUnrest = this.isExperiencingUnrest(world);
		if (net > 0 && isExperiencingUnrest )
		{
			net = 0;
		}
		return net;
	}

	industryNeededToSupportUnits(world)
	{
		var unitsSupportedCount = this.unitsSupportedCount();
		var owner = this.owner(world);
		var government = owner.government();
		var industryNeeded =
			government.industryConsumedByUnitsSupportedByBase(this);
		return industryNeeded;
	}

	laborOptimizeForWorld(world)
	{
		// todo - This isn't really optimum.
		this.demographics.specialistsReassignAllAsLaborers();
		this.landUsage.optimize(world, this);
	}

	luxuriesPerEntertainer()
	{
		return 2;
	}

	luxuriesThisTurn(world)
	{
		var luxuriesFromTrade =
			this.luxuriesThisTurnFromTrade(world);

		var luxuriesFromEntertainers =
			this.demographics.entertainerCount * this.luxuriesPerEntertainer();

		var luxuriesThisTurn =
			luxuriesFromTrade
			+ luxuriesFromEntertainers;

		return luxuriesThisTurn;
	}

	luxuriesThisTurnFromTrade(world)
	{
		var tradeThisTurn = this.tradeThisTurnNet(world);
		var moneyThisTurn = this.moneyThisTurnFromTrade(world);
		var researchThisTurn = this.researchThisTurnFromTrade(world);
		var luxuriesThisTurn = tradeThisTurn - moneyThisTurn - researchThisTurn;
		return luxuriesThisTurn;
	}

	moneyPerTaxCollector()
	{
		return 2;
	}

	moneyThisTurnFromTrade(world)
	{
		var tradeThisTurn = this.tradeThisTurnNet(world);
		var owner = this.owner(world);
		var taxRate = owner.taxRate();
		var moneyThisTurn = Math.round(taxRate * tradeThisTurn);
		return moneyThisTurn;
	}

	moneyThisTurnGross(world)
	{
		var moneyFromTrade = this.moneyThisTurnFromTrade(world);
		var moneyFromTaxCollectors =
			this.demographics.taxCollectorCount
			* this.moneyPerTaxCollector();
		var moneyTotal = moneyFromTrade + moneyFromTaxCollectors;
		return moneyTotal;
	}

	moneyThisTurnNet(world)
	{
		var gross = this.moneyThisTurnGross(world);
		var upkeep = this.improvementsCostPerTurn();
		var net = gross - upkeep;
		return net; // todo - What if this is negative?
	}

	moneyThisTurnNetIsNegative()
	{
		return (this.moneyThisTurnNet() < 0);
	}

	researchPerScientist()
	{
		return 2;
	}

	researchThisTurn(world)
	{
		var researchFromTrade = this.researchThisTurnFromTrade(world);

		var researchFromScientists =
			this.demographics.scientistCount
			* this.researchPerScientist();

		var researchTotal = researchFromTrade + researchFromScientists;

		return researchTotal;
	}

	researchThisTurnFromTrade(world)
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

	unitRemove(unit)
	{
		this.unitsSupportedIds.splice
		(
			this.unitsSupportedIds.indexOf(unit.id),
			1 // numberToRemove
		);
	}

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
					(defn.isMilitary() && defn.isGroundUnit(world) );
				return isGroundMilitary;
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

class BaseDemographics
{
	constructor
	(
		population,
		entertainerCount,
		scientistCount,
		taxCollectorCount
	)
	{
		this.population = population;
		this.entertainerCount = entertainerCount || 0;
		this.scientistCount = scientistCount || 0;
		this.taxCollectorCount = taxCollectorCount || 0;
	}

	static fromPopulation(population)
	{
		return new BaseDemographics(1, null, null, null);
	}

	toStringDetails(world, base)
	{
		var returnValue =
			"Population: " + this.population
			+ ", Happy: " + this.populationHappy(world, base)
			+ ", Content: " + this.populationContent(world, base)
			+ ", Discontent: " + this.populationDiscontent(world, base);

		if (this.hasSpecialists())
		{
			returnValue +=
				", Laborers:" + this.laborerCount()
				+ (this.entertainerCount == 0 ? "" : ", Entertainers: " + this.entertainerCount)
				+ (this.scientistCount == 0 ? "" : ", Scientists: " + this.scientistCount)
				+ (this.taxCollectorCount == 0 ? "" : ", Tax Collectors: " + this.taxCollectorCount);
		}

		return returnValue;
	}

	// Population.

	populationAdd(populationChange)
	{
		this.population += populationChange;
	}

	populationCanGrow(base)
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
			&& base.hasImprovement(improvements.Aqueduct)
		)
		{
			canGrow = true;
		}
		else if (base.hasImprovement(improvements.SewerSystem))
		{
			canGrow = true;
		}
		else
		{
			canGrow = false;
		}

		return canGrow;
	}

	populationContent(world, base)
	{
		var returnValue =
			this.population
			- this.populationHappy(world, base)
			- this.populationDiscontent(world, base);

		return returnValue;
	}

	populationDiscontent(world, base)
	{
		var difficultyLevel = world.difficultyLevel();
		var populationMaxBeforeDiscontent =
			difficultyLevel.basePopulationBeforeDiscontent;

		var unhappinessDueToOverpopulation =
			this.population - populationMaxBeforeDiscontent;
		if (unhappinessDueToOverpopulation < 0)
		{
			unhappinessDueToOverpopulation = 0;
		}

		var unhappinessDueToMilitaryDeployment = 0;
		var owner = base.owner(world);
		var governments = Government.Instances();
		var doesDeploymentCauseDiscontent =
		(
			owner.governmentIs(governments.Republic)
			|| owner.governmentIs(governments.Democracy)
		);

		if (doesDeploymentCauseDiscontent)
		{
			var unitsSupported = base.unitsSupported(world);
			var unitsMilitary = unitsSupported.filter(x => x.isMilitary(world))
			var unitsMilitaryDeployed =
				unitsMilitary.filter(x => x.isInBaseSupporting(world) == false);
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

				var hasPoliceStation = base.hasImprovementPoliceStation();
				if (hasPoliceStation)
				{
					unhappinessDueToMilitaryDeployment--;
				}

				if (unhappinessDueToMilitaryDeployment < 0)
				{
					unhappinessDueToMilitaryDeployment = 0;
				}
			}
		}

		var discontentPopulationCount =
			unhappinessDueToOverpopulation
			+ unhappinessDueToMilitaryDeployment;

		var improvementsPresent = base.improvementsPresent();

		if (discontentPopulationCount > 0)
		{
			var unhappinessMitigatedByImprovements = 0;
			improvementsPresent.forEach
			(
				x => unhappinessMitigatedByImprovements +=
					x.discontentPopulationMitigated(owner)
			);

			var owner = base.owner(world);
			var ownerGovernment = owner.government;
			var unitsPresentMilitary = base.unitsPresentMilitary(world);
			var unhappinessMitigatedByMartialLaw =
				unitsPresentMilitary.length;
			var martialLawMax =
				ownerGovernment.discontentPopulationMitigatedByMartialLaw;
			if (unhappinessMitigatedByMartialLaw > martialLawMax)
			{
				unhappinessMitigatedByMartialLaw = martialLawMax;
			}

			var unhappinessMitigatedTotal =
				unhappinessMitigatedByImprovements
				+ unhappinessMitigatedByMartialLaw;

			discontentPopulationCount -= unhappinessMitigatedTotal;
		}

		if (discontentPopulationCount < 0)
		{
			discontentPopulationCount = 0;
		}

		return discontentPopulationCount;
	}

	populationHappy(world, base)
	{
		var luxuriesThisTurn = base.luxuriesThisTurn(world);
		var happinessDueToLuxuries = Math.floor(luxuriesThisTurn / 2);
		var happyPopulationCount = happinessDueToLuxuries;
		return happyPopulationCount;
	}

	// Specialists.

	entertainerAdd()
	{
		this.entertainerCount++;
	}

	entertainerReassignAsScientist()
	{
		this.entertainerCount--;
		this.scientistCount++;
	}

	hasSpecialists()
	{
		var returnValue =
		(
			this.entertainerCount > 0
			|| this.scientistCount > 0
			|| this.taxCollectorCount > 0
		);
		return returnValue;
	}

	laborerCount()
	{
		return this.population - this.specialistCount();
	}

	scientistReassignAsTaxCollector()
	{
		this.scientistCount--;
		this.taxCollectorCount++;
	}

	specialistReassignAsLaborer()
	{
		if (this.entertainerCount > 0)
		{
			this.entertainerCount--;
		}
		else if (this.scientistCount > 0)
		{
			this.scientistCount--;
		}
		else if (this.taxCollectorCount > 0)
		{
			this.taxCollectorCount--;
		}
	}

	specialistCount()
	{
		var returnValue =
			this.entertainerCount
			+ this.scientistCount
			+ this.taxCollectorCount;

		return returnValue;
	}

	specialistsReassignAllAsLaborers()
	{
		this.entertainerCount = 0;
		this.scientistCount = 0;
		this.taxCollectorCount = 0;
	}

	taxCollectorReassignAsEntertainer()
	{
		this.taxCollectorCount--;
		this.entertainerCount++;
	}
}

class BaseImprovementDefn
{
	constructor(name, industryToBuild, costPerTurn)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
		this.costPerTurn = costPerTurn;
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

	discontentPopulationMitigated(owner)
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
		var bid = (n, i, c) => new BaseImprovementDefn(n, i, c);

		this.Airport 				= bid("Airport", 				160, 	3);
		this.Aqueduct 				= bid("Aqueduct", 				80, 	2);
		this.Bank 					= bid("Bank", 					120, 	3);
		this.Barracks 				= bid("Barracks", 				40, 	1);
		this.Capitalization 		= bid("Capitalization", 		null, 	null);
		this.Cathedral 				= bid("Cathedral", 				120, 	3);
		this.CityWalls 				= bid("City Walls", 			80, 	0);
		this.CoastalFortress 		= bid("Coastal Fortress", 		80, 	1);
		this.Colosseum				= bid("Colosseum", 				100, 	4);
		this.Courthouse 			= bid("Courthouse", 			80, 	1);
		this.Factory 				= bid("Factory", 				200, 	4);
		this.Granary 				= bid("Granary", 				60, 	1);
		this.Harbor 				= bid("Harbor",					60, 	1);
		this.HydroPlant 			= bid("Hydro Plant", 			240, 	4);
		this.Library 				= bid("Library", 				80, 	1);
		this.ManufacturingPlant 	= bid("Manufacturing Plant", 	320, 	6);
		this.Marketplace			= bid("Marketplace", 			80, 	1);
		this.MassTransit			= bid("Mass Transit", 			160, 	4);
		this.NuclearPlant			= bid("Nuclear Plant", 			160, 	2);
		this.OffshorePlatform 		= bid("Offshore Platform", 		160, 	3);
		this.Palace 				= bid("Palace", 				10, 	0);
		this.PoliceStation 			= bid("Police Station", 		60, 	2);
		this.PortFacility 			= bid("Port Facility", 			80, 	3);
		this.PowerPlant 			= bid("Power Plant", 			160, 	4);
		this.RecyclingCenter		= bid("Recycling Center", 		200, 	2);
		this.ResearchLab			= bid("Research Lab", 			160, 	3);
		this.SamMissileBattery 		= bid("SAM Missile Battery", 	100, 	2);
		this.SdiDefense 			= bid("SDI Defense", 			200, 	4);
		this.SewerSystem 			= bid("Sewer System", 			120, 	2);
		this.SolarPlant				= bid("Solar Plant", 			320, 	4);
		this.StockExchange 			= bid("Stock Exchange", 		160, 	4);
		this.Superhighways			= bid("Superhighways",			200, 	5);
		this.Supermarkets			= bid("Supermarkets",			80, 	3);
		this.Temple 				= bid("Temple", 				40, 	1);
		this.University 			= bid("University",				160, 	3);

		this.AdamSmithsTradingCo 	= bid("Adam Smith's Trading Co",400, 	0);
		this.ApolloProgram 			= bid("Apollo Program",			600, 	0);
		this.Colossus 				= bid("Colossus",				200, 	0);
		this.CopernicusObservatory 	= bid("Copernicus' Observatory",300, 	0);
		this.CureForCancer 			= bid("Cure for Cancer",		600, 	0);
		this.DarwinsVoyage 			= bid("Darwin's Voyage",		400, 	0);
		this.EiffelTower 			= bid("Eiffel Tower",			300, 	0);
		this.GreatLibrary 			= bid("Great Library",			300, 	0);
		this.GreatWall 				= bid("GreatWall",				300, 	0);
		this.HangingGardens 		= bid("HangingGardens",			200, 	0);
		this.HooverDam 				= bid("Hoover Dam",				600, 	0);
		this.IsaacNewtonsCollege 	= bid("Isaac Newton's College",	400, 	0);
		this.JsBachsCathedral		= bid("J.S. Bach's Cathedral",	400, 	0);
		this.KingRichardsCrusade 	= bid("King Richard's Crusade",	300, 	0);
		this.LeonardosWorkshop 		= bid("Leonardo's Workshop",	400, 	0);
		this.Lighthouse 			= bid("Lighthouse",				200, 	0);
		this.MagellansExpedition 	= bid("Magellan's Expedition",	400, 	0);
		this.ManhattanProject 		= bid("Manhattan Project",		600, 	0);
		this.MarcoPolosEmbassy 		= bid("Marco's Polo's Embassy", 200, 	0);
		this.MichelangelosChapel 	= bid("Michelangelo's Chapel", 	400, 	0);
		this.Oracle					= bid("Oracle",					300, 	0);
		this.Pyramids 				= bid("Pyramids",				200, 	0);
		this.SetiProgram 			= bid("SETI Program",			600, 	0);
		this.ShakespearesTheatre 	= bid("Shakespeare's Theatre",	300, 	0);
		this.StatueOfLiberty 		= bid("Statue of Liberty",		400, 	0);
		this.SunTzusWarAcademy 		= bid("Sun Tzu's War Academy", 	300, 	0);
		this.UnitedNations 			= bid("United Nations",			600, 	0);
		this.WomensSuffrage 		= bid("Women's Suffrage",		600, 	0);

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

	buildableInProgressClear()
	{
		this.buildableInProgressName = null;
		this.industryStockpiled = 0;
	}

	canBuildBuildable(buildable, world)
	{
		var canBuild = this.owner(world).canBuildBuildable(buildable);
		// todo - Some bases can't build some things, for instance, boats.
		return canBuild;
	}

	toString(world, base)
	{
		var buildableInProgress = this.buildableInProgress(world, base);

		var buildableDetails = "";
		if (buildableInProgress == null)
		{
			buildableDetails = "[nothing]";
		}
		else
		{
			buildableDetails =
				buildableInProgress.name
				+ " "
				+ this.industryStockpiled
				+ "/"
				+ buildableInProgress.industryToBuild;
		}

		var returnValue =
			"Building: " + buildableDetails;

		return returnValue;
	}

	turnUpdate(world, base)
	{
		var buildableInProgress = this.buildableInProgress(world, base);
		if (buildableInProgress != null)
		{
			var industryThisTurnNet = base.industryThisTurnNet(world);
			this.industryStockpiled += industryThisTurnNet;

			if (this.industryStockpiled < 0)
			{
				var unitsSupported = base.unitsSupported(world);
				var unitToBeDisbanded = unitsSupported[unitsSupported.length - 1];
				world.unitRemove(unitToBeDisbanded);
				var message =
					"Base '" + base.name
					+ "' could not support unit '" + unitToBeDisbanded.defnName
					+ "', disbanding.";
				owner.notifyByMessageForWorld(message, world);
				this.buildableInProgressClear();
			}
			else
			{
				var industryRequired = buildableInProgress.industryToBuild;
				if (this.industryStockpiled >= industryRequired)
				{
					buildableInProgress.build(world, base);
					this.buildableInProgressClear();
				}
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

	cellsInUseForBaseAndMap(base, map)
	{
		var cellPos = this._cellPos;
		var basePos = base.pos;
		var mapSizeInCells = map.sizeInCells
		var cellsInUse = this.offsetsInUse.map
		(
			offset => map.cellAtPosInCells
			(
				cellPos.overwriteWith
				(
					basePos
				).add
				(
					offset
				).wrapXTrimYToMax
				(
					mapSizeInCells
				)
			)
		);
		return cellsInUse;
	}

	cellsUsableForBaseAndMap(base, map)
	{
		var cellPos = this._cellPos;
		var basePos = base.pos;
		var offsetsUsable = this.offsetsUsableForMap(map);
		var cellsUsable = offsetsUsable.map
		(
			x => map.cellAtPosInCells
			(
				cellPos.overwriteWith(basePos).add(x)
			)
		);
		return cellsUsable;
	}

	buildImprovementsInAllCellsMagicallyForBaseAndWorld(base, world)
	{
		// This is a cheat, used only for testing.

		var cellsUsable = this.cellsUsableForBaseAndMap(base, world.map);
		var improvements = MapOfCellsCellImprovement.Instances();
		var terrains = MapOfCellsCellTerrain.Instances(); 
		cellsUsable.forEach(cell =>
		{
			if (cell.hasIrrigation() == false)
			{
				cell.improvementAdd(improvements.Irrigation);
			}
			if (cell.hasRoads() == false)
			{
				cell.improvementAdd(improvements.Roads);
			}

			var cellTerrain = cell.terrain(world);
			if
			(
				cellTerrain == terrains.Hills
				|| cellTerrain == terrains.Mountains
			)
			{
				if (cell.hasMines() == false)
				{
					cell.improvementAdd(improvements.Mines);
				}
			}
		});
	}

	isValid()
	{
		var isValidSoFar = true;

		for (var i = 0; i < this.offsetsInUse.length; i++)
		{
			var offsetI = this.offsetsInUse[i];

			for (var j = i + 1; j < this.offsetsInUse.length; j++)
			{
				var offsetJ = this.offsetsInUse[j];

				var areOffsetsEqual = offsetI.equals(offsetJ);
				if (areOffsetsEqual)
				{
					isValidSoFar = false;
					i = this.offsetsInUse.length;
					break;
				}
			}
		}

		return isValidSoFar;
	}

	offsetChooseOptimumFromAvailable(world, base)
	{
		var map = world.map;
		var mapSizeInCells = map.sizeInCells;

		var offsetValueMaxSoFar = 0;
		var offsetWithValueMaxSoFar = null;

		var offset = this._offset;
		var cellPos = this._cellPos;

		var offsetDimensionMax = this.offsetDimensionMax();

		for (var y = -offsetDimensionMax; y <= offsetDimensionMax; y++)
		{
			offset.y = y;

			for (var x = -offsetDimensionMax; x <= offsetDimensionMax; x++)
			{
				offset.x = x;

				var offsetAbsoluteSumOfDimensions =
					offset.clone().absolute().sumOfDimensions();
				var offsetIsInRange =
				(
					offsetAbsoluteSumOfDimensions > 0
					&& offsetAbsoluteSumOfDimensions < offsetDimensionMax * 2
				);

				var offsetIsInUse =
					this.offsetsInUse.some(x => x.equals(offset));

				var offsetIsAvailable =
					offsetIsInRange && (offsetIsInUse == false);

				if (offsetIsAvailable)
				{
					cellPos.overwriteWith(base.pos).add(offset);

					if (cellPos.isYInRangeMaxExclusive(mapSizeInCells))
					{
						cellPos.wrapXTrimYToMax(mapSizeInCells);
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
		}

		this.offsetInUseAdd(offsetWithValueMaxSoFar);
	}

	offsetDimensionMax()
	{
		return 2;
	}

	offsetInUseAdd(offset)
	{
		this.offsetsInUse.push(offset);
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

	offsetsUsableForMap(map)
	{
		var offsetsUsable = [];

		var offset = Coords.create();

		var distanceMax = this.offsetDimensionMax();

		for (var y = -distanceMax; y <= distanceMax; y++)
		{
			offset.y = y;

			for (var x = -distanceMax; x <= distanceMax; x++)
			{
				offset.x = x;

				var offsetAbsoluteSumOfDimensions =
					offset.clone().absolute().sumOfDimensions();
				var offsetIsInRange =
				(
					offsetAbsoluteSumOfDimensions > 0
					&& offsetAbsoluteSumOfDimensions < distanceMax + distanceMax
				);

				if (offsetIsInRange)
				{
					offsetsUsable.push(offset.clone());
				}
			}
		}

		return offsetsUsable;
	}

	optimize(world, base)
	{
		// todo - This isn't very efficient.

		this.offsetsInUse.length = 0;

		var offset = this._offset.clear(); // The center is always in use.
		this.offsetInUseAdd(offset.clone());

		for (var p = 0; p < base.population(); p++)
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
		var map = world.map;
		var cellsInUse = this.cellsInUseForBaseAndMap(base, map);
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

	toStringVisualForWorldAndBase(world, base)
	{
		// For debugging.

		var map = world.map;

		var territoryAsLines = [];

		var offset = Coords.create();

		var distanceMax = this.offsetDimensionMax();
		var territoryDiameterInCells = distanceMax * 2 + 1;
		var cellSizeInChars = Coords.fromXY(14, 6);
		var territorySizeInChars = cellSizeInChars.clone().multiplyScalar
		(
			territoryDiameterInCells
		);
		var cellPosInCellsFromUpperLeft = Coords.create();
		var cellPosInChars = Coords.create();
		var cellPosInCells = Coords.create();

		for (var y = -distanceMax; y <= distanceMax; y++)
		{
			offset.y = y;
			cellPosInCellsFromUpperLeft.y = offset.y + distanceMax;

			for (var x = -distanceMax; x <= distanceMax; x++)
			{
				offset.x = x;
				cellPosInCellsFromUpperLeft.x = offset.x + distanceMax;

				this.toStringVisualForWorldAndBase_Cell
				(
					world,
					base,
					offset,
					distanceMax,
					cellPosInChars,
					cellPosInCellsFromUpperLeft,
					cellSizeInChars,
					cellPosInCells,
					territoryAsLines
				);
			}
		}

		var territoryAsString = territoryAsLines.join("\n");

		return territoryAsString;
	}
	
	toStringVisualForWorldAndBase_Cell
	(
		world,
		base,
		offset,
		distanceMax,
		cellPosInChars,
		cellPosInCellsFromUpperLeft,
		cellSizeInChars,
		cellPosInCells,
		territoryAsLines
	)
	{
		var offsetAbsoluteSumOfDimensions =
			offset.clone().absolute().sumOfDimensions();
		var offsetIsInRange =
		(
			offsetAbsoluteSumOfDimensions < distanceMax * 2
		);

		cellPosInChars.overwriteWith
		(
			cellPosInCellsFromUpperLeft
		).multiply
		(
			cellSizeInChars
		);

		var cellAsLines = [];

		if
		(
			offsetIsInRange == false
			&& Math.abs(offset.x) == distanceMax
		)
		{
			cellAsLines.push(
				"".padEnd(cellSizeInChars.x, " ")
			);

			for (var i = 0; i < cellSizeInChars.y - 1; i++)
			{
				cellAsLines.push
				(
					"".padEnd(cellSizeInChars.x, " ")
				);
			}
		}
		else
		{
			var horizontalBorder =
				"+".padEnd(cellSizeInChars.x, "-") + "+";
			cellAsLines.push(horizontalBorder);

			cellPosInCells.overwriteWith(offset).add(base.pos);
			var cell = world.map.cellAtPosInCells(cellPosInCells);
			var cellTerrainCode = cell.terrainCode;
			var cellTerrain = cell.terrain(world);
			var cellTerrainName = cellTerrain.name;
			var cellTerrainAsString =
				cellTerrainName
				+ " (" + cellTerrainCode + ")"

			cellAsLines.push
			(
				"|" + cellTerrainAsString.padEnd(cellSizeInChars.x - 1, " ") + "|"
			);

			var riverIndicator = (cell.hasRiver() ? "River" : "");
			var resourceSpecialPresent = cell.resourceSpecialPresent();
			var resourceSpecialPresentName =
			(
				resourceSpecialPresent == null
				? ""
				: resourceSpecialPresent.name
			);
			var cellTerrainFeaturesAsString =
				resourceSpecialPresentName
				+ " " + riverIndicator;

			cellAsLines.push
			(
				"|" + cellTerrainFeaturesAsString.padEnd(cellSizeInChars.x - 1, " ") + "|"
			);

			var cellImprovements =
				(cell.hasRailroads() ? "RRs " : (cell.hasRoads() ? "Rds " : ""))
				+ (cell.hasFarmland() ? "Frm " : (cell.hasIrrigation() ? "Irr " : ""));
				+ (cell.hasFortress() ? "Frt" : "");
			cellAsLines.push
			(
				"|" + cellImprovements.padEnd(cellSizeInChars.x - 1, " ") + "|"
			);

			var cellResourcesProduced = cell.resourcesProduced(world, base);
			var food = cellResourcesProduced.food;
			var industry = cellResourcesProduced.industry;
			var trade = cellResourcesProduced.trade;
			var resourcesProduced =
				(food > 0 ? "f" + food + " " : "")
				+ (industry > 0 ? "i" + industry + " " : "")
				+ (trade > 0 ? "t" + trade + " " : "");

			cellAsLines.push
			(
				"|" + resourcesProduced.padEnd(cellSizeInChars.x - 1, " ") + "|"
			);

			var cellIsInUse = this.offsetsInUse.some(x => x.equals(offset));
			var isInUseFlag = (cellIsInUse ? "In Use" : "");
			cellAsLines.push
			(
				"|" + isInUseFlag.padEnd(cellSizeInChars.x - 1, " ") + "|"
			);

			cellAsLines.push
			(
				"|".padEnd(cellSizeInChars.x, " ") + "|"
			);

		}

		StringHelper.copyStringsIntoStringsAtPos
		(
			cellAsLines, territoryAsLines, cellPosInChars
		);
	}

	turnUpdate(world, base)
	{
		// todo
	}
}
