
class Unit
{
	constructor(ownerName, defnName, pos)
	{
		this.ownerName = ownerName;
		this.defnName = defnName;
		this.pos = pos;

		this.id = IdHelper.idNext();
		this.moveThirdsThisTurn = 0;
		this.isSleeping = false;

		this._cellToPos = Coords.create();
	}

	activityStart(activityDefn, world)
	{
		this.activity = new UnitActivity
		(
			activityDefn.name, 0
		);
		var owner = this.owner(world);
		this.activity.start(null, world, owner, this);
	}

	activityUpdate(universe, world)
	{
		if (this.activity != null)
		{
			var owner = this.owner(world);
			this.activity.turnUpdate(universe, world, owner, this);
		}
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
		return (this.moveThirdsThisTurn > 0);
	}

	isIdle()
	{
		return (this.hasMovesThisTurn() && this.isSleeping == false);
	}

	initialize(world)
	{
		this.turnUpdate(world);
	}

	movesThisTurnClear()
	{
		this.moveThirdsThisTurn = 0;
	}

	owner(world)
	{
		return world.ownerByName(this.ownerName);
	}

	ownerSet(owner)
	{
		this.ownerName = owner.name;
	}

	toStringDetails(world)
	{
		var defn = this.defn(world);

		var lines =
		[
			"ID: " + this.id,
			"Type: " + this.defnName,
			"Position: " + this.pos.toString(),
			"Moves: " + this.movesThisTurn() + "/" + defn.movement.movesPerTurn(),
			defn.combat.toString()
		];
		var linesJoined = lines.join("<br />");
		return linesJoined
	}

	toStringForList()
	{
		return this.id + ": " + this.defnName + " @" + this.pos.toString();
	}

	turnUpdate(world)
	{
		var defn = this.defn(world);
		this.moveThirdsThisTurn = defn.movement.moveThirdsPerTurn;
		var owner = this.owner(world);
		if (this.activity != null)
		{
			this.activity.turnUpdate(null, world, owner, this);
		}
	}

	// Movement.

	attackDefender(defender, world)
	{
		var defn = this.defn(world);
		defn.unitAttackDefender(this, defender);
	}

	canMoveInDirection(directionToMove, world)
	{
		var costToMoveInThirds =
			this.costToMoveInDirection(directionToMove, world);
		var canMove = (costToMoveInThirds <= this.movesThisTurn());
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
		return this.costToMoveInDirectionInThirds(directionToMove, world) / 3;
	}

	costToMoveInDirectionInThirds(directionToMove, world)
	{
		var cellsFromAndTo = this.cellsFromAndTo(directionToMove, world);
		var cellFrom = cellsFromAndTo[0];
		var cellTo = cellsFromAndTo[1];

		var cellToTerrain = cellTo.terrain(world);
		var defn = this.defn(world);

		var costToMoveInThirds = defn.movement.costToMoveFromCellToCellInThirds
		(
			world, this, cellFrom, cellTo
		);

		return costToMoveInThirds;
	}

	moveInDirection(directionToMove, world)
	{
		var costToMoveInThirds =
			this.costToMoveInDirectionInThirds(directionToMove, world);

		if (costToMoveInThirds <= this.moveThirdsThisTurn)
		{
			var cellsFromAndTo = this.cellsFromAndTo(directionToMove, world);
			var cellFrom = cellsFromAndTo[0];
			var cellTo = cellsFromAndTo[1];

			this.moveThirdsThisTurn -= costToMoveInThirds;

			var unitMovingOwner = this.owner(world);
			var isEnemyUnitPresent =
				cellTo.unitNotAlliedWithOwnerIsPresent(unitMovingOwner);
			
			if (isEnemyUnitPresent)
			{
				// todo - Log to output.
				var defender =
					cellTo.unitsNotAlliedWithOwner(unitMovingOwner)[0];
				this.attackDefender(defender, world);
			}
			else
			{
				this.pos.overwriteWith(cellTo.pos);
				cellFrom.unitRemove(this);
				cellTo.unitAdd(this);
				this.ownerMapKnowledgeUpdate(world);
			}
		}
	}

