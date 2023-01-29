
class Unit
{
	ownerName: string;
	defnName: string;
	pos: Coords;

	id: number;
	baseSupportingId: number;
	integrity: number;

	_activity: UnitActivity;
	_moveThirdsThisTurn: number;
	_isSleeping: boolean;
	_cellToPos: Coords;

	constructor
	(
		ownerName: string,
		defnName: string,
		pos: Coords
	)
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

	baseSupporting(world: World): Base
	{
		return world.baseById(this.baseSupportingId);
	}

	baseSupportingSet(base: Base): void
	{
		this.baseSupportingId = base.id;
		base.unitSupport(this);
	}

	category(): SelectableCategory
	{
		return SelectableCategory.Instances().Units;
	}

	defn(world: World): UnitDefn
	{
		return world.defns.unitDefnByName(this.defnName);
	}

	fortify(): void
	{
		// todo
	}

	isAwake(): boolean
	{
		return (this.isSleeping() == false);
	}

	isIdle(): boolean
	{
		return (this.hasMovesThisTurn() && this.isAwake());
	}

	isSleeping(): boolean
	{
		return this._isSleeping;
	}

	initialize(world: World): void
	{
		this.turnUpdate(world);
	}

	isInBaseSupporting(world: World): boolean
	{
		return this.baseSupporting(world).pos.equals(this.pos);
	}

	owner(world: World): Owner
	{
		return world.ownerByName(this.ownerName);
	}

	ownerSet(owner: Owner): void
	{
		this.ownerName = owner.name;
	}

	select(world: World): void
	{
		var owner = this.owner(world);
		owner.unitSelect(this);
	}

	sleep(world: World): void
	{
		var activityDefns = UnitActivityDefn.Instances();
		this.activityDefnStartForWorld(activityDefns.Sleep, world);
	}

	toStringDetails(world: World): string
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

	toStringForList(): string
	{
		return this.id + ": " + this.defnName + " @" + this.pos.toString();
	}

	turnUpdate(world: World): void
	{
		var defn = this.defn(world);
		this.moveThirdsThisTurnSet(defn.movement.moveThirdsPerTurn);
		this.activityUpdate(null, world);
	}

	// Activity.

	actionPromptForSelection(world: World): void
	{
		var activityMove = this.activity();
		var activityDefnActionSelect = UnitActivityDefn.Instances().ActionSelect;
		this.activityDefnStartForWorldWithVariables
		(
			activityDefnActionSelect, world, activityMove.variableValuesByName
		);
	}

	actionSelect(actionToSelect: any, world: World): void
	{
		var activityPromptForSelection = this.activity();
		this.activityDefnStartForWorldWithVariables
		(
			actionToSelect, world, activityPromptForSelection.variableValuesByName
		);
	}

	actionSelectDiplomatBribeUnit(world: World): any
	{
		this.actionSelect(UnitActivityDefn.Instances().DiplomatBribeUnit, world);
	}

	activity(): UnitActivity
	{
		return this._activity;
	}

	activityClear(): void
	{
		this.activitySet(null);
	}

	activityDefnStart(activityDefn: UnitActivityDefn): void
	{
		this.activityDefnStartForWorld(activityDefn, null);
	}

	activityDefnStartForWorld
	(
		activityDefn: UnitActivityDefn, world: World
	): void
	{
		this.activityDefnStartForWorldWithVariables(activityDefn, world, null);
	}

	activityDefnStartForWorldWithDirection
	(
		activityDefn: UnitActivityDefn, world: World, direction: Direction
	): void
	{
		this.activityDefnStartForWorldWithVariableNameAndValue
		(
			activityDefn, world,
			UnitActivityVariableNames.Direction(), direction
		);
	}

	activityDefnStartForWorldWithVariableNameAndValue
	(
		activityDefn: UnitActivityDefn,
		world: World,
		variableName: string,
		variableValue: any
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
		activityDefn: UnitActivityDefn,
		world: World,
		variableValuesByName: Map<string, any>
	)
	{
		var activity = new UnitActivity
		(
			activityDefn.name, variableValuesByName
		);
		this.activitySet(activity);
		this.activityUpdate(null, world);
	}

	activitySet(value: UnitActivity): void
	{
		this._activity = value;
	}

	activityUpdate(universe: Universe, world: World): void
	{
		if (this._activity != null)
		{
			var owner = this.owner(world);
			this._activity.perform(universe, world, owner, this);
		}
	}

	hasActionsToSelectFromOnAttack(world: World): boolean
	{
		var unitDefns = UnitDefn.Instances();
		var unitDefn = this.defn(world);
		var hasActions =
		(
			unitDefn == unitDefns.Diplomat
			|| unitDefn == unitDefns.Spy
		);
		return hasActions;
	}

	isWaitingForActionSelection(): boolean
	{
		var activity = this.activity();
		var activityDefn = activity.defn();
		var isWaiting = (activityDefn == UnitActivityDefn.Instances().ActionSelect);
		return isWaiting;
	}

	// Combat.

