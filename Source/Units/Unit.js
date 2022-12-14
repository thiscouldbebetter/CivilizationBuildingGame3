
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
		this._isSleeping = false;

		this._cellToPos = Coords.create();
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

	integritySubtractDamage(damage, world)
	{
		this.defn(world).combat.integritySubtractDamageFromUnit(damage, this);
	}

	isAwake()
	{
		return (this.isSleeping() == false);
	}

	isIdle()
	{
		return (this.hasMovesThisTurn() && this.isAwake());
	}

	isMilitary(world)
	{
		return (this.defn(world).combat.attack > 0);
	}

	isSleeping()
	{
		return this._isSleeping;
	}

	initialize(world)
	{
		this.turnUpdate(world);
	}

	isInBaseSupporting(world)
	{
		return this.baseSupporting(world).pos.equals(this.pos);
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

	// Activity.

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

	// Movement.

	attackDefender(defender, world)
	{
		var defn = this.defn(world);
		defn.unitAttackDefender(this, defender);
	}

	canCarryPassengers(world)
	{
		return (this.defn(world).passengersMax > 0);
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

	hasMovesThisTurn()
	{
		return (this.moveThirdsThisTurn() > 0);
	}

	isGround(world)
	{
		return this.defn(world).isGround(world);
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

	movesThisTurn()
	{
		return this.moveThirdsThisTurn() / 3;
	}

	movesThisTurnClear()
	{
		this.moveThirdsThisTurnSet(0);
	}

	ownerMapKnowledgeUpdate(world)
	{
		var owner = this.owner(world);
		var ownerMapKnowledge = owner.mapKnowledge;
		ownerMapKnowledge.update(null, world, owner);
	}
}



