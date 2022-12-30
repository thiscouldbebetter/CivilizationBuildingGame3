
class Unit
{
	constructor(ownerName, defnName, pos)
	{
		this.ownerName = ownerName;
		this.defnName = defnName;
		this.pos = pos;

		this.id = IdHelper.idNext();
		this.baseSupportingId = null;
		this._moveThirdsThisTurn = null;
		this.movesThisTurnClear();
		this.isSleeping = false;

		this._cellToPos = Coords.create();
	}

	activity()
	{
		return this._activity;
	}

	activityClear()
	{
		this.activitySet(null);
	}

	activityDefnStart(activityDefn)
	{
		this.activityDefnStartForWorld(activityDefn, null);
	}

	activityDefnStartForWorld(activityDefn, world)
	{
		this.activityDefnStartForWorldWithVariables(activityDefn, world, null);
	}

	activityDefnStartForWorldWithVariableNameAndValue
	(
		activityDefn, world, variableName, variableValue
	)
	{
		this.activityDefnStartForWorldWithVariables
		(
			activityDefn, world,
			new Map( [ [variableName, variableValue] ] )
		)
	}

	activityDefnStartForWorldWithVariables
	(
		activityDefn, world, variableValuesByName
	)
	{
		this.activitySet
		(
			new UnitActivity
			(
				activityDefn.name, variableValuesByName
			)
		);
		this.activityUpdate(null, world);
	}

	activitySet(value)
	{
		this._activity = value;
	}

	activityUpdate(universe, world)
	{
		if (this._activity != null)
		{
			var owner = this.owner(world);
			this._activity.perform(universe, world, owner, this);
		}
	}

	baseSupporting(world)
	{
		return world.baseById(this.baseSupportingId);
	}

	baseSupportingSet(base)
	{
		this.baseSupportingId = base.id;
		base.unitSupport(this);
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
		return (this.moveThirdsThisTurn() > 0);
	}

	integritySubtractDamage(damage, world)
	{
		this.defn(world).combat.integritySubtractDamageFromUnit(damage, this);
	}

	isIdle()
	{
		return (this.hasMovesThisTurn() && this.isSleeping == false);
	}

	isMilitary(world)
	{
		return (this.defn(world).combat.attack > 0);
	}

	initialize(world)
	{
		this.turnUpdate(world);
	}

	isInBaseSupporting(world)
	{
		return this.baseSupporting(world).pos.equals(this.pos);
	}

	moveStartTowardPosInWorld(targetPos, world)
	{
		var activityDefns = UnitActivityDefn.Instances();
		this.activityDefnStartForWorldWithVariableNameAndValue
		(
			activityDefns.MoveTo,
			world,
			UnitActivityVariableNames.TargetPos(),
			targetPos
		);
	}

	moveThirdsThisTurn()
	{
		return this._moveThirdsThisTurn;
	}

	moveThirdsThisTurnSet(value)
	{
		this._moveThirdsThisTurn = value;
	}

	movesThisTurnClear()
	{
		this.moveThirdsThisTurnSet(0);
	}

	owner(world)
	{
		return world.ownerByName(this.ownerName);
	}

	ownerSet(owner)
	{
		this.ownerName = owner.name;
	}

	sleep(world)
	{
		var activityDefns = UnitActivityDefn.Instances();
		this.activityDefnStartForWorld(activityDefns.Sleep, world);
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
		var linesJoined = lines.join("\n");
		return linesJoined;
	}

	toStringForList()
	{
		return this.id + ": " + this.defnName + " @" + this.pos.toString();
	}

	turnUpdate(world)
	{
		var defn = this.defn(world);
		this.moveThirdsThisTurnSet(defn.movement.moveThirdsPerTurn);
		var owner = this.owner(world);
		this.activityUpdate(null, world);
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

	cellsFromAndToForDirectionAndWorld(directionToMove, world)
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
		var cellsFromAndTo = this.cellsFromAndToForDirectionAndWorld
		(
			directionToMove, world
		);
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
		var activityDefns = UnitActivityDefn.Instances();
		this.activityDefnStartForWorldWithVariableNameAndValue
		(
			activityDefns.Move,
			world,
			UnitActivityVariableNames.Direction(), directionToMove
		);
	}

