
class UnitDefnMovement
{
	_costToMoveFromCellToCellInThirds: any;

	moveThirdsPerTurn: number;
	static _mapCellGround: MapOfCellsCell

	constructor
	(
		movesPerTurn: number,
		costToMoveFromCellToCellInThirds: any
	)
	{
		this.moveThirdsPerTurn = movesPerTurn * 3;
		this._costToMoveFromCellToCellInThirds =
			costToMoveFromCellToCellInThirds;
	}

	static mapCellGround(): any
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

	costToMoveFromCellToCellInThirds
	(
		world: World,
		unitMoving: Unit,
		cellFrom: MapOfCellsCell,
		cellTo: MapOfCellsCell
	): number
	{
		return this._costToMoveFromCellToCellInThirds
		(
			world, unitMoving, cellFrom, cellTo
		);
	}

	isGround(world: World, unit: Unit): boolean
	{
		var mapCell = UnitDefnMovement.mapCellGround();
		var costToMove = this._costToMoveFromCellToCellInThirds
		(
			world, unit, mapCell, mapCell
		);
		var returnValue = (costToMove < Number.POSITIVE_INFINITY);
		return returnValue;
	}

	movesPerTurn(): number
	{
		return this.moveThirdsPerTurn / 3;
	}

	static air(movesPerTurn: number): UnitDefnMovement
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(
				world: World,
				unitMoving: Unit,
				cellFrom: MapOfCellsCell,
				cellTo: MapOfCellsCell
			) => // cost
			{
				return 3;
			}
		);
	}

	static ground(movesPerTurn: number): UnitDefnMovement
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(
				world: World,
				unitMoving: Unit,
				cellFrom: MapOfCellsCell,
				cellTo: MapOfCellsCell
			) => // cost
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
					var unitMovingOwner = unitMoving.owner(world);
					var isNonAlliedUnitPresent =
						cellTo.unitNotAlliedWithOwnerIsPresent(unitMovingOwner, world);
					if (isNonAlliedUnitPresent)
					{
						var unitsPresentNonAllied =
							cellTo.unitsPresentNotAlliedWithOwner(unitMovingOwner, world);
						var unitNonAlliedFirst = unitsPresentNonAllied[0];
						var unitNonAlliedOwner = unitNonAlliedFirst.owner(world);
						var isUnitNonAlliedAnEnemy =
							unitMovingOwner.ownerIsAttackable(unitNonAlliedOwner);
						if (isUnitNonAlliedAnEnemy)
						{
							costToMoveInThirds = 3;
						}
						else if (unitMoving.hasActionsToSelectFromOnAttack(world))
						{
							costToMoveInThirds = 3; // todo
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

	static ocean(movesPerTurn: number): UnitDefnMovement
	{
		return new UnitDefnMovement
		(
			movesPerTurn,
			(
				world: World,
				unitMoving: Unit,
				cellFrom: MapOfCellsCell,
				cellTo: MapOfCellsCell
			) => // cost
			{
				var cellToTerrain = cellTo.terrain(world);
				var cellToTerrainIsOceanOrBase =
				(
					cellToTerrain.name == "Ocean"
					|| cellTo.hasBase()
				);
				var costToMove = (cellToTerrainIsOceanOrBase ? 1 : Number.POSITIVE_INFINITY);
				var costToMoveInThirds = costToMove *= 3;
				return costToMoveInThirds;
			}
		);
	}
}
