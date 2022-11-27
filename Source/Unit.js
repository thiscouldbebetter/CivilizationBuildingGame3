
class Unit
{
	constructor(ownerName, defnName, pos)
	{
		this.ownerName = ownerName;
		this.defnName = defnName;
		this.pos = pos;

		this.id = IdHelper.idNext();
		this.movesThisTurn = 0;
		this.isSleeping = false;

		this._cellToPos = Coords.create();
	}

	activitySet(activityDefn)
	{
		this.activity = new UnitActivity(activityDefn.name, 0);
	}

	category()
	{
		return SelectableCategory.Instances().Units;
	}

	defn(world)
	{
		return world.defns.unitDefnByName(this.defnName);
	}

	hasMovesThisTurn()
	{
		return (this.movesThisTurn > 0);
	}

	isIdle()
	{
		return (this.hasMovesThisTurn() && this.isSleeping == false);
	}

	initialize(world)
	{
		this.turnAdvance(world);
	}

	movesThisTurnClear()
	{
		this.movesThisTurn = 0;
	}

	owner(world)
	{
		return world.ownerByName(this.ownerName);
	}

	toStringDetails(world)
	{
		var defn = this.defn(world);

		var lines =
		[
			"ID: " + this.id,
			"Type: " + this.defnName,
			"Position: " + this.pos.toString(),
			"Moves: " + this.movesThisTurn + "/" + defn.movement.movesPerTurn,
			defn.combat.toString()
		];
		var linesJoined = lines.join("<br />");
		return linesJoined
	}

	toStringForList()
	{
		return this.id + ": " + this.defnName + " @" + this.pos.toString();
	}

	turnAdvance(world)
	{
		var defn = this.defn(world);
		this.movesThisTurn = defn.movement.movesPerTurn;
		var owner = this.owner(world);
		if (this.activity != null)
		{
			this.activity.advance(null, world, owner, this);
		}
	}

	// Movement.

	canMoveInDirection(directionToMove, world)
	{
		var costToMove =
			this.costToMoveInDirection(directionToMove, world);
		var canMove = (costToMove <= this.movesThisTurn);
		return canMove;
	}

	cellsFromAndTo(directionToMove, world)
	{
		var map = world.map;
		var cellFromPos = this.pos;
		var offsetToMove = directionToMove.offset;
		var cellToPos =
			this._cellToPos.overwriteWith(cellFromPos).add(offsetToMove);

		var cellFrom = map.cellAtPosInCells(cellFromPos);
		var cellTo = map.cellAtPosInCells(cellToPos);

		return [ cellFrom, cellTo ];
	}

	costToMoveInDirection(directionToMove, world)
	{
		var cellsFromAndTo = this.cellsFromAndTo(directionToMove, world);
		var cellFrom = cellsFromAndTo[0];
		var cellTo = cellsFromAndTo[1];

		var cellToTerrain = cellTo.terrain(world);
		var defn = this.defn(world);

		var costToMove = defn.movement.costToMoveFromCellToCell
		(
			world, cellFrom, cellTo
		);

		return costToMove;
	}

	moveInDirection(directionToMove, world)
	{
		var costToMove =
			this.costToMoveInDirection(directionToMove, world);

		if (costToMove <= this.movesThisTurn)
		{
			var cellsFromAndTo = this.cellsFromAndTo(directionToMove, world);
			var cellFrom = cellsFromAndTo[0];
			var cellTo = cellsFromAndTo[1];

			this.movesThisTurn -= costToMove;
			this.pos.overwriteWith(cellTo.pos);
			cellFrom.unitRemove(this);
			cellTo.unitAdd(this);
		}
	}
}

class UnitActivity
{
	constructor(defnName, movesInvestedSoFar)
	{
		this.defnName = defnName;
		this.movesInvestedSoFar = movesInvestedSoFar;
	}

