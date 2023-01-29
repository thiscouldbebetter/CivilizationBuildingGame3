
class Owner
{
	name: string;
	colorName: string;
	intelligence: OwnerIntelligence;
	finances: OwnerFinances;
	research: OwnerResearch;
	mapKnowledge: OwnerMapKnowledge;
	diplomacy: OwnerDiplomacy;
	notificationLog: NotificationLog;
	bases: Base[];
	units: Unit[];

	governmentName: string;
	governmentAnarchyTurnsRemaining: number;
	selection: OwnerSelection;
	starshipStatus: OwnerStarshipStatus;
	camera: Camera;

	constructor
	(
		name: string,
		colorName: string,
		intelligence: OwnerIntelligence,
		finances: OwnerFinances,
		research: OwnerResearch,
		mapKnowledge: OwnerMapKnowledge,
		diplomacy: OwnerDiplomacy,
		notificationLog: NotificationLog,
		bases: Base[],
		units: Unit[]
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

	areAnyBasesOrUnitsIdle(world: World): boolean
	{
		var areAnyBasesIdle = this.bases.some(x => x.isIdle() );
		var areAnyUnitsIdle = this.units.some(x => x.isIdle() );
		var returnValue = (areAnyBasesIdle || areAnyUnitsIdle);
		return returnValue;
	}

	cellsControlledWithPollutionCount(world: World): number
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

	hasWon(world: World): boolean
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

	initialize(world: World): void
	{
		this.bases.forEach(x => x.initialize(world) );
		this.units.forEach(x => x.initialize(world) );

		this.unitSelectNextIdle();
	}

	isWaitingForActionSelection(): boolean
	{
		var unitSelected = this.unitSelected();
		var isWaiting = unitSelected.isWaitingForActionSelection();
		return isWaiting;
	}

	notifyByMessageForWorld(message: string, world: World): void
	{
		this.notificationLog.notifyByMessageForWorld(message, world);
	}

	score(world: World): number
	{
		var populationHappySoFar = 0;
		var populationContentSoFar = 0;
		this.bases.forEach
		(
			x =>
			{
				populationHappySoFar += x.populationHappy(world);
				populationContentSoFar += x.populationContent(world);
			}
		)
		var wonderCount = this.wondersControlled().length;
		var cellsControlledWithPollutionCount =
			this.cellsControlledWithPollutionCount(world);

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
			+ pointsForCivilizedBehavior
			- pointsLostToPollution;

		return scoreTotal;
	}

	turnUpdate(world: World): void
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

	wondersControlled(): BaseImprovementDefn[]
	{
		var wondersSoFar = new Array<BaseImprovementDefn>();
		this.bases.forEach
		(
			x => wondersSoFar.push(...x.improvementsPresentWonders() )
		);
		return wondersSoFar;
	}

	// Bases.

	baseAdd(base: Base): void
	{
		this.bases.push(base);
	}

	baseCapital(): Base
	{
		return this.bases[0]; // todo
	}

	baseRemove(base: Base): void
	{
		this.bases.splice(this.bases.indexOf(base), 1);
	}

	// Diplomacy.

	ownerIsAttackable(ownerOther: Owner): boolean
	{
		return this.diplomacy.ownerIsAttackable(ownerOther);
	}

	relationshipWithOwner(ownerOther: Owner): OwnerDiplomacyRelationship
	{
		return this.diplomacy.relationshipWithOwner(this);
	}

	// Finances.

	luxuriesRate(): number
	{
		return this.finances.incomeAllocation.luxuriesFraction;
	}

	moneyStockpiled(): number
	{
		return this.finances.moneyStockpiled();
	}

	moneyStockpiledAdd(moneyToAdd: number, world: World): void
	{
		this.finances.moneyStockpiledAdd(moneyToAdd, world, this);
	}

	moneyStockpiledSubtract(moneyToSubtract: number, world: World): void
	{
		this.finances.moneyStockpiledSubtract(moneyToSubtract);
	}

	researchRate(): number
	{
		return this.finances.incomeAllocation.researchFraction;
	}

	taxRate(): number
	{
		return this.finances.incomeAllocation.moneyFraction;
	}

	// Government.

	corruptionPerUnitDistanceFromCapital(): number
	{
		return this.government().corruptionPerUnitDistanceFromCapital;
	}

	foodConsumedPerSettler(): number
	{
		return this.government().foodConsumedPerSettler;
	}

	government(): Government
	{
		return Government.byName(this.governmentName);
	}

	governmentChoiceNeedsInput(): boolean
	{
		var returnValue =
		(
			this.governmentIsAnarchy()
			&& this.governmentAnarchyTurnsRemaining <= 0
		);

		return returnValue;
	}

	governmentOverthrow(): void
	{
		this.governmentName = Government.Instances().Anarchy.name;
		var turnsOfAnarchyMin = 1;
		var turnsOfAnarchyMax = 3;
		var turnsOfAnarchyRange = turnsOfAnarchyMax - turnsOfAnarchyMin;
		this.governmentAnarchyTurnsRemaining =
			turnsOfAnarchyMin
			+ Math.floor(Math.random() * turnsOfAnarchyRange);
	}

	governmentIs(governmentToCheck: Government): boolean
	{
		return (this.governmentName == governmentToCheck.name);
	}

	governmentIsAnarchy(): boolean
	{
		return this.governmentIs(Government.Instances().Anarchy);
	}

	governmentIsAnarchyOrDespotism(): boolean
	{
		return (this.governmentIsAnarchy() || this.governmentIsDespotism() );
	}

	governmentIsDespotism(): boolean
	{
		return this.governmentIs(Government.Instances().Despotism);
	}

	governmentSet(governmentToSet: Government): void
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

	governmentsKnown(): Government[]
	{
		return this.research.governmentsKnown();
	}

	// Research.

	buildablesKnown(): any[]
	{
		return this.research.buildablesKnown();
	}

	canBuildBuildable(buildable: any): boolean
	{
		return this.research.canBuildBuildable(buildable);
	}

	researchThisTurn(world: World): number
	{
		var researchSoFar = 0;
		this.bases.forEach
		(
			x => researchSoFar += x.researchThisTurn(world)
		);
		return researchSoFar;
	}

	technologiesKnown(): Technology[]
	{
		return this.research.technologiesKnown();
	}

	technologiesResearchable(): Technology[]
	{
		return this.research.technologiesResearchable();
	}

	technologyBeingResearched(): Technology
	{
		return this.research.technologyBeingResearched();
	}

	technologyCanBeResearched(technology: Technology): boolean
	{
		return (this.technologiesResearchable().indexOf(technology) >= 0);
	}

	technologyIsKnown(technology: Technology): boolean
	{
		return (this.technologiesKnown().indexOf(technology) >= 0);
	}

	technologyResearch(technology: Technology): void
	{
		this.research.technologyResearch(technology);
	}

	// Selection.

	baseSelectNextIdle(): void
	{
		return this.selection.baseSelectNextIdle(this);
	}

	baseSelected(): Base
	{
		return this.selection.baseSelected(this);
	}

	selectableSelected(): any
	{
		return this.selection.selectableSelected(this);
	}

	unitSelect(unitToSelect: Unit): void
	{
		return this.selection.unitSelect(this, unitToSelect);
	}

	unitSelectById(idToSelect: number): void
	{
		return this.selection.unitSelectById(this, idToSelect);
	}

	unitSelectNextIdle(): void
	{
		return this.selection.unitSelectNextIdle(this);
	}

	unitSelected(): Unit
	{
		return this.selection.unitSelected(this);
	}

	unitSelectedClear(): Owner
	{
		this.selection.clear();
		return this;
	}

	unitSelectedNeedsInput(): boolean
	{
		var unitSelected = this.unitSelected();
		var unitSelectedActivity = unitSelected.activity();
		var activityDefn = unitSelectedActivity.defn();
		var returnValue =
			(activityDefn == UnitActivityDefn.Instances().NeedsInput);
		return returnValue;
	}

	// Starship.

	starshipPartAdd(part: StarshipPart): void
	{
		this.starshipStatus.partAdd(part);
	}

	// Units.

	unitAdd(unit: Unit): void
	{
		if (this.units.indexOf(unit) == -1)
		{
			this.units.push(unit);
		}
	}

	unitRemove(unit: Unit): void
	{
		this.units.splice(this.units.indexOf(unit), 1);
	}
}