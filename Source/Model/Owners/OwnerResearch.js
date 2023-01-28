
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

	buildablesKnown()
	{
		var buildablesKnownNames = [];

		var technologiesKnown = this.technologiesKnown();
		technologiesKnown.forEach
		(
			x => buildablesKnownNames.push(...x.buildablesAllowedNames)
		);

		var buildablesKnown = buildablesKnownNames.map
		(
			x => BaseBuildable.byName(x)
		);

		return buildablesKnown;
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