	attackUnit(unitDefender: Unit, world: World): void
	{
		var attackerDefnCombat = this.defn(world).combat;
		var defenderDefnCombat = unitDefender.defn(world).combat;

		var attackStrength = this.attackStrength(world);
		var defenseStrength = unitDefender.defenseStrength(world);

		var sumOfStrengths = attackStrength + defenseStrength;
		var attackRoll = Math.random() * sumOfStrengths;
		if (attackRoll <= attackStrength)
		{
			var damageInflicted = attackerDefnCombat.damagePerHit;
			unitDefender.integritySubtractDamage(damageInflicted, world);
		}
		else
		{
			var damageInflicted = defenderDefnCombat.damagePerHit;
			this.integritySubtractDamage(damageInflicted, world);
		}
	}

	attackStrength(world: World): number
	{
		var defn = this.defn(world)
		var returnValue = defn.combat.attackStrength;
		// todo - Bonus for veteran status.
		return returnValue;
	}

	defenseStrength(world: World): number
	{
		var defn = this.defn(world);
		var returnValue = defn.combat.attackStrength;
		// todo - Bonuses for fortification, improvements.
		return returnValue;
	}

	integritySubtractDamage(damage: number, world: World): void
	{
		this.defn(world).combat.integritySubtractDamageFromUnit(damage, this);
	}

	isMilitary(world: World): boolean
	{
		return (this.defn(world).combat.attackStrength > 0);
	}

	// Movement.

	canCarryPassengers(world: World): boolean
	{
		return (this.defn(world).passengersMax > 0);
	}

	canMoveInDirection(directionToMove: Direction, world: World): boolean
	{
		var costToMoveInThirds =
			this.costToMoveInDirection(directionToMove, world);
		var canMove = (costToMoveInThirds <= this.movesThisTurn());
		return canMove;
	}

	canMoveInDirectionEast(world: World) { return this.canMoveInDirection(Direction.Instances().East, world); }
	canMoveInDirectionNorth(world: World) { return this.canMoveInDirection(Direction.Instances().North, world); }
	canMoveInDirectionNortheast(world: World) { return this.canMoveInDirection(Direction.Instances().Northeast, world); }
	canMoveInDirectionNorthwest(world: World) { return this.canMoveInDirection(Direction.Instances().Northwest, world); }
	canMoveInDirectionSouth(world: World) { return this.canMoveInDirection(Direction.Instances().South, world); }
	canMoveInDirectionSoutheast(world: World) { return this.canMoveInDirection(Direction.Instances().Southeast, world); }
	canMoveInDirectionSouthwest(world: World) { return this.canMoveInDirection(Direction.Instances().Southwest, world); }
	canMoveInDirectionWest(world: World) { return this.canMoveInDirection(Direction.Instances().West, world); }

	cellsFromAndToForDirectionAndWorld
	(
		directionToMove: Direction, world: World
	)
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

	costToMoveInDirection
	(
		directionToMove: Direction, world: World
	): number
	{
		return this.costToMoveInDirectionInThirds(directionToMove, world) / 3;
	}

	costToMoveInDirectionInThirds
	(
		directionToMove: Direction, world: World
	): number
	{
		var cellsFromAndTo = this.cellsFromAndToForDirectionAndWorld
		(
			directionToMove, world
		);
		var cellFrom = cellsFromAndTo[0];
		var cellTo = cellsFromAndTo[1];

		var defn = this.defn(world);

		var costToMoveInThirds = defn.movement.costToMoveFromCellToCellInThirds
		(
			world, this, cellFrom, cellTo
		);

		return costToMoveInThirds;
	}

	hasMovesThisTurn(): boolean
	{
		return (this.moveThirdsThisTurn() > 0);
	}

	isGround(world: World): boolean
	{
		return this.defn(world).isGround(world, this);
	}

	moveInDirection(directionToMove: Direction, world: World): void
	{
		var activityDefns = UnitActivityDefn.Instances();
		var variableNameDirection = UnitActivityVariableNames.Direction();
		this.activityDefnStartForWorldWithVariableNameAndValue
		(
			activityDefns.Move,
			world,
			variableNameDirection,
			directionToMove
		);
	}

	moveInDirectionEast(world: World) { this.moveInDirection(Direction.Instances().East, world); }
	moveInDirectionNorth(world: World) { this.moveInDirection(Direction.Instances().North, world); }
	moveInDirectionNortheast(world: World) { this.moveInDirection(Direction.Instances().Northeast, world); }
	moveInDirectionNorthwest(world: World) { this.moveInDirection(Direction.Instances().Northwest, world); }
	moveInDirectionSouth(world: World) { this.moveInDirection(Direction.Instances().South, world); }
	moveInDirectionSoutheast(world: World) { this.moveInDirection(Direction.Instances().Southeast, world); }
	moveInDirectionSouthwest(world: World) { this.moveInDirection(Direction.Instances().Southwest, world); }
	moveInDirectionWest(world: World) { this.moveInDirection(Direction.Instances().West, world); }

	moveStartTowardPosInWorld(targetPos: Coords, world: World): void
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

	moveThirdsThisTurn(): number
	{
		return this._moveThirdsThisTurn;
	}

	moveThirdsThisTurnSet(value: number): void
	{
		this._moveThirdsThisTurn = value;
	}

	movesThisTurn(): number
	{
		return this.moveThirdsThisTurn() / 3;
	}

	movesThisTurnClear(): void
	{
		this.moveThirdsThisTurnSet(0);
	}

	ownerMapKnowledgeUpdate(world: World): void
	{
		var owner = this.owner(world);
		var ownerMapKnowledge = owner.mapKnowledge;
		ownerMapKnowledge.update(null, world, owner);
	}
}