	movesThisTurn()
	{
		return this.moveThirdsThisTurn() / 3;
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
	constructor(defnName, variableValuesByName)
	{
		this.defnName = defnName;

		this.variableValuesByName = variableValuesByName || new Map();
	}

	defn()
	{
		return UnitActivityDefn.byName(this.defnName);
	}

	perform(universe, world, owner, unit)
	{
		var defn = this.defn();
		defn.perform(universe, world, owner, unit);
	}

	variableSetByNameAndValue(name, value)
	{
		this.variableValuesByName.set(name, value);
	}

	variableValueByName(name)
	{
		return this.variableValuesByName.get(name);
	}

	// Variable convenience accessors.

	targetPos()
	{
		return this.variableValueByName(UnitActivityVariableNames.TargetPos() );
	}
}

class UnitActivityDefn
{
	constructor(name, variableValuesInitialByName, perform)
	{
		this.name = name;
		this.variableValuesInitialByName =
			variableValuesInitialByName || new Map();
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

	variableValueInitialByName(name)
	{
		return this.variableValuesInitialByName.get(name);
	}

	// Variable convenience accessors.

	movesToComplete()
	{
		return this.variableValueInitialByName
		(
			UnitActivityVariableNames.MovesToComplete()
		);
	}
}

class UnitActivityDefn_Instances
{
	constructor()
	{
		var startNone = () => {};
		var uad = (a, b, c) => new UnitActivityDefn(a, b, c);
		var movesToComplete1 = new Map( [ [ UnitActivityVariableNames.MovesToComplete(), 1 ] ] );
		var movesToComplete3 = new Map( [ [ UnitActivityVariableNames.MovesToComplete(), 3 ] ] );

		// 									  name,					vars, 				perform
		this.Disband 					= uad("Disband", 			null, 				this.disband);
		this.Fortify 					= uad("Fortify", 			null, 				this.fortify);
		this.Move 						= uad("Move",				null, 				this.move);
		this.MoveTo 					= uad("MoveTo",				null, 				this.moveTo);
		this.Pass 						= uad("Pass", 				null, 				this.pass);
		this.RestAfterMove 				= uad("RestAfterMove", 		null, 				this.restAfterMove);
		this.Sleep 						= uad("Sleep", 				null, 				this.sleep);

		this.SettlersBuildFort 			= uad("Build Fort", 		movesToComplete3, 	this.settlersBuildFort);
		this.SettlersBuildIrrigation 	= uad("Build Irrigation", 	movesToComplete3, 	this.settlersBuildIrrigation);
		this.SettlersBuildMines 		= uad("Build Mines", 		movesToComplete3, 	this.settlersBuildMines);
		this.SettlersBuildRoads 		= uad("Build Roads", 		movesToComplete1, 	this.settlersBuildRoads);
		this.SettlersClearForest 		= uad("Clear Forest", 		movesToComplete3, 	this.settlersClearForest);
		this.SettlersPlantForest 		= uad("Plant Forest", 		movesToComplete3, 	this.settlersPlantForest);
		this.SettlersStartCity 			= uad("Start City", 		null, 				this.settlersStartCity);

		// Convenience activities.
		this._SettlersBuildAll 			= uad("Build All", 			null, 				this.settlersBuildAll);

		this._All =
		[
			this.Disband,
			this.Fortify,
			this.Move,
			this.MoveTo,
			this.Pass,
			this.RestAfterMove,
			this.Sleep,

			this.SettlersBuildFort,
			this.SettlersBuildIrrigation,
			this.SettlersBuildMines,
			this.SettlersBuildRoads,
			this.SettlersClearForest,
			this.SettlersPlantForest,
			this.SettlersStartCity,

			this._SettlersBuildAll
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

	move(universe, world, owner, unit)
	{
		var activity = unit.activity();
		var directionToMove = activity.variableValueByName
		(
			UnitActivityVariableNames.Direction()
		);
		var costToMoveInThirds =
			unit.costToMoveInDirectionInThirds(directionToMove, world);
		var movesRemainingInThirds = unit.moveThirdsThisTurn();

		if (costToMoveInThirds <= movesRemainingInThirds)
		{
			var cellsFromAndTo = unit.cellsFromAndToForDirectionAndWorld
			(
				directionToMove, world
			);
			var cellFrom = cellsFromAndTo[0];
			var cellTo = cellsFromAndTo[1];

			unit.moveThirdsThisTurnSet
			(
				unit.moveThirdsThisTurn() - costToMoveInThirds
			);

			var unitMovingOwner = unit.owner(world);
			var isEnemyUnitPresent =
				cellTo.unitNotAlliedWithOwnerIsPresent(unitMovingOwner);

			if (isEnemyUnitPresent)
			{
				// todo - Log to output.
				var defender =
					cellTo.unitsNotAlliedWithOwner(unitMovingOwner)[0];
				unit.attackDefender(defender, world);
			}
			else
			{
				unit.pos.overwriteWith(cellTo.pos);
				cellFrom.unitRemove(this);
				cellTo.unitAdd(this);
				unit.ownerMapKnowledgeUpdate(world);
			}
		}

		// todo - Handle single-move units moving onto multi-move terrain.
		unit.activityClear(); 
	}

	moveTo(universe, world, owner, unit)
	{
		var activity = unit.activity();
		var targetPos = activity.targetPos();
		var unitPos = unit.pos;
		var displacementFromUnitToTarget =
			targetPos.clone().subtract(unitPos);
		var distanceFromUnitToTarget =
			displacementFromUnitToTarget.magnitude();
		if (distanceFromUnitToTarget == 0)
		{
			unit.activityClear();
		}
		else
		{
			// todo - Pathfinding.
			var offsetToCellNext =
				displacementFromUnitToTarget.directions();
			var directionToCellNext = Direction.byOffset(offsetToCellNext);
			var canMoveInDirection =
				unit.canMoveInDirection(directionToCellNext, world);
			if (canMoveInDirection == false)
			{
				unit.activityClear();
			}
			else
			{
				activity.variableSetByNameAndValue
				(
					UnitActivityVariableNames.Direction(), directionToCellNext
				);
				unit.moveInDirection(directionToCellNext, world);
				unit.activitySet(activity); // .move() clears it.
			}
		}
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

	settlersBuildAll(universe, world, owner, unit)
	{
		var unitPos = unit.pos;

		var base = unit.baseSupporting(world);
		var landUsage = base.landUsage;
		var cellsUsable = base.cellsUsable(world);

		var canBuildRailroads = false; // todo
		var canBuildFarmland = false; // todo

		var cellScoreMaxSoFar = 0;
		var cellWithScoreMaxSoFar = null;
		var cellDistanceMax = 8; // todo

		for (var i = 0; i < cellsUsable.length; i++)
		{
			var cell = cellsUsable[i];
			var cellPos = cell.posInMap(map);

			var cellScore;

			var cellNeedsIrrigation = (cell.hasIrrigation() == false);
			var cellNeedsRoads = (cell.hasRoads() == false);

			var cellNeedsFarmland =
			(
				canBuildFarmland && cell.hasFarmland() == false
			);
			var cellNeedsRailroads =
			(
				canBuildRailroads && cell.hasRailroads() == false
			);

			var improvementsNeededCount =
				(cellNeedsIrrigation ? 1 : 0)
				+ (cellNeedsRoads ? 1 : 0)
				+ (cellNeedsFarmland ? 1: 0)
				+ (cellNeedsRailroads ? 1 : 0);

			if (improvementsNeededCount == 0)
			{
				cellScore = 0;
			}
			else
			{
				var cellDistance = cellPos.subtract(unitPos).magnitude();
				cellScore = cellDistanceMax - cellDistance; // todo
			}

			if (cellScore > cellScoreMaxSoFar)
			{
				cellScoreMaxSoFar = cellScore;
				cellWithScoreMaxSoFar = cell;
			}
		}

		if (cellScoreMaxSoFar == 0)
		{
			// Everything's already fully improved.
		}
	}

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

class UnitActivityVariableNames
{
	static Direction() { return "Direction"; }
	static MovesToComplete() { return "MovesToComplete"; }
	static TargetPos() { return "TargetPos"; }
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
		unit.baseSupportingSet(base);
		unit.pos = base.pos.clone();
		world.unitAdd(unit);
	}

	isGroundUnit(world)
	{
		return this.movement.isGround(world);
	}

	isMilitary()
	{
		return (this.combat.attack > 0);
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
	constructor(attack, defense, damagePerHit, integrityMax)
	{
		this.attack = attack;
		this.defense = defense;
		this.damagePerHit = damagePerHit;
		this.integrityMax = integrityMax;
	}

	static construct(attack, defense, integrityMax)
	{
		return new UnitDefnCombat(attack, defense, integrityMax);
	}

	unitAttackDefender(attacker, defender, world)
	{
		var attackerDefn = this.defn(world);
		var defenderDefn = defender.defn(world);
		
		var attackerCombat = attackerDefn.combat;
		var defenderCombat = defenderDefn.combat;

		var attackOfAttacker = attackerDefn.combat.attack;
		var defenseOfDefender = defenderDefn.combat.defense;

		var attackOfAttackerPlusDefenseOfDefender =
			attackOfAttacker + defenseOfDefender;
		var attackerAttackRoll =
			Math.random() * attackOfAttackerPlusDefenseOfDefender;

		if (attackerAttackRoll > defenseOfDefender)
		{
			defender.integritySubtract(attackerCombat.damagePerHit, world);
		}
		else
		{
			this.integritySubtract(defenderCombat.damagePerHit, world);
		}
	}

	integritySubtractDamageFromUnit(damage, unit)
	{
		unit.integrity -= damage;
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

	static mapCellGround()
	{
		if (UnitDefnMovement._mapCellGround == null)
		{
			UnitDefnMovement._mapCellGround = MapOfCellsCell.fromTerrainCode
			(
				MapOfCellsCellTerrain.Instances().Plains.code
			);
		}
		return UnitDefnMovement._mapCellGround;
	}

	costToMoveFromCellToCellInThirds(world, unitMoving, cellFrom, cellTo)
	{
		return this._costToMoveFromCellToCellInThirds
		(
			world, unitMoving, cellFrom, cellTo
		);
	}

	isGround(world)
	{
		var mapCell = UnitDefnMovement.mapCellGround();
		var costToMove = this._costToMoveFromCellToCellInThirds
		(
			world, this, mapCell, mapCell
		);
		var returnValue = (costToMove < Number.POSITIVE_INFINITY);
		return returnValue;
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
							cellToHasRoads
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