	advance(universe, world, owner, unit)
	{
		this.movesInvestedSoFar += this.movesThisTurn;
		var defn = this.defn();
		if (this.movesInvestedSoFar >= defn.movesToComplete)
		{
			this.complete();
		}
		this.movesThisTurnClear();
	}

	complete(universe, world, owner, unit)
	{
		this.defn().perform(universe, world, owner, unit)
	}

	defn()
	{
		return UnitActivityDefn.byName(this.defnName);
	}
}

class UnitActivityDefn
{
	constructor(name, movesToComplete, perform)
	{
		this.name = name;
		this.movesToComplete = movesToComplete;
		this._perform = perform;
	}

	static Instances()
	{
		if (UnitActivityDefn._instances == null)
		{
			UnitActivityDefn._instances =
				new UnitActivityDefn_Instances();
		}
		return UnitActivityDefn._instances;
	}

	static byName(name)
	{
		return UnitActivityDefn.Instances().byName(name);
	}

	perform(universe, world, owner, unit)
	{
		this._perform(universe, world, owner, unit);
	}
}

class UnitActivityDefn_Instances
{
	constructor()
	{
		var performNone = null;

		this.Disband = new UnitActivityDefn("Disband", 1, this.disband);
		this.Fortify = new UnitActivityDefn("Fortify", 1, this.fortify);
		this.Pass = new UnitActivityDefn("Pass", 1, this.pass);
		this.Sleep = new UnitActivityDefn("Sleep", 1, this.sleep);

		this.SettlersBuildFort =
			new UnitActivityDefn("Build Road", 3, this.settlersBuildFort);
		this.SettlersBuildIrrigation =
			new UnitActivityDefn("Build Irrigation", 3, this.settlersBuildIrrigation);
		this.SettlersBuildMine =
			new UnitActivityDefn("Build Mine", 3, this.settlersBuildMine);
		this.SettlersBuildRoad =
			new UnitActivityDefn("Build Road", 3, this.settlersBuildRoad);
		this.SettlersClearForest =
			new UnitActivityDefn("Clear Forest", 3, this.settlersClearForest);
		this.SettlersPlantForest
			= new UnitActivityDefn("Plant Forest", 3, this.settlersPlantForest);
		this.SettlersStartCity =
			new UnitActivityDefn("Start City", 1, this.settlersStartCity);

		this._All =
		[
			this.Disband,
			this.Fortify,
			this.Pass,
			this.Sleep,

			this.SettlersBuildFort,
			this.SettlersBuildIrrigation,
			this.SettlersBuildMine,
			this.SettlersBuildRoad,
			this.SettlersClearForest,
			this.SettlersPlantForest,
			this.SettlersStartCity
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
	}

	// Performs.

	disband(universe, world, owner, unit)
	{
		owner.unitRemove(unit);
		world.unitRemove(unit);
	}

	fortify(universe, world, owner, unit)
	{
		unit.activityStart
		(
			ActivityDefn.Instances().Fortify
		);
	}

	pass(universe, world, owner, unit)
	{
		unit.movesThisTurn = 0;
		owner.unitSelectNextIdle();
	}

	sleep(universe, world, owner, unit)
	{
		unit.isSleeping = true;
		owner.unitSelectNextIdle();
	}

	// Settlers.

	settlersBuildFort(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}

	settlersBuildIrrigation(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}

	settlersBuildMine(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}

	settlersBuildRoad(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}

	settlersClearForest(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}

	settlersPlantForest(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}

	settlersStartCity(universe, world, owner, unit)
	{
		alert("To be implemented!");
	}
}

class UnitDefn
{
	constructor
	(
		name,
		industryToBuild,
		movement,
		combat,
		actionsAvailableNames,
		symbol
	)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
		this.movement = movement;
		this.combat = combat;
		this.actionsAvailableNames = actionsAvailableNames;
		this.symbol = symbol;
	}

