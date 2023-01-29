
class World
{
	name: string;
	defns: WorldDefns;
	difficultyLevelName: string;
	turnsSoFar: number;
	map: MapOfCells;
	owners: Owner[];

	bases: Base[];
	units: Unit[];
	ownerCurrentIndex: number;
	wondersBuilt: BaseImprovementDefn[];

	constructor
	(
		name: string,
		defns: WorldDefns,
		difficultyLevelName: string,
		turnsSoFar: number,
		map: MapOfCells,
		owners: Owner[]
	)
	{
		this.name = name;
		this.defns = defns;
		this.turnsSoFar = turnsSoFar;
		this.difficultyLevelName = difficultyLevelName;
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

		this.wondersBuilt = [];
	}

	static demo(): World
	{
		var terrains = MapOfCellsCellTerrain.Instances()._All;

		var defns = new WorldDefns
		(
			terrains,
			UnitDefn.Instances()._All
		);

		var map = MapOfCells.fromCellsAsStringGroups
		([
			[
				"~~~~~~~~~~~~~~~~",
				"~..............~",
				"~::::::::::::::~",
				"~..............~",
				"~::::::::::::::~",
				"~**************~",
				"~::::::::::::::~",
				"~~~~~~~~~~~~~~~~"
			],
			[
				"~~~~~~~~~~~~~~~~",
				"~..............~",
				"~PPPPPPPPPPPPPP~", // P = shield
				"~TTTTTTTTTTTTTT~", // T = wheat
				"~::::::::::::::~",
				"~**************~",
				"~::::::::::::::~",
				"~~~~~~~~~~~~~~~~"
			]
		]);

		var owners = [];
		var ownerCount = 2;
		var ownerColorNames = [ "Blue", "Orange" ];
		var mapSizeInCells = map.sizeInCells;
		var ownerStartingPositions =
		[
			mapSizeInCells.clone().multiply(Coords.fromXY(.25, .5)).round(),
			mapSizeInCells.clone().multiply(Coords.fromXY(.75, .5)).round()
		];
		var unitDefns = UnitDefn.Instances();

		for (var i = 0; i < ownerCount; i++)
		{
			var ownerName = "Owner" + i;
			var ownerColorName = ownerColorNames[i];
			
			var ownerIntelligence = 
			(
				i == 0 ? OwnerIntelligence.human() : OwnerIntelligence.machine()
			);

			var startingPos = ownerStartingPositions[i];
			var unitInitial = new Unit
			(
				ownerName,
				unitDefns.Settlers.name,
				startingPos
			);

			var owner = new Owner
			(
				ownerName,
				ownerColorName,
				ownerIntelligence,
				OwnerFinances.default(),
				OwnerResearch.default(),
				OwnerMapKnowledge.default(),
				OwnerDiplomacy.default(),
				NotificationLog.create(),
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
			DifficultyLevel.Instances()._All[0].name,
			0, // turnsSoFar
			map,
			owners
		);

		return worldDemo;
	}

	baseAdd(base: Base): void
	{
		base.initialize(this);
		this.bases.push(base);
		var cell = this.map.cellAtPosInCells(base.pos);
		cell.baseAdd(base);
	}

	baseById(id: number): Base
	{
		return this.bases.find( (x: Base) => x.id == id);
	}

	baseRemove(base: Base): void
	{
		this.bases.splice(this.bases.indexOf(base), 1);
		var cell = this.map.cellAtPosInCells(base.pos);
		cell.baseRemove(base);
	}

	difficultyLevel(): DifficultyLevel
	{
		return DifficultyLevel.byName(this.difficultyLevelName);
	}

	draw(universe: Universe): void
	{
		var ownerCurrent = this.ownerCurrent();
		var ownerCurrentMapKnowledge = ownerCurrent.mapKnowledge;
		ownerCurrentMapKnowledge.draw(universe, this, ownerCurrent);
	}

	initialize(universe: Universe): void
	{
		this.owners.forEach(x => x.initialize(this));

		this.draw(universe);
	}

	ownerByName(name: string): Owner
	{
		return this.owners.find(x => x.name == name);
	}

	ownerCurrent(): Owner
	{
		return this.owners[this.ownerCurrentIndex];
	}

	ownerCurrentAdvance(universe: Universe): Owner
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

	turnAdvance(): void
	{
		this.owners.forEach(x => x.turnUpdate(this) );
		this.turnsSoFar++;
	}

	turnAdvanceMultiple(turnsToAdvance: number): void
	{
		for (var i = 0; i < turnsToAdvance; i++)
		{
			this.turnAdvance();
		}
	}

	unitAdd(unit: Unit): void
	{
		this.units.push(unit);

		var unitOwner = unit.owner(this);
		unitOwner.unitAdd(unit);

		var cell = this.map.cellAtPosInCells(unit.pos);
		cell.unitAdd(unit);

		unit.ownerMapKnowledgeUpdate(this);
	}

	unitById(id: number): Unit
	{
		return this.units.find(x => x.id == id);
	}

	unitRemove(unit: Unit): void
	{
		var baseSupporting = unit.baseSupporting(this);
		if (baseSupporting != null) // The initial settler has no support.
		{
			baseSupporting.unitRemove(unit);
		}
		this.units.splice(this.units.indexOf(unit), 1);
		var cell = this.map.cellAtPosInCells(unit.pos);
		cell.unitRemove(unit);
	}

	wonderHasBeenBuilt
	(
		baseImprovementDefnWonder: BaseImprovementDefn
	): boolean
	{
		return this.wondersBuilt.some
		(
			(x: BaseImprovementDefn) => x.name == baseImprovementDefnWonder.name
		);
	}
}

class WorldDefns
{
	terrains: MapOfCellsCellTerrain[];
	unitDefns: UnitDefn[];

	_terrainsByCode: Map<string, MapOfCellsCellTerrain>;
	_unitDefnsByName: Map<string, UnitDefn>;

	constructor
	(
		terrains: MapOfCellsCellTerrain[],
		unitDefns: UnitDefn[]
	)
	{
		this.terrains = terrains;
		this.unitDefns = unitDefns;

		this._terrainsByCode = new Map(this.terrains.map(x => [x.code, x]));
		this._unitDefnsByName = new Map(this.unitDefns.map(x => [x.name, x]));
	}

	terrainByCode(code: string): MapOfCellsCellTerrain
	{
		return this._terrainsByCode.get(code);
	}

	unitDefnByName(name: string): UnitDefn
	{
		return this._unitDefnsByName.get(name);
	}
}
