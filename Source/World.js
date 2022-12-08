
class World
{
	constructor(name, defns, turnsSoFar, map, owners)
	{
		this.name = name;
		this.defns = defns;
		this.turnsSoFar = turnsSoFar;
		this.map = map;
		this.owners = owners;

		this.bases = [];
		this.units = [];

		for (var i = 0; i < this.owners.length; i++)
		{
			var owner = this.owners[i];
			owner.bases.forEach(x => this.baseAdd(x));
			owner.units.forEach(x => this.unitAdd(x));
		}

		this.ownerCurrentIndex = 0;
	}

	static demo()
	{
		var terrains = MapOfCellsCellTerrain.Instances()._All;

		var unitDefns = UnitDefn.Instances()._All;

		var defns = new WorldDefns
		(
			terrains,
			unitDefns
		);

		var map = MapOfCells.fromCellsAsStrings
		([
			"~~~~~~~~~~~~~~~~",
			"~..............~",
			"~..............~",
			"~..............~",
			"~..............~",
			"~..............~",
			"~..............~",
			"~~~~~~~~~~~~~~~~"

			/*
			//       10        20        30        40        5         60
			//234567890123456789012345678901234567890123456789012345678901234
			"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~", // 10
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
			"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~", // 20
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~",
			"~~............................~~..............................~~", // 30
			"~~............................~~..............................~~",
			"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
			*/
		]);

		var owners = [];
		var ownerCount = 2;
		var ownerColorNames = [ "Blue", "Orange" ];
		var ownerStartingPositions =
		[
			map.sizeInCells.clone().multiply(new Coords(.25, .5)).round(),
			map.sizeInCells.clone().multiply(new Coords(.75, .5)).round()
		];

		for (var i = 0; i < ownerCount; i++)
		{
			var ownerName = "Owner" + i;
			var ownerColorName = ownerColorNames[i];

			var startingPos = ownerStartingPositions[i];
			var unitInitial = new Unit
			(
				ownerName,
				"Settlers",
				startingPos
			);

			var owner = new Owner
			(
				ownerName,
				ownerColorName,
				OwnerIncomeAllocation.default(), // incomeAllocation,
				OwnerResearch.default(),
				OwnerMapKnowledge.default(),
				[], // bases
				[
					unitInitial
				]
			);

			owners.push(owner);
		}

		var worldDemo = new World
		(
			"Demo World:",
			defns,
			0, // turnsSoFar
			map,
			owners
		);

		return worldDemo;
	}

	baseAdd(base)
	{
		base.initialize(this);
		this.bases.push(base);
		var cell = this.map.cellAtPosInCells(base.pos);
		cell.baseAdd(base);
	}

	baseById(id)
	{
		return this.bases.find(x => x.id == id);
	}

	baseRemove(base)
	{
		this.bases.splice(this.bases.indexOf(base), 1);
		var cell = this.map.cellAtPosInCells(base.pos);
		cell.baseRemove(base);
	}

	draw(universe)
	{
		var display = universe.display;
		var ownerCurrent = this.ownerCurrent();
		var ownerCurrentMapKnowledge = ownerCurrent.mapKnowledge;
		ownerCurrentMapKnowledge.draw(universe, this, ownerCurrent);
	}

	initialize(universe)
	{
		this.owners.forEach(x => x.initialize(this));

		this.draw(universe);
	}

	ownerByName(name)
	{
		return this.owners.find(x => x.name == name);
	}

	ownerCurrent()
	{
		return this.owners[this.ownerCurrentIndex];
	}

	ownerCurrentAdvance(universe)
	{
		var world = universe.world;

		var outputLog = universe.outputLog;
		var ownerCurrent = this.ownerCurrent();
		outputLog.writeLine("Player " + ownerCurrent.name + "'s turn ends.");

		this.ownerCurrentIndex++;
		if (this.ownerCurrentIndex >= this.owners.length)
		{
			this.ownerCurrentIndex = 0;

			outputLog.writeLine("Turn " + world.turnsSoFar + " ends.");
			this.turnAdvance();
		}

		ownerCurrent = this.ownerCurrent();
		ownerCurrent.unitSelectedClear().unitSelectNextIdle();

		return ownerCurrent;
	}

	turnAdvance()
	{
		this.owners.forEach(x => x.turnUpdate(this) );
		this.turnsSoFar++;
	}

	turnAdvanceMultiple(turnsToAdvance)
	{
		for (var i = 0; i < turnsToAdvance; i++)
		{
			this.turnAdvance();
		}
	}

	unitAdd(unit)
	{
		this.units.push(unit);

		var unitOwner = unit.owner(this);
		unitOwner.unitAdd(unit);

		var cell = this.map.cellAtPosInCells(unit.pos);
		cell.unitAdd(unit);

		unit.ownerMapKnowledgeUpdate(this);
	}

	unitById(id)
	{
		return this.units.find(x => x.id == id);
	}

	unitRemove(unit)
	{
		this.units.splice(this.units.indexOf(unit), 1);
		var cell = this.map.cellAtPosInCells(unit.pos);
		cell.unitRemove(unit);
	}
}

class WorldDefns
{
	constructor(terrains, unitDefns)
	{
		this.terrains = terrains;
		this.unitDefns = unitDefns;

		this._terrainsByCode = new Map(this.terrains.map(x => [x.code, x]));
		this._unitDefnsByName = new Map(this.unitDefns.map(x => [x.name, x]));
	}

	terrainByCode(code)
	{
		return this._terrainsByCode.get(code);
	}

	unitDefnByName(name)
	{
		return this._unitDefnsByName.get(name);
	}
}