	static construct
	(
		name,
		industryToBuild,
		movement,
		combat,
		actionsAvailableNames,
		symbol
	)
	{
		return new UnitDefn
		(
			name,
			industryToBuild,
			movement,
			combat,
			actionsAvailableNames,
			symbol
		);
	}

	static Instances()
	{
		if (UnitDefn._instances == null)
		{
			UnitDefn._instances = new UnitDefn_Instances();
		}
		return UnitDefn._instances;
	}

	actionsAvailable()
	{
		return this.actionsAvailableNames.map(x => UnitActivityDefn.byName(x));
	}

	build(world, base)
	{
		var unitPos = base.pos.clone();
		var unit = new Unit(this.name, unitPos);
		base.unitSupport(unit);
		world.unitAdd(unit);
	}
}

class UnitDefn_Instances
{
	constructor()
	{
		// Movements
		var g1 = UnitDefnMovement.ground(1);
		var g2 = UnitDefnMovement.ground(2);
		var g3 = UnitDefnMovement.ground(3);
		var o1 = UnitDefnMovement.ocean(1);
		var o3 = UnitDefnMovement.ocean(3);
		var o5 = UnitDefnMovement.ocean(5);

		var ads = UnitActivityDefn.Instances();
		var a0 = [];
		var aSet =
		[
			ads.Sleep,
			ads.Pass,
			ads.SettlersBuildFort,
			ads.SettlersBuildIrrigation,
			ads.SettlersBuildMine,
			ads.SettlersBuildRoad,
			ads.SettlersClearForest,
			ads.SettlersPlantForest,
			ads.SettlersStartCity,
			ads.Disband
		].map(x => x.name);

		var ud = UnitDefn.construct;
		var c = UnitDefnCombat.construct; // attack, defense, integrityMax
		var udTodo =
			() =>
			{
				return new UnitDefn
				(
					"[todo]", 1000, c(0, 0, 1), UnitDefnMovement.ground(1), null, "?"
				);
			};

		// Taken from https://civilization.fandom.com/wiki/List_of_units_in_Civ2.
		// 						name,				cost,	move, 	combat, 	actns, 	symbol
		this.AegisCruiser	= udTodo();
		this.AlpineTroops	= udTodo();
		this.Archers 		= ud("Archers", 		30, 	g1,		c(3,2,1), 	a0, 	"Arc");
		this.Armor			= udTodo();
		this.Artillery		= udTodo();
		this.Battleship		= udTodo();
		this.Bomber			= udTodo();
		this.Cannon			= ud("Cannon", 			40,		g1,		c(8,1,2),	a0,		"Can");
		this.Caravan		= ud("Caravan",			50,		g1,		c(0,1,1),	a0,		"Car");
		this.Carrier		= udTodo();
		this.Catapult		= ud("Catapult",		40,		g1,		c(6,1,1),	a0,		"Cat");
		this.Cavalry		= udTodo();
		this.Chariot		= ud("Chariot",			30,		g1,		c(3,1,1),	a0, 	"Cha");
		this.CruiseMissile	= udTodo();
		this.Cruiser		= udTodo();
		this.Crusaders		= udTodo();
		this.Destroyer		= udTodo();
		this.Diplomat		= ud("Diplomat", 		30,		g1,		c(0,1,1),	a0,		"Dip");
		this.Dragoons		= udTodo();
		this.Elephants		= udTodo();
		this.Engineers		= udTodo();
		this.Explorer		= udTodo();
		this.Fanatics		= udTodo();
		this.Fighter		= udTodo();
		this.Freight		= udTodo();
		this.Frigate		= udTodo();
		this.Galleon		= udTodo();
		this.Helicopter		= udTodo();
		this.Horsemen		= udTodo();
		this.Howitzer		= udTodo();
		this.Ironclad		= udTodo();
		this.Knights		= ud("Knights", 		40, 	g2, 	c(2,1,1), 	a0,		"Kni");
		this.Legion			= ud("Legion", 			40,		g1,		c(4,2,1),	a0,		"Leg");
		this.Marines		= udTodo();
		this.MechInfantry	= udTodo();
		this.Musketeers		= udTodo();
		this.NuclearMissile	= udTodo();
		this.Paratroopers	= udTodo();
		this.Partisans		= udTodo();
		this.Phalanx		= ud("Phalanx",			20,		g1,		c(1,2,1),	a0,		"Pha");
		this.Pikemen		= ud("Pikemen",			20,		g1,		c(1,2,1),	a0,		"Pik");
		this.Riflemen		= ud("Riflemen",		40,		g1,		c(4,2,1),	a0,		"Rif");
		this.Settlers 		= ud("Settlers", 		40, 	g1, 	c(0,1,2),	aSet,	"Set");
		this.Spy			= ud("Spy", 			30,		g3,		c(0,0,1),	a0,		"Spy");
		this.StealthBomber	= udTodo();
		this.StealthFighter	= udTodo();
		this.Submarine		= udTodo();
		this.Transport		= udTodo();
		this.Trireme		= ud("Trireme",			40,		o3,		c(1,1,1),	a0,		"Tri");
		this.Warriors 		= ud("Warriors", 		10, 	g1, 	c(1,1,1),	a0,		"War");

		this._All =
		[
			this.AegisCruiser,
			this.Battleship,
			this.Bomber,
			this.Cannon,
			this.Caravan,
			this.Carrier,
			this.Catapult,
			this.Cavalry,
			this.Chariot,
			this.CruiseMissile,
			this.Cruiser,
			this.Crusaders,
			this.Destroyer,
			this.Diplomat,
			this.Dragoons,
			this.Elephants,
			this.Engineers,
			this.Explorer,
			this.Fanatics,
			this.Fighter,
			this.Freight,
			this.Frigate,
			this.Galleon,
			this.Helicopter,
			this.Horsemen,
			this.Howitzer,
			this.Ironclad,
			this.Knights,
			this.Legion,
			this.Marines,
			this.MechInfantry,
			this.Musketeers,
			this.NuclearMissile,
			this.Paratroopers,
			this.Partisans,
			this.Phalanx,
			this.Pikemen,
			this.Riflemen,
			this.Settlers,
			this.Spy,
			this.StealthFighter,
			this.Submarine,
			this.Transport,
			this.Trireme,
			this.Warriors
		];
	}
}

