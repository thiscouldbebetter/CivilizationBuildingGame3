
class OwnerStarshipStatus
{
	fuelTanks: number;
	habitats: number;
	lifeSupports: number;
	powerplants: number;
	structurals: number;
	thrusters: number;
	turnLaunched: number;

	constructor()
	{
		this.fuelTanks = 0;
		this.habitats = 0;
		this.lifeSupports = 0;
		this.powerplants = 0;
		this.structurals = 0;
		this.thrusters = 0;

		this.turnLaunched = null;
	}

	static create(): OwnerStarshipStatus
	{
		return new OwnerStarshipStatus();
	}

	static distanceToDestinationInLightSeconds(): number
	{
		// The actual distance to Alpha Centauri.
		return 4.2465 * 365 * 24 * 60 * 60;
	}

	static speedInLightSecondsPerTurnPerThruster(): number
	{
		return 3000000; // todo - Adjust this to something sensible.
	}

	canLaunch(): boolean
	{
		var returnValue;

		var hasAlreadyLaunched = this.hasLaunched();
		if (hasAlreadyLaunched)
		{
			returnValue = false;
		}
		else if (this.hasPartsNeededToLaunch() == false)
		{
			returnValue = false;
		}
		else
		{
			returnValue = true;
		}

		return returnValue;
	}

	hasLaunched(): boolean
	{
		return (this.turnLaunched != null);
	}

	hasPartsNeededToLaunch(): boolean
	{
		var nonStructuralComponentCount =
			this.fuelTanks
			+ this.habitats
			+ this.lifeSupports
			+ this.powerplants
			+ this.thrusters;

		var hasPartsNeeded =
		(
			this.fuelTanks >= 1
			&& this.habitats >= 1
			&& this.lifeSupports >= 1
			&& this.powerplants >= 1
			&& this.thrusters >= 1
			&& this.structurals >= nonStructuralComponentCount
		);

		return hasPartsNeeded;
	}

	hasReachedDestination(world: World): boolean
	{
		var turnsNeeded = this.turnsToReachDestinationTotal();
		var turnsSinceLaunch = this.turnsSinceLaunch(world);
		var turnsRemaining = (turnsNeeded - turnsSinceLaunch);
		var hasReachedDestination = (turnsRemaining <= 0);
		return hasReachedDestination;
	}

	launch(world: World): void
	{
		if (this.canLaunch())
		{
			this.turnLaunched = world.turnsSoFar;
		}
	}

	lossChancePerTurnOfFlight(): void
	{
		return 0; // todo
	}

	partAdd(part: StarshipPart): void
	{
		if (this.hasLaunched() == false)
		{
			var parts = StarshipPart.Instances();
			if (part == parts.FuelTank)
			{
				this.fuelTanks++;
			}
			else if (part == parts.Habitat)
			{
				this.habitats++;
			}
			else if (part == parts.LifeSupport)
			{
				this.lifeSupports++;
			}
			else if (part == parts.Powerplant)
			{
				this.powerplants++;
			}
			else if (part == parts.Structural)
			{
				this.structurals++;
			}
			else if (part == parts.Thruster)
			{
				this.thrusters++;
			}
			else
			{
				throw new Error("Unrecognized starship part: " + part.name);
			}
		}
	}

	speedInLightSecondsPerTurn(): number
	{
		var fuelTankCount = this.fuelTanks;
		var thrusterCount = this.thrusters;

		var speedPerThrusterMax =
			OwnerStarshipStatus.speedInLightSecondsPerTurnPerThruster();
		var speedPerThrusterAdjusted =
			speedPerThrusterMax * fuelTankCount / thrusterCount;
		var speed = this.thrusters * speedPerThrusterAdjusted;
		return speed;
	}

	turnsSinceLaunch(world: World): number
	{
		return world.turnsSoFar - this.turnLaunched;
	}

	turnsToReachDestinationTotal(): number
	{
		var speedInLightSecondsPerTurn = this.speedInLightSecondsPerTurn();
		var turnsToReachDestinationTotal = Math.ceil
		(
			OwnerStarshipStatus.distanceToDestinationInLightSeconds()
			/ speedInLightSecondsPerTurn
		);
		return turnsToReachDestinationTotal;
	}

	// Clonable.

	clone(): Starship
	{
		return OwnerStarshipStatus.create().overwriteWith(this);
	}

	equals(other: Starship): boolean
	{
		var areEqual =
		(
			this.fuelTanks == other.fuelTanks
			&& this.habitats == other.habitats
			&& this.lifeSupports == other.lifeSupports
			&& this.powerplants == other.powerplants
			&& this.structurals == other.structurals
			&& this.thrusters == other.thrusters
			&& this.turnLaunched == other.turnLaunched
		);

		return areEqual;
	}

	overwriteWith(other: Starship): Starship
	{
		this.fuelTanks = other.fuelTanks;
		this.habitats = other.habitats;
		this.lifeSupports = other.lifeSupports;
		this.powerplants = other.powerplants;
		this.structurals = other.structurals;
		this.thrusters = other.thrusters;
		this.turnLaunched = other.turnLaunched;
		return this;
	}
}

class StarshipPart
{
	name: string;
	industryToBuild: number;

	constructor
	(
		name: string,
		industryToBuild: number
	)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
	}

	static _instances: StarshipPart_Instances;
	static Instances(): StarshipPart_Instances
	{
		if (StarshipPart._instances == null)
		{
			StarshipPart._instances = new StarshipPart_Instances();
		}
		return StarshipPart._instances;
	}

	static byName(name: string): StarshipPart
	{
		return StarshipPart.Instances().byName(name);
	}

	build(world: World, base: Base): void
	{
		var owner = base.owner(world);
		owner.starshipPartAdd(this);
	}
}

class StarshipPart_Instances
{
	FuelTank: StarshipPart;
	Habitat: StarshipPart;
	LifeSupport: StarshipPart;
	Powerplant: StarshipPart;
	Structural: StarshipPart;
	Thruster: StarshipPart;

	_All: StarshipPart[];
	_AllByName: Map<string, StarshipPart>;

	constructor()
	{
		var ssps = (name, industryToBuild) => new StarshipPart(name, industryToBuild);

		this.FuelTank	= ssps("Starship Fuel Tank",	160);
		this.Habitat 	= ssps("Starship Habitat", 		320);
		this.LifeSupport= ssps("Starship Life Support", 320);
		this.Powerplant	= ssps("Starship Powerplant",	320);
		this.Structural	= ssps("Starship Structural", 	80);
		this.Thruster	= ssps("Starship Thruster", 	160);

		this._All =
		[
			this.FuelTank,
			this.Habitat,
			this.LifeSupport,
			this.Powerplant,
			this.Structural,
			this.Thruster
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name: string): StarshipPart
	{
		return this._AllByName.get(name);
	}
}

