
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

	buildablesKnownNames()
	{
		return this.research.buildablesKnownNames();
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

class OwnerFinances
{
	constructor(moneyStockpiled, incomeAllocation)
	{
		this._moneyStockpiled = moneyStockpiled;
		this.incomeAllocation = incomeAllocation;
	}
	
	static default()
	{
		return new OwnerFinances(0, OwnerIncomeAllocation.default());
	}

	moneyStockpiled()
	{
		return this._moneyStockpiled;
	}

	moneyStockpiledAdd(moneyToAdd, world, owner)
	{
		this._moneyStockpiled += moneyToAdd;

		var bases = owner.bases;
		var salePricePerIndustryToBuild = 1; // todo

		while (this._moneyStockpiled < 0)
		{
			// Negative money is not allowed.  Have to sell some things.
			var areThereAnyImprovementsLeftToSell =
				bases.some(x => x.improvementsPresent().length > 0);

			if (areThereAnyImprovementsLeftToSell == false)
			{
				this._moneyStockpiled = 0;
				break;
			}
			else
			{
				var baseMoneyThisTurnNetMinSoFar = bases[0].moneyThisTurnNet(world);
				var baseWithBiggestDeficitSoFar = bases[0];

				for (var i = 1; i < bases.length; i++)
				{
					var base = bases[i];
					var baseMoneyThisTurnNet = base.moneyThisTurnNet(world);
					if (baseMoneyThisTurnNet < baseMoneyThisTurnNetMinSoFar)
					{
						baseMoneyThisTurnNetMinSoFar = baseMoneyThisTurnNet;
						baseWithBiggestDeficitSoFar = base;
					}
				}

				var improvements = baseWithBiggestDeficitSoFar.improvementsPresent();
				var improvementToSell = improvements[improvements.length - 1];
				var improvementSalePrice =
					improvementToSell.industryToBuild * salePricePerIndustryToBuild;
				this._moneyStockpiled += improvementSalePrice;
			}
		}
	}

	moneyStockpiledSubtract(moneyToSubtract)
	{
		if (this._moneyStockpiled < moneyToSubtract)
		{
			throw new Error("Cannot subtract more money than stockpiled.");
		}
		this._moneyStockpiled -= moneyToSubtract;
	}

}

class OwnerIncomeAllocation
{
	constructor(moneyFraction, researchFraction, luxuriesFraction)
	{
		this.moneyFraction = moneyFraction;
		this.researchFraction = researchFraction;
		this.luxuriesFraction = luxuriesFraction;
	}

	static default()
	{
		return new OwnerIncomeAllocation(.5, .5, 0);
	}

	isValid()
	{
		var sumOfFractions =
			this.moneyFraction
			+ this.researchFraction
			+ this.luxuriesFraction;

		return (sumOfFractions == 1);
	}
}

class OwnerIntelligence
{
	constructor(name, commandChoose)
	{
		this.name = name;
		this._commandChoose = commandChoose;
	}

	static human()
	{
		return new OwnerIntelligence("Human", () => {});
	}

	static machine()
	{
		return new OwnerIntelligence("Machine", () => {});
	}

	commandChoose()
	{
		this._commandChoose();
	}
}

class OwnerResearch
{
	constructor
	(
		technologiesKnownNames,
		technologyBeingResearchedName,
		researchStockpiled
	)
	{
		this.technologiesKnownNames =
			technologiesKnownNames || [ Technology.Instances()._Basic.name ];
		this.technologyBeingResearchedName = technologyBeingResearchedName;
		this.researchStockpiled = researchStockpiled || 0;
	}

	static default()
	{
		return new OwnerResearch(null, null, null);
	}

	buildablesKnownNames()
	{
		var buildablesKnownNames = [];

		var technologiesKnown = this.technologiesKnown();
		technologiesKnown.forEach
		(
			x => buildablesKnownNames.push(...x.buildablesAllowedNames)
		);

		return buildablesKnownNames;
	}

	canBuildBuildable(buildable)
	{
		var buildableName = buildable.name;
		var technologiesKnown = this.technologiesKnown();
		var canBuild = technologiesKnown.some
		(
			x => x.buildablesAllowedNames.indexOf(buildableName) >= 0
		);
		return canBuild;
	}

	governmentsKnown()
	{
		var governmentsKnown = [];
		var techsKnown = this.technologiesKnown();
		techsKnown.forEach
		(
			x =>
			{
				if (x.governmentAllowedName != null)
				{
					var government = Government.byName(x.governmentAllowedName);
					governmentsKnown.push(government);
				}
			}
		);
		return governmentsKnown;
	}

	technologiesKnown()
	{
		var technologiesKnown =
			this.technologiesKnownNames.map(x => Technology.byName(x));
		return technologiesKnown;
	}

	technologiesResearchable()
	{
		var techsAll = Technology.Instances()._All;
		var techsKnown = this.technologiesKnown();
		var techsResearchable = techsAll.filter
		(
			x =>
				techsKnown.indexOf(x) == -1
				&& x.prerequisitesAreSatisfiedByTechnologies(techsKnown)
		);
		return techsResearchable;
	}

	technologyBeingResearched()
	{
		return Technology.byName(this.technologyBeingResearchedName);
	}

	technologyBeingResearchedClear()
	{
		this.technologyBeingResearchedName = null;
	}

	technologyResearch(technology)
	{
		this.technologyBeingResearchedName = technology.name;
		this.researchStockpiled = 0;
	}

	turnUpdate(world, owner)
	{
		var technologyBeingResearched =
			this.technologyBeingResearched();

		if (technologyBeingResearched != null)
		{
			var researchThisTurn = owner.researchThisTurn(world);
			this.researchStockpiled += researchThisTurn;
			if (this.researchStockpiled >= technologyBeingResearched.researchToLearn)
			{
				this.technologiesKnownNames.push
				(
					technologyBeingResearched.name
				);
				this.researchStockpiled = 0;
				this.technologyBeingResearchedClear();
			}
		}
	}
}

class OwnerSelection
{
	constructor()
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;

		this.selectableSelectedCategoryIndex =
			SelectableCategory.Instances().Units.index;
	}

	baseSelectNextIdle(owner)
	{
		var bases = owner.bases;

		var areThereAnyBasesIdle =
			bases.some(x => x.isIdle());

		if (areThereAnyBasesIdle == false)
		{
			this.baseSelectedIndex = null;
		}
		else
		{
			if (this.baseSelectedIndex == null)
			{
				this.baseSelectedIndex = -1;
			}

			while (true)
			{
				this.baseSelectedIndex++;
				if (this.baseSelectedIndex >= bases.length)
				{
					this.baseSelectedIndex = 0;
				}

				var baseSelected = this.baseSelected(owner);
				if (baseSelected.isIdle())
				{
					break;
				}
			}
		}
	}

	baseSelected(owner)
	{
		var bases = owner.bases;

		var base =
		(
			this.baseSelectedIndex == null
			? null
			: bases[this.baseSelectedIndex]
		);

		return base;
	}

	selectableSelectNextIdle(owner)
	{
		var returnValue = null;

		var categories = SelectableCategory.Instances();

		if (this.selectableSelectedCategoryIndex == categories.Bases.index)
		{
			returnValue = this.baseSelectNextIdle(owner);
		}
		else if (this.selectableSelectedCategoryIndex == categories.Units.index)
		{
			returnValue = this.unitSelectNextIdle(owner);
		}

		return returnValue;
	}

	selectableSelected(owner)
	{
		var returnValue = null;

		var categories = SelectableCategory.Instances();

		if (this.selectableSelectedCategoryIndex == categories.Bases.index)
		{
			returnValue = this.baseSelected(owner);
		}
		else if (this.selectableSelectedCategoryIndex == categories.Units.index)
		{
			returnValue = this.unitSelected(owner);
		}

		return returnValue;
	}

	clear()
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;

		return this;
	}

	unitSelect(owner, unitToSelect)
	{
		this.unitSelectById(owner, unitToSelect.id);
	}

	unitSelectById(owner, idToSelect)
	{
		var units = owner.units;
		var unitToSelect = units.find(x => x.id == idToSelect);
		if (unitToSelect == null)
		{
			throw new Error("No unit found with ID: " + idToSelect);
		}
		else
		{
			var unitToSelectIndex = units.indexOf(unitToSelect);
			this.unitSelectedIndex = unitToSelectIndex;
		}
	}

	unitSelectNextIdle(owner)
	{
		var units = owner.units;

		var areThereAnyUnitsIdle =
			units.some(x => x.isIdle());

		if (areThereAnyUnitsIdle == false)
		{
			this.unitSelectedIndex = null;
		}
		else
		{
			if (this.unitSelectedIndex == null)
			{
				this.unitSelectedIndex = -1;
			}

			while (true)
			{
				this.unitSelectedIndex++;
				if (this.unitSelectedIndex >= units.length)
				{
					this.unitSelectedIndex = 0;
				}

				var unitSelected = this.unitSelected(owner);
				if (unitSelected.hasMovesThisTurn())
				{
					break;
				}
			}
		}
	}

	unitSelected(owner)
	{
		var units = owner.units;

		var unit =
		(
			this.unitSelectedIndex == null
			? null
			: units[this.unitSelectedIndex]
		);

		return unit;
	}

}