class UnitDefnCombat
{
	constructor(attack, defense, integrityMax)
	{
		this.attack = attack;
		this.defense = defense;
		this.integrityMax = integrityMax;
	}

	static construct(attack, defense, integrityMax)
	{
		return new UnitDefnCombat(attack, defense, integrityMax);
	}

	toString()
	{
		return "Attack/Defense: " + this.attack + "/" + this.defense;
	}
}

class UnitDefnMovement
{
	constructor(movesPerTurn, costToMoveFromCellToCell)
	{
		this.movesPerTurn = movesPerTurn;
		this.costToMoveFromCellToCell = costToMoveFromCellToCell;
	}

	static ground(movesPerTurn)
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(world, cellFrom, cellTo) =>
			{
				var cellToTerrain = cellTo.terrain(world);
				var cellToTerrainIsLand = cellToTerrain.isLand();
				var costToMove =
				(
					cellToTerrainIsLand
					? cellToTerrain.movesToTraverse
					: Number.POSITIVE_INFINITY
				);
				return costToMove;
			}
		);
	}

	static ocean(movesPerTurn)
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(world, cellFrom, cellTo) =>
			{
				var cellToTerrain = cellTo.terrain(world);
				var cellToTerrainIsOcean = (cellToTerrain.name == "Ocean");
				var costToMove = (cellToTerrainIsOcean ? 1 : Number.POSITIVE_INFINITY);
				return costToMove;
			}
		);
	}
}
