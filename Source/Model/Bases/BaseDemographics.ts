
class BaseDemographics
{
	population: number;
	entertainerCount: number;
	scientistCount: number;
	taxCollectorCount: number;

	constructor
	(
		population: number,
		entertainerCount: number,
		scientistCount: number,
		taxCollectorCount: number
	)
	{
		this.population = population;
		this.entertainerCount = entertainerCount || 0;
		this.scientistCount = scientistCount || 0;
		this.taxCollectorCount = taxCollectorCount || 0;
	}

	static fromPopulation(population: number): BaseDemographics
	{
		return new BaseDemographics(1, null, null, null);
	}

	isValidForBase(base: Base): boolean
	{
		var laborerCount = this.laborerCount();
		var specialistCount = this.specialistCount();
		var workerCount = laborerCount + specialistCount;
		var isValid = (workerCount == this.population);
		return isValid;
	}

	validateForBase(base: Base): void
	{
		if (this.isValidForBase(base) == false)
		{
			throw new Error("Invalid work assignment for base: " + base.name);
		}
	}

	toStringDetails(world: World, base: Base): string
	{
		var returnValue = "";

		if (this.attitudeIsUnrest(world, base))
		{
			returnValue += "UNREST! ";
		}

		returnValue +=
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

	attitudeIsEuphoria(world: World, base: Base): boolean
	{
		var discontentPopulationCount =
			this.populationDiscontent(world, base);

		var happyPopulationCount =
			this.populationHappy(world, base);

		var contentPopulationCount =
			this.population
			- happyPopulationCount
			- discontentPopulationCount;

		var returnValue =
		(
			this.population >= 3
			&& discontentPopulationCount == 0
			&& happyPopulationCount >= contentPopulationCount
		);

		return returnValue;
	}

	attitudeIsUnrest(world: World, base: Base): boolean
	{
		var discontentPopulationCount =
			this.populationDiscontent(world, base);

		var happyPopulationCount =
			this.populationHappy(world, base);

		var returnValue = (discontentPopulationCount > happyPopulationCount);

		return returnValue;
	}

	populationAdd(populationChange: number): void
	{
		this.population += populationChange;
	}

	populationCanGrow(base: Base): boolean
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

	populationContent(world: World, base: Base): number
	{
		var returnValue =
			this.population
			- this.populationHappy(world, base)
			- this.populationDiscontent(world, base);

		return returnValue;
	}

	populationDiscontent(world: World, base: Base): number
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
			var ownerGovernment = owner.government();
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

	populationHappy(world: World, base: Base): number
	{
		var luxuriesThisTurn = base.luxuriesThisTurn(world);
		var happinessDueToLuxuries = Math.floor(luxuriesThisTurn / 2);
		var happyPopulationCount = happinessDueToLuxuries;
		return happyPopulationCount;
	}

	// Specialists.

	entertainerAddForBase(base: Base): void
	{
		this.entertainerCount++;
		this.validateForBase(base);
	}

	entertainerReassignAsLaborer(): void
	{
		this.entertainerCount--;
	}

	entertainerReassignAsScientist(): void
	{
		this.entertainerCount--;
		this.scientistCount++;
	}

	hasSpecialists(): boolean
	{
		var returnValue =
		(
			this.entertainerCount > 0
			|| this.scientistCount > 0
			|| this.taxCollectorCount > 0
		);
		return returnValue;
	}

	laborerCount(): number
	{
		return this.population - this.specialistCount();
	}

	scientistReassignAsTaxCollector():  void
	{
		this.scientistCount--;
		this.taxCollectorCount++;
	}

	specialistRemove(): void
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

	specialistCount(): number
	{
		var returnValue =
			this.entertainerCount
			+ this.scientistCount
			+ this.taxCollectorCount;

		return returnValue;
	}

	specialistsReassignAllAsLaborers(): void
	{
		this.entertainerCount = 0;
		this.scientistCount = 0;
		this.taxCollectorCount = 0;
	}

	taxCollectorReassignAsEntertainer(): void
	{
		this.taxCollectorCount--;
		this.entertainerCount++;
	}
}

