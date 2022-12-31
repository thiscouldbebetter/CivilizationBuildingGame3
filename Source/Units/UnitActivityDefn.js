
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