	movesThisTurn()
	{
		return this.moveThirdsThisTurn / 3;
	}

	ownerMapKnowledgeUpdate(world)
	{
		var owner = this.owner(world);
		var ownerMapKnowledge = owner.mapKnowledge;
		ownerMapKnowledge.update(null, world, owner);
	}
}

class UnitActivity
{
	constructor(defnName, movesInvestedSoFar)
	{
		this.defnName = defnName;
		this.movesInvestedSoFar = movesInvestedSoFar;
	}

	complete(universe, world, owner, unit)
	{
		var defn = this.defn();
		defn.perform(universe, world, owner, unit);
	}

	defn()
	{
		return UnitActivityDefn.byName(this.defnName);
	}

	start(universe, world, owner, unit)
	{
		var defn = this.defn();
		defn.start(universe, world, owner, unit);
	}

	turnUpdate(universe, world, owner, unit)
	{
		this.movesInvestedSoFar += unit.movesThisTurn();
		var defn = this.defn();
		if (this.movesInvestedSoFar >= defn.movesToComplete)
		{
			this.complete(universe, world, owner, unit);
			unit.activity = null;
		}
		unit.movesThisTurnClear();
	}
}

class UnitActivityDefn
{
	constructor(name, movesToComplete, start, perform)
	{
		this.name = name;
		this.movesToComplete = movesToComplete;
		this._start = start;
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

	start(universe, world, owner, unit)
	{
		if (this._start != null)
		{
			this._start(universe, world, owner, unit);
		}
	}
}

class UnitActivityDefn_Instances
{
	constructor()
	{
		var startNone = () => {};
		var uad = (a, b, c, d) => new UnitActivityDefn(a, b, c, d);

		// 									  name					mv start	  complete
		this.Disband 					= uad("Disband", 			1, startNone, this.disband);
		this.Fortify 					= uad("Fortify", 			1, startNone, this.fortify);
		this.Pass 						= uad("Pass", 				1, startNone, this.pass);
		this.RestAfterMove 				= uad("RestAfterMove", 		1, startNone, this.restAfterMove);
		this.Sleep 						= uad("Sleep", 				1, startNone, this.sleep);

		this.SettlersBuildFort 			= uad("Build Fort", 		3, startNone, this.settlersBuildFort);
		this.SettlersBuildIrrigation 	= uad("Build Irrigation", 	3, startNone, this.settlersBuildIrrigation);
		this.SettlersBuildMines 		= uad("Build Mines", 		3, startNone, this.settlersBuildMines);
		this.SettlersBuildRoads 		= uad("Build Roads", 		3, startNone, this.settlersBuildRoads);
		this.SettlersClearForest 		= uad("Clear Forest", 		3, startNone, this.settlersClearForest);
		this.SettlersPlantForest 		= uad("Plant Forest", 		3, startNone, this.settlersPlantForest);
		this.SettlersStartCity 			= uad("Start City", 		1, this.settlersStartCity, null);

		this._All =
		[
			this.Disband,
			this.Fortify,
			this.Pass,
			this.RestAfterMove,
			this.Sleep,

			this.SettlersBuildFort,
			this.SettlersBuildIrrigation,
			this.SettlersBuildMines,
			this.SettlersBuildRoads,
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
		unit.fortify();
	}

	pass(universe, world, owner, unit)
	{
		unit.movesThisTurnClear();
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
		var map = world.map;
		var cell = map.cellAtPosInCells(unit.pos);
		cell.improvementAddFort();
	}

	settlersBuildIrrigation(universe, world, owner, unit)
	{
		var map = world.map;
		var cell = map.cellAtPosInCells(unit.pos);
		cell.improvementAddIrrigation();
	}

	settlersBuildMines(universe, world, owner, unit)
	{
		var map = world.map;
		var cell = map.cellAtPosInCells(unit.pos);
		cell.improvementAddMines();
	}

	settlersBuildRoads(universe, world, owner, unit)
	{
		var map = world.map;
		var cell = map.cellAtPosInCells(unit.pos);
		cell.improvementAddRoads();
	}

	settlersClearForest(universe, world, owner, unit)
	{
		var map = world.map;
		var cell = map.cellAtPosInCells(unit.pos);
		// todo
	}

	settlersPlantForest(universe, world, owner, unit)
	{
		var map = world.map;
		var cell = map.cellAtPosInCells(unit.pos);
		// todo
	}

	settlersStartCity(universe, world, owner, unit)
	{
		var base = Base.fromNamePosAndOwnerName
		(
			null, // name
			unit.pos.clone(),
			owner.name
		);

		owner.baseAdd(base);
		world.baseAdd(base);
		world.unitRemove(unit);

		owner.unitRemove(unit);
		owner.unitSelectNextIdle();
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

	static byName(name)
	{
		return UnitDefn.Instances().byName(name);
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
		var baseOwner = base.owner(world);
		var unit = new Unit(baseOwner.name, this.name, unitPos);
		base.unitSupport(unit);
		unit.pos = base.pos.clone();
		world.unitAdd(unit);
	}

	movesPerTurn()
	{
		return this.movement.movesPerTurn();
	}
}

class UnitDefn_Instances
{
	constructor()
	{
		// Movements.
		var ma = (movesPerTurn) => UnitDefnMovement.air(movesPerTurn);
		var mg = (movesPerTurn) => UnitDefnMovement.ground(movesPerTurn);
		var mo = (movesPerTurn) => UnitDefnMovement.ocean(movesPerTurn);

		var mg1 = mg(1);
		var mg2 = mg(2);
		var mg3 = mg(3);
		var mo1 = mo(1);

		var mg1r = mg1; // todo - One move, all ground terrains are roads.

		var ads = UnitActivityDefn.Instances();
		var a0 = [];
		var aSet =
		[
			ads.Sleep,
			ads.Pass,
			ads.SettlersBuildFort,
			ads.SettlersBuildIrrigation,
			ads.SettlersBuildMines,
			ads.SettlersBuildRoads,
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
		// 						name,						cost,	move, 	combat, 	actns, 	symbol
		this.AegisCruiser		= ud("AEGIS Cruiser", 		100,	mo(8),	c(8,8,3),	a0,		"Aeg");
		this.AlpineTroops		= ud("Alpine Troops",		50,		mg1r,	c(5,5,2),	a0,		"Alp");
		this.Archers 			= ud("Archers", 			30, 	mg1,	c(3,2,1), 	a0, 	"Arc");
		this.Armor				= ud("Armor",				80, 	mg3,	c(10,5,3),	a0,		"Arm");
		this.Artillery			= ud("Artillery",			50,		mg1,	c(10,1,2),	a0,		"Art");
		this.Battleship			= ud("Battleship",			160,	mo(4),	c(12,12,4),	a0,		"Bat");
		this.Bomber				= ud("Bomber",				120,	ma(8),	c(12,1,2),	a0,		"Bom");
		this.Cannon				= ud("Cannon", 				40,		mg1,	c(8,1,2),	a0,		"Can");
		this.Caravan			= ud("Caravan",				50,		mg1,	c(0,1,1),	a0,		"Cvn");
		this.Caravel			= ud("Caravel",				40,		mo(3),	c(2,1,1),	a0,		"Cvl");
		this.Carrier			= ud("Carrier",				160,	mo(5),	c(1,9,4),	a0,		"Crr");
		this.Catapult			= ud("Catapult",			40,		mg1,	c(6,1,1),	a0,		"Cat");
		this.Cavalry			= ud("Cavalry",				60,		mg2,	c(8,3,2),	a0,		"Cav");
		this.Chariot			= ud("Chariot",				30,		mg1,	c(3,1,1),	a0, 	"Cha");
		this.CruiseMissile		= ud("Cruise Missile", 		60,		ma(12), c(18,0,1),	a0,		"Mis");
		this.Cruiser			= ud("Cruiser",				80,		mo(5),	c(6,6,3),	a0,		"Csr");
		this.Crusaders			= ud("Crusaders",			40,		mg2,	c(5,1,1),	a0,		"Cdr");
		this.Destroyer			= ud("Destroyer",			60,		mo(6),	c(4,4,3),	a0,		"Des");
		this.Diplomat			= ud("Diplomat", 			30,		mg1,	c(0,1,1),	a0,		"Dip");
		this.Dragoons			= ud("Dragoons", 			50,		mg2,	c(5,2,2),	a0,		"Dra");
		this.Elephants			= ud("Elephants", 			40,		mg2,	c(4,1,1),	a0,		"Ele");
		this.Engineers			= ud("Engineers", 			40,		mg2,	c(0,2,2),	a0,		"Eng");
		this.Explorer			= ud("Explorer", 			30, 	mg1r,	c(0,1,1),	a0,		"Exp");
		this.Fanatics			= ud("Fanatics", 			20,		mg1,	c(4,4,2),	a0,		"Fan");
		this.Fighter			= ud("Fighter", 			60,		ma(10),	c(4,3,2),	a0,		"Fig");
		this.Freight			= ud("Freight", 			50,		mg2,	c(0,1,1),	a0,		"Fre");
		this.Frigate			= ud("Frigate", 			50,		mo(4),	c(4,2,2),	a0,		"Fri");
		this.Galleon			= ud("Galleon", 			40,		mo(4),	c(0,2,2),	a0,		"Gal");
		this.Helicopter			= ud("Helicopter", 			100,	ma(6),	c(10,3,2),	a0,		"Hel");
		this.Horsemen			= ud("Horsemen", 			20,		mg2,	c(2,1,1),	a0,		"Hor");
		this.Howitzer			= ud("Howitzer", 			70,		mg2,	c(12,2,3),	a0,		"How");
		this.Ironclad			= ud("Ironclad", 			60,		mo(4),	c(4,4,3),	a0,		"Iro");
		this.Knights			= ud("Knights", 			40,		mg2, 	c(2,1,1),	a0,		"Kni");
		this.Legion				= ud("Legion", 				40,		mg1,	c(4,2,1),	a0,		"Leg");
		this.Marines			= ud("Marines", 			60,		mg1,	c(8,5,2),	a0,		"Mar");
		this.MechanizedInfantry = ud("Mechanized Infantry", 50,		mg3,	c(6,6,3),	a0,		"Mec");
		this.Musketeers			= ud("Musketeers", 			30,		mg1,	c(3,3,2),	a0,		"Mus");
		this.NuclearMissile		= ud("Nuclear Missile", 	160,	ma(16),	c(99,0.1),	a0,		"Nuc");
		this.Paratroopers		= ud("Paratroopers", 		60,		mg1,	c(6,4,2),	a0,		"Ptp");
		this.Partisans			= ud("Partisans",			50,		mg1,	c(4,4,2),	a0,		"Ptn");
		this.Phalanx			= ud("Phalanx",				20,		mg1,	c(1,2,1),	a0,		"Pha");
		this.Pikemen			= ud("Pikemen",				20,		mg1,	c(1,2,1),	a0,		"Pik");
		this.Riflemen			= ud("Riflemen",			40,		mg1,	c(4,2,1),	a0,		"Rif");
		this.Settlers 			= ud("Settlers", 			40, 	mg1, 	c(0,1,2),	aSet,	"Set");
		this.Spy				= ud("Spy", 				30,		mg3,	c(0,0,1),	a0,		"Spy");
		this.StealthBomber		= ud("Stealth Bomber", 		160,	ma(12),	c(14,5,2),	a0,		"SBo");
		this.StealthFighter		= ud("Stealth Fighter", 	80,		ma(14),	c(8,4,2),	a0,		"SFi");
		this.Submarine			= ud("Submarine", 			60,		mo(3),	c(10,2,3),	a0,		"Sub");
		this.Transport			= ud("Transport", 			50,		mo(5),	c(0,3,3),	a0,		"Tra");
		this.Trireme			= ud("Trireme",				40,		mo(3),	c(1,1,1),	a0,		"Tri");
		this.Warriors 			= ud("Warriors", 			10, 	mg1, 	c(1,1,1),	a0,		"War");

		this._All =
		[
			this.AegisCruiser,
			this.Battleship,
			this.Bomber,
			this.Cannon,
			this.Caravan,
			this.Caravel,
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
			this.MechanizedInfantry,
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

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
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

	unitAttackDefender(attacker, defender)
	{
		var attackerDefn = this.defn(world);
		var defenderDefn = defender.defn(world);
		var attackOfAttacker = attackerDefn.combat.attack;
		var defenseOfDefender = defenderDefn.combat.defense;
		var attackOfAttackerPlusDefenseOfDefender =
			attackOfAttacker + defenseOfDefender;
		var attackerAttackRoll =
			Math.random() * attackOfAttackerPlusDefenseOfDefender;
		if (attackerAttackRoll > defenseOfDefender)
		{
			defender.combat.integritySubtract1();
		}
		else
		{
			this.integritySubtract1();
		}
	}

	integritySubtract1(unit)
	{
		unit.integrity--;
		if (unit.integrity <= 0)
		{
			// todo
		}
	}

	toString()
	{
		return "Attack/Defense: " + this.attack + "/" + this.defense;
	}
}

class UnitDefnMovement
{
	constructor(movesPerTurn, costToMoveFromCellToCellInThirds)
	{
		this.moveThirdsPerTurn = movesPerTurn * 3;
		this._costToMoveFromCellToCellInThirds =
			costToMoveFromCellToCellInThirds;
	}

	costToMoveFromCellToCellInThirds(world, unitMoving, cellFrom, cellTo)
	{
		return this._costToMoveFromCellToCellInThirds
		(
			world, unitMoving, cellFrom, cellTo
		);
	}

	movesPerTurn()
	{
		return this.moveThirdsPerTurn / 3;
	}

	static air(movesPerTurn)
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(world, unitMoving, cellFrom, cellTo) => // cost
			{
				return 3;
			}
		);
	}

	static ground(movesPerTurn)
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(world, unitMoving, cellFrom, cellTo) => // cost
			{
				var costToMoveInThirds;

				var cellToTerrain = cellTo.terrain(world);
				var cellToTerrainIsLand = cellToTerrain.isLand();
				if (cellToTerrainIsLand == false)
				{
					costToMoveInThirds = Number.POSITIVE_INFINITY;
				}
				else
				{
					var unitMovingOwner = unitMoving.owner;
					var isNonAlliedUnitPresent =
						cellTo.unitNotAlliedWithOwnerIsPresent(unitMovingOwner, world);
					if (isNonAlliedUnitPresent)
					{
						var unitsPresentNonAllied =
							cellTo.unitsPresentNotAlliedWithOwner(owner, world);
						var unitNonAlliedFirst = unitsPresentNonAllied[0];
						var unitNonAlliedOwner = unitNonAlliedFirst.owner(world);
						var isUnitNonAlliedAnEnemy =
							unitMovingOwner.isAtWarWith(unitNonAlliedOwner);
						if (isUnitNonAlliedAnEnemy)
						{
							costToMoveInThirds = 3;
						}
						else
						{
							// At peace: neither allied nor at war.
							costToMoveInThirds = Number.POSITIVE_INFINITY;
						}
					}
					else
					{
						var cellToHasRoads = cellTo.hasRoads();
						costToMoveInThirds =
						(
							cellTo.hasRoads()
							? 1
							: cellToTerrain.movesToTraverse * 3
						);
					}
				}
				return costToMoveInThirds;
			}
		);
	}

	static ocean(movesPerTurn)
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(world, unitMoving, cellFrom, cellTo) => // cost
			{
				var cellToTerrain = cellTo.terrain(world);
				var cellToTerrainIsOcean = (cellToTerrain.name == "Ocean");
				var costToMove = (cellToTerrainIsOcean ? 1 : Number.POSITIVE_INFINITY);
				var costToMoveInThirds = costToMove *= 3;
				return costToMoveInThirds;
			}
		);
	}
}
