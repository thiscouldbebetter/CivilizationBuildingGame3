
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
