
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
		this.foodStockpiledSet(foodStockpiled || 0);
		this.industry = industry || BaseIndustry.default();

		this.improvementsPresentNames = improvementsPresentNames || [];
		this.unitsSupportedIds = [];
	}

	static fromNamePosAndOwnerName(name, pos, ownerName)
	{
		return new Base(name, pos, ownerName, null, null, null, null, null);
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
			+ this.foodStockpiled() + " stored, "
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
		var moneyGross = this.moneyThisTurnGross(world);
		var moneyNet = this.moneyThisTurnNet(world);
		var moneyExpenses = moneyGross - moneyNet;

		var trade =
			"Trade: "
			+ tradeGross + " produced, "
			+ tradeLostToCorruption + " stolen, "
			+ tradeNet + " netted, "
			+ this.luxuriesThisTurnFromTrade(world) + " to luxuries, "
			+ this.researchThisTurn(world) + " to research, "
			+ moneyGross + " in taxes, "
			+ moneyExpenses + " in expenses, "
			+ moneyNet + " after expenses.";

		var improvementsPresent = this.improvementsPresent();

		var improvements =
			"Improvements: "
			+
			(
				improvementsPresent.length == 0
				? "[none]"
				:
				(
					improvementsPresent.map
					(
						x => x.name + " (" + x.costPerTurn + ")"
					).join(", ")
				)
			);

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
		this.foodStockpiledAdd(foodThisTurnNet);
		this.populationGrowOrShrink(world);

		var moneyThisTurnNet = this.moneyThisTurnNet(world);
		var owner = this.owner(world);
		owner.moneyStockpiledAdd(moneyThisTurnNet, world);
	}

	// Demographics.

	attitudeIsEuphoria(world)
	{
		return this.demographics.attitudeIsEuphoria(world, this);
	}

	attitudeIsUnrest(world)
	{
		return this.demographics.attitudeIsUnrest(world, this);
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

	populationGrowOrConstrain(world)
	{
		var foodNeededToGrow = this.foodNeededToGrow();
		this.foodStockpiledSet(foodNeededToGrow);

		if (this.populationCanGrow())
		{
			this.populationAdd(1);

			if (this.attitudeIsUnrest(world))
			{
				this.demographics.entertainerAddForBase(this);
			}
			else
			{
				this.landUsage.offsetChooseOptimumFromAvailable
				(
					world, this
				);
			}
		}

		var granary = BaseImprovementDefn.Instances().Granary;
		var hasGranary = this.hasImprovement(granary);
		if (hasGranary)
		{
			var foodNeededToGrowAgain = this.foodNeededToGrow();
			this.foodStockpiledSet(foodNeededToGrowAgain / 2);
		}
		else
		{
			this.foodStockpiledSet(0);
		}
	}

	populationGrowOrShrink(world)
	{
		var foodNeededToGrow = this.foodNeededToGrow();
		var foodStockpiled = this.foodStockpiled();
		if (foodStockpiled < 0)
		{
			this.populationShrink(world);
		}
		else if (foodStockpiled >= foodNeededToGrow)
		{
			this.populationGrowOrConstrain(world);
		}
	}

	populationHappy(world)
	{
		return this.demographics.populationHappy(world, this);
	}

	populationDiscontent(world)
	{
		return this.demographics.populationDiscontent(world, this);
	}

	populationShrink(world)
	{
		this.populationAdd(-1);

		if (this.population() <= 0)
		{
			world.baseRemove(this);
		}
		else
		{
			if (this.demographics.entertainerCount > 0)
			{
				this.demographics.entertainerReassignAsLaborer();
			}
			else
			{
				this.landUsage.offsetRemoveWorst(world, this);
			}
		}
	}

	laborerWorstReassignAsEntertainerForWorld(world)
	{
		this.landUsage.offsetRemoveWorst(world, this);
		this.demographics.entertainerAddForBase(this);
	}

	specialistReassignAsLaborer(world)
	{
		this.demographics.specialistRemove();
		this.landUsage.offsetChooseOptimumFromAvailable(world, this);
	}

	whileDiscontentReassignLaborersAsEntertainers(world)
	{
		// hack
		// It may not always be possible to restore order with just entertainers.
		while (this.attitudeIsUnrest(world))
		{
			this.laborerWorstReassignAsEntertainerForWorld(world);
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

	improvementsPresentWonders()
	{
		return this.improvementsPresent().filter(x => x.isWonder);
	}

	// Industry.

	buildableInProgress(world)
	{
		return this.industry.buildableInProgress(world, this);
	}

	buildableInProgressBuild(world)
	{
		this.industry.buildableInProgressBuild(world, this);
	}

	buildableStart(buildableToBuild, world)
	{
		var owner = this.owner(world);
		this.industry.buildableStart
		(
			buildableToBuild, world, owner, this
		);
	}

	buildablesAvailable(world)
	{
		var owner = this.owner(world);
		var buildablesKnown = owner.buildablesKnown(world);
		var baseImprovementsPresent = this.improvementsPresent(world);
		var buildablesAvailable = buildablesKnown.filter
		(
			buildable =>
			{
				var typeName = buildable.constructor.name;
				var isAvailable =
				(
					typeName == UnitDefn.name
					||
					(
						typeName == BaseImprovementDefn.name
						&&
						(
							(
								baseImprovementsPresent.some
								(
									i => i.name == buildable.name
								) == false
							)
							&&
							(
								buildable.isWonder == false
								|| world.wonderHasBeenBuilt(buildable)
							)
						)
					)
				);
				return isAvailable
			}
		);
		return buildablesAvailable;
	}

	isIdle()
	{
		return (this.industry.buildableInProgressName == null);
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

	foodStockpiled()
	{
		return this._foodStockpiled;
	}

	foodStockpiledAdd(foodToAdd)
	{
		this.foodStockpiledSet(this.foodStockpiled() + foodToAdd);
	}

	foodStockpiledSet(value)
	{
		this._foodStockpiled = value;
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
		var attitudeIsUnrest = this.attitudeIsUnrest(world);
		if (net > 0 && attitudeIsUnrest )
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
		this.whileDiscontentReassignLaborersAsEntertainers(world);
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

	resourcesProducedThisTurn(world)
	{
		return this.landUsage.resourcesProducedThisTurn(world, this);
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

	unitSupportedLast(world)
	{
		var unitsSupported = this.unitsSupported(world);
		var unit = unitsSupported[unitsSupported.length - 1];
		return unit;
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
			unit =>
			{
				var defn = unit.defn(world);
				var isGroundMilitary =
					(defn.isMilitary() && defn.isGround(world, unit) );
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


