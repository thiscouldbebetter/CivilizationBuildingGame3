
class Owner
{
	constructor
	(
		name,
		colorName,
		intelligence,
		finances,
		research,
		mapKnowledge,
		diplomacy,
		notificationLog,
		bases,
		units
	)
	{
		this.name = name;
		this.colorName = colorName;
		this.intelligence = intelligence;
		this.finances = finances;
		this.research = research;
		this.mapKnowledge = mapKnowledge;
		this.diplomacy = diplomacy;
		this.notificationLog = notificationLog;
		this.bases = bases;
		this.units = units;

		this.governmentName = Government.Instances().Despotism.name; // todo
		this.governmentAnarchyTurnsRemaining = null;
		this.selection = new OwnerSelection();
		this.starshipStatus = OwnerStarshipStatus.create();

		this.camera = Camera.default();
	}

	areAnyBasesOrUnitsIdle(world)
	{
		var areAnyBasesIdle = this.bases.some(x => x.isIdle() );
		var areAnyUnitsIdle = this.units.some(x => x.isIdle() );
		var returnValue = (areAnyBasesIdle || areAnyUnitsIdle);
		return returnValue;
	}

	cellsControlledWithPollutionCount(world)
	{
		var countSoFar = 0;

		this.bases.forEach
		(
			base =>
			{
				var cellsControlled = base.mapCellsUsable(world);
				cellsControlled.forEach
				(
					cell =>
					{
						countSoFar += (cell.hasPollution ? 1 : 0);
					}
				);
			}
		);

		return countSoFar;
	}

	hasWon(world)
	{
		var hasConqueredWorld =
		(
			world.owners.length == 1
			&& world.owners[0] == this
		);

		var hasReachedNeighboringStarsystem =
			this.starshipStatus.hasReachedDestination(world);

		var hasWon =
		(
			hasConqueredWorld
			|| hasReachedNeighboringStarsystem
		);

		return hasWon;
	}

	initialize(world)
	{
		this.bases.forEach(x => x.initialize(world) );
		this.units.forEach(x => x.initialize(world) );

		this.unitSelectNextIdle();
	}

	isWaitingForActionSelection()
	{
		var unitSelected = this.unitSelected();
		var isWaiting = unitSelected.isWaitingForActionSelection();
		return isWaiting;
	}

	notifyByMessageForWorld(message, world)
	{
		this.notificationLog.notifyByMessageForWorld(message, world);
	}

	score()
	{
		var populationHappySoFar = 0;
		var populationContentSoFar = 0;
		this.bases.forEach
		(
			x =>
			{
				populationHappySoFar += x.populationHappy();
				populationContentSoFar += x.populationContent();
			}
		)
		var wonderCount = this.wondersControlled().length;
		var cellsControlledWithPollutionCount =
			this.cellsControlledWithPollutionCount();

		var pointsPerPopulationHappy = 2;
		var pointsPerPopulationContent = 1;
		var pointsPerWonder = 20;
		var pointsLostPerCellWithPollution = 10;

		var pointsForPopulationHappy =
			populationHappySoFar * pointsPerPopulationHappy;
		var pointsForPopulationContent =
			populationContentSoFar * pointsPerPopulationContent;
		var pointsForWonders = wonderCount * pointsPerWonder;
		var pointsLostToPollution =
			cellsControlledWithPollutionCount * pointsLostPerCellWithPollution;

		var pointsForCivilizedBehavior = 0; // todo

		var scoreTotal =
			pointsForPopulationHappy
			+ pointsForPopulationContent
			+ pointsForWonders
			- pointsLostToPollution;

		return scoreTotal;
	}

	turnUpdate(world)
	{
		var isAnarchy = this.governmentIsAnarchy();
		if (isAnarchy)
		{
			this.governmentAnarchyTurnsRemaining--;
			if (this.governmentAnarchyTurnsRemaining <= 0)
			{
				// todo - Prompt for a new government.
			}
		}
		else
		{
			var areAnyBasesExperiencingUnrest = false; // todo

			if (areAnyBasesExperiencingUnrest)
			{
				var isUnrestSufficientForRevolution = false; // todo
				if (isUnrestSufficientForRevolution)
				{
					this.governmentOverthrow();
				}
			}
		}

		this.bases.forEach(x => x.turnUpdate(world) );
		this.units.forEach(x => x.turnUpdate(world) );

		this.research.turnUpdate(world, this);

		this.unitSelectNextIdle();
	}

	wondersControlled()
	{
		var wondersSoFar = [];
		this.bases.forEach
		(
			x => wondersSoFar.push(...x.wondersPresent() )
		);
	}

	// Bases.

	baseAdd(base)
	{
		this.bases.push(base);
	}

	baseCapital()
	{
		return this.bases[0]; // todo
	}

	baseRemove(base)
	{
		this.bases.splice(this.bases.indexOf(base), 1);
	}

	// Diplomacy.

	ownerIsAttackable(ownerOther)
	{
		return this.diplomacy.ownerIsAttackable(ownerOther);
	}

	relationshipWithOwner(ownerOther)
	{
		return this.diplomacy.relationshipWithOwner(this);
	}

