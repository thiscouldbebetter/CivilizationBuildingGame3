
class OwnerResearch
{
	technologiesKnownNames: string[];
	technologyBeingResearchedName: string;
	researchStockpiled: number;

	constructor
	(
		technologiesKnownNames: string[],
		technologyBeingResearchedName: string,
		researchStockpiled: number
	)
	{
		this.technologiesKnownNames =
			technologiesKnownNames || [ Technology.Instances()._Basic.name ];
		this.technologyBeingResearchedName = technologyBeingResearchedName;
		this.researchStockpiled = researchStockpiled || 0;
	}

	static default(): OwnerResearch
	{
		return new OwnerResearch(null, null, null);
	}

	buildablesKnown(): any[]
	{
		var buildablesKnownNames = new Array<string>();

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

	canBuildBuildable(buildable: any): boolean
	{
		var buildableName = buildable.name;
		var technologiesKnown = this.technologiesKnown();
		var canBuild = technologiesKnown.some
		(
			x => x.buildablesAllowedNames.indexOf(buildableName) >= 0
		);
		return canBuild;
	}

	governmentsKnown(): Government[]
	{
		var governmentsKnown = new Array<Government>();
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

	technologiesKnown(): Technology[]
	{
		var technologiesKnown =
			this.technologiesKnownNames.map(x => Technology.byName(x));
		return technologiesKnown;
	}

	technologiesResearchable(): Technology[]
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

	technologyBeingResearched(): Technology
	{
		return Technology.byName(this.technologyBeingResearchedName);
	}

	technologyBeingResearchedClear(): void
	{
		this.technologyBeingResearchedName = null;
	}

	technologyResearch(technology: Technology): void
	{
		this.technologyBeingResearchedName = technology.name;
		this.researchStockpiled = 0;
	}

	turnUpdate(world: World, owner: Owner): void
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