	// Finances.

	luxuriesRate()
	{
		return this.finances.incomeAllocation.luxuriesFraction;
	}

	moneyStockpiled()
	{
		return this.finances.moneyStockpiled();
	}

	moneyStockpiledAdd(moneyToAdd, world)
	{
		this.finances.moneyStockpiledAdd(moneyToAdd, world, this);
	}

	moneyStockpiledSubtract(moneyToSubtract, world)
	{
		this.finances.moneyStockpiledSubtract(moneyToSubtract, world, this);
	}

	researchRate()
	{
		return this.finances.incomeAllocation.researchFraction;
	}

	taxRate()
	{
		return this.finances.incomeAllocation.moneyFraction;
	}

	// Government.

	corruptionPerUnitDistanceFromCapital()
	{
		return this.government().corruptionPerUnitDistanceFromCapital;
	}

	foodConsumedPerSettler()
	{
		return this.government().foodConsumedPerSettler;
	}

	government()
	{
		return Government.byName(this.governmentName);
	}

	governmentChoiceNeedsInput()
	{
		var returnValue =
		(
			this.governmentIsAnarchy()
			&& this.governmentAnarchyTurnsRemaining <= 0
		);

		return returnValue;
	}

	governmentOverthrow()
	{
		this.governmentName = Government.Instances().Anarchy.name;
		var turnsOfAnarchyMin = 1;
		var turnsOfAnarchyMax = 3;
		var turnsOfAnarchyRange = turnsOfAnarchyMax - turnsOfAnarchyMin;
		this.governmentAnarchyTurnsRemaining =
			turnsOfAnarchyMin
			+ Math.floor(Math.random() * turnsOfAnarchyRange);
	}

	governmentIs(governmentToCheck)
	{
		return (this.governmentName == governmentToCheck.name);
	}

	governmentIsAnarchy()
	{
		return this.governmentIs(Government.Instances().Anarchy);
	}

	governmentIsAnarchyOrDespotism()
	{
		return (this.governmentIsAnarchy() || this.governmentIsDespotism() );
	}

	governmentIsDespotism()
	{
		return this.governmentIs(Government.Instances().Despotism);
	}

	governmentSet(governmentToSet)
	{
		var governmentsKnown = this.governmentsKnown();
		if (governmentsKnown.indexOf(governmentToSet) < 0)
		{
			throw new Error("Attempted to use unknown government!");
		}
		else if (this.governmentAnarchyTurnsRemaining > 0)
		{
			throw new Error("Cannot set government during anarchy!");
		}
		else
		{
			this.governmentName = governmentToSet.name;
		}
	}

	governmentsKnown()
	{
		return this.research.governmentsKnown();
	}

	// Research.

	buildablesKnown()
	{
		return this.research.buildablesKnown();
	}

	canBuildBuildable(buildable)
	{
		return this.research.canBuildBuildable(buildable, this);
	}

	researchThisTurn(world)
	{
		var researchSoFar = 0;
		this.bases.forEach
		(
			x => researchSoFar += x.researchThisTurn(world)
		);
		return researchSoFar;
	}

	technologiesKnown()
	{
		return this.research.technologiesKnown();
	}

	technologiesResearchable()
	{
		return this.research.technologiesResearchable();
	}

	technologyBeingResearched()
	{
		return this.research.technologyBeingResearched();
	}

	technologyCanBeResearched(technology)
	{
		return (this.technologiesResearchable().indexOf(technology) >= 0);
	}

	technologyIsKnown(technology)
	{
		return (this.technologiesKnown().indexOf(technology) >= 0);
	}

	technologyResearch(technology)
	{
		this.research.technologyResearch(technology);
	}

	// Selection.

	baseSelectNextIdle()
	{
		return this.selection.baseSelectNextIdle(this);
	}

	baseSelected()
	{
		return this.selection.baseSelected(this);
	}

	selectableSelected()
	{
		return this.selection.selectableSelected(this);
	}

	unitSelect(unitToSelect)
	{
		return this.selection.unitSelect(this, unitToSelect);
	}

	unitSelectById(idToSelect)
	{
		return this.selection.unitSelectById(this, idSelect);
	}

	unitSelectNextIdle()
	{
		return this.selection.unitSelectNextIdle(this);
	}

	unitSelected()
	{
		return this.selection.unitSelected(this);
	}

	unitSelectedClear()
	{
		this.selection.clear();
		return this;
	}

	unitSelectedNeedsInput()
	{
		var unitSelected = this.unitSelected();
		var unitSelectedActivity = unitSelected.activity();
		var activityDefn = unitSelectedActivity.defn();
		var returnValue = (activityDefn == ActivityDefn.Instances().NeedsInput);
		return returnValue;
	}

	// Starship.

	starshipPartAdd(part)
	{
		this.starshipStatus.partAdd(part);
	}

	// Units.

	unitAdd(unit)
	{
		if (this.units.indexOf(unit) == -1)
		{
			this.units.push(unit);
		}
	}

	unitRemove(unit)
	{
		this.units.splice(this.units.indexOf(unit), 1);
	}
}