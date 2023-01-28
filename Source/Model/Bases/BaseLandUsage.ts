
class BaseLandUsage
{
	offsetsInUse: Coords[];

	_cellPos: Coords;
	_offset: Coords;
	_resourceProducedThisTurn: ResourceProduction;

	constructor(offsetsInUse: Coords[])
	{
		this.offsetsInUse = offsetsInUse || [];

		this._cellPos = Coords.create();
		this._offset = Coords.create();
		this._resourcesProducedThisTurn = ResourceProduction.create();
	}

	static default(): BaseLandUsage
	{
		return new BaseLandUsage(null);
	}

	static centerOffsetAndMapSizeToPos
	(
		center: Coords,
		offset: Coords,
		size: Coords,
		cellPos: Coords
	): Coords
	{
		return cellPos.overwriteWith
		(
			center
		).add
		(
			offset
		).wrapXToMax
		(
			size
		);
	}

	cellsInUseForBaseAndMap
	(
		base: Base,
		map: MapOfCells
	): MapOfCellCell[]
	{
		var basePos = base.pos;
		var cellPos = this._cellPos;
		var mapSizeInCells = map.sizeInCells
		var cellsInUse = this.offsetsInUse.map
		(
			offset => map.cellAtPosInCells
			(
				BaseLandUsage.centerOffsetAndMapSizeToPos
				(
					basePos, offset, mapSizeInCells, cellPos
				)
			)
		);
		return cellsInUse;
	}

	cellsUsableForBaseAndMap
	(
		base: Base,
		map: MapOfCells
	): MapOfCellsCell[]
	{
		var mapSizeInCells = map.sizeInCells;
		var cellPos = this._cellPos;
		var basePos = base.pos;
		var offsetsUsable = this.offsetsUsableForBaseAndMap(base, map);
		var cellsUsable = offsetsUsable.map
		(
			x => map.cellAtPosInCells
			(
				BaseLandUsage.centerOffsetAndMapSizeToPos
				(
					basePos, x, mapSizeInCells, cellPos
				)
			)
		);
		return cellsUsable;
	}

	buildImprovementsInAllCellsMagicallyForBaseAndWorld
	(
		base: Base, world: World
	): void
	{
		// This is a cheat, used only for testing.

		var cellsUsable = this.cellsUsableForBaseAndMap(base, world.map);
		var improvements = MapOfCellsCellImprovement.Instances();
		var terrains = MapOfCellsCellTerrain.Instances(); 
		cellsUsable.forEach(cell =>
		{
			if (cell.hasIrrigation() == false)
			{
				cell.improvementAdd(improvements.Irrigation);
			}
			if (cell.hasRoads() == false)
			{
				cell.improvementAdd(improvements.Roads);
			}

			var cellTerrain = cell.terrain(world);
			if
			(
				cellTerrain == terrains.Hills
				|| cellTerrain == terrains.Mountains
			)
			{
				if (cell.hasMines() == false)
				{
					cell.improvementAdd(improvements.Mines);
				}
			}
		});
	}

	isValid(): boolean
	{
		var isValidSoFar = true;

		for (var i = 0; i < this.offsetsInUse.length; i++)
		{
			var offsetI = this.offsetsInUse[i];

			for (var j = i + 1; j < this.offsetsInUse.length; j++)
			{
				var offsetJ = this.offsetsInUse[j];

				var areOffsetsEqual = offsetI.equals(offsetJ);
				if (areOffsetsEqual)
				{
					isValidSoFar = false;
					i = this.offsetsInUse.length;
					break;
				}
			}
		}

		return isValidSoFar;
	}

	offsetChooseOptimumFromAvailable
	(
		world: World, base: Base
	): void
	{
		var map = world.map;
		var mapSizeInCells = map.sizeInCells;

		var offsetValueMaxSoFar = 0;
		var offsetWithValueMaxSoFar = null;

		var offset = this._offset;
		var cellPos = this._cellPos;

		var offsetDimensionMax = this.offsetDimensionMax();

		for (var y = -offsetDimensionMax; y <= offsetDimensionMax; y++)
		{
			offset.y = y;

			for (var x = -offsetDimensionMax; x <= offsetDimensionMax; x++)
			{
				offset.x = x;

				var offsetAbsoluteSumOfDimensions =
					offset.clone().absolute().sumOfDimensions();
				var offsetIsInRange =
				(
					offsetAbsoluteSumOfDimensions > 0
					&& offsetAbsoluteSumOfDimensions < offsetDimensionMax * 2
				);

				var offsetIsInUse =
					this.offsetsInUse.some(x => x.equals(offset));

				var offsetIsAvailable =
					offsetIsInRange && (offsetIsInUse == false);

				if (offsetIsAvailable)
				{
					cellPos.overwriteWith(base.pos).add(offset);

					if (cellPos.isYInRangeMaxExclusive(mapSizeInCells))
					{
						cellPos.wrapXTrimYToMax(mapSizeInCells);
						var cellAtOffset = map.cellAtPosInCells(cellPos);
						var offsetValue = cellAtOffset.value(world, base);

						if (offsetValue > offsetValueMaxSoFar)
						{
							offsetValueMaxSoFar = offsetValue;
							offsetWithValueMaxSoFar = offset.clone();
						}
					}
				}
			}
		}

		if (offsetWithValueMaxSoFar == null)
		{
			// Perhaps because there's more people than land.
			base.laborerWorstReassignAsEntertainerForWorld(world);
		}
		else
		{
			this.offsetInUseAdd(offsetWithValueMaxSoFar);
		}

	}

	offsetDimensionMax(): number
	{
		return 2;
	}

	offsetInUseAdd(offset: number): void
	{
		this.offsetsInUse.push(offset);
	}

	offsetRemoveWorst(world: World, base: Base): void
	{
		var map = world.map;

		var offset = this._offset;
		var cellPos = this._cellPos;

		var offsetWithValueMinSoFar = this.offsetsInUse[1]; // Can't remove offset 0.
		cellPos.overwriteWith(base.pos).add(offsetWithValueMinSoFar);
		var cellAtOffset = map.cellAtPosInCells(cellPos);
		var offsetValueMinSoFar = cellAtOffset.value(world, base);

		for (var i = 2; i < this.offsetsInUse.length; i++)
		{
			cellPos.overwriteWith(base.pos).add(offset);
			var cellAtOffset = map.cellAtPosInCells(cellPos);
			var offsetValue = cellAtOffset.value(world, base);

			if (offsetValue < offsetValueMinSoFar)
			{
				offsetValueMinSoFar = offsetValue;
				offsetWithValueMinSoFar = offset;
			}
		}

		this.offsetsInUse.splice
		(
			this.offsetsInUse.indexOf(offsetWithValueMinSoFar),
			1 // numberToRemove
		)
	}

	offsetsUsableForBaseAndMap
	(
		base: Base, map: MapOfCells
	): Coords[]
	{
		var basePos = base.pos;
		var mapSizeInCells = map.sizeInCells;
		var cellPos = this._cellPos;

		var offsetsUsable = [];

		var offset = Coords.create();

		var distanceMax = this.offsetDimensionMax();

		for (var y = -distanceMax; y <= distanceMax; y++)
		{
			offset.y = y;

			for (var x = -distanceMax; x <= distanceMax; x++)
			{
				offset.x = x;

				var offsetAbsoluteSumOfDimensions =
					offset.clone().absolute().sumOfDimensions();
				var offsetIsInRange =
				(
					offsetAbsoluteSumOfDimensions > 0
					&& offsetAbsoluteSumOfDimensions < distanceMax + distanceMax
				);

				if (offsetIsInRange)
				{
					BaseLandUsage.centerOffsetAndMapSizeToPos
					(
						basePos, offset, mapSizeInCells, cellPos
					);
					
					if (cellPos.isInRangeMaxExclusive(mapSizeInCells))
					{
						offsetsUsable.push(offset.clone());
					}
				}
			}
		}

		return offsetsUsable;
	}

	optimize(world: World, base: Base): void
	{
		// todo - This isn't very efficient.

		this.offsetsInUse.length = 0;

		var offset = this._offset.clear(); // The center is always in use.
		this.offsetInUseAdd(offset.clone());

		for (var p = 0; p < base.population(); p++)
		{
			this.offsetChooseOptimumFromAvailable(world, base);
		}

		return this;
	}

	resourcesProducedThisTurn(world: World, base: Base): void
	{
		var resourcesProducedThisTurn =
			this._resourcesProducedThisTurn.clear();

		var basePos = base.pos;
		var map = world.map;
		var cellsInUse = this.cellsInUseForBaseAndMap(base, map);
		var resourcesProducedByCells =
			cellsInUse.map(x => x.resourcesProduced(world, base) );
		resourcesProducedByCells.forEach
		(
			x => resourcesProducedThisTurn.add(x)
		);

		return resourcesProducedThisTurn;
	}

	toString(): string
	{
		var returnValue =
			"Land Usage: "
			+ this.offsetsInUse.map(x => x.toString()).join(";");

		return returnValue;
	}

	toStringVisualForWorldAndBase
	(
		world: World, base: Base
	): string
	{
		// For debugging.

		var map = world.map;

		var territoryAsLines = [];

		var offset = Coords.create();

		var distanceMax = this.offsetDimensionMax();
		var territoryDiameterInCells = distanceMax * 2 + 1;
		var cellSizeInChars = Coords.fromXY(14, 6);
		var territorySizeInChars = cellSizeInChars.clone().multiplyScalar
		(
			territoryDiameterInCells
		);
		var cellPosInCellsFromUpperLeft = Coords.create();
		var cellPosInChars = Coords.create();
		var cellPosInCells = Coords.create();

		for (var y = -distanceMax; y <= distanceMax; y++)
		{
			offset.y = y;
			cellPosInCellsFromUpperLeft.y = offset.y + distanceMax;

			for (var x = -distanceMax; x <= distanceMax; x++)
			{
				offset.x = x;
				cellPosInCellsFromUpperLeft.x = offset.x + distanceMax;

				this.toStringVisualForWorldAndBase_Cell
				(
					world,
					base,
					offset,
					distanceMax,
					cellPosInChars,
					cellPosInCellsFromUpperLeft,
					cellSizeInChars,
					cellPosInCells,
					territoryAsLines
				);
			}
		}

		var territoryAsString = territoryAsLines.join("\n");

		return territoryAsString;
	}
	
	toStringVisualForWorldAndBase_Cell
	(
		world: World,
		base: Base,
		offset: Coords,
		distanceMax: number,
		cellPosInChars: Coords,
		cellPosInCellsFromUpperLeft: Coords,
		cellSizeInChars: Coords,
		cellPosInCells: Coords,
		territoryAsLines: string[]
	)
	{
		var offsetAbsoluteSumOfDimensions =
			offset.clone().absolute().sumOfDimensions();
		var offsetIsInRange =
		(
			offsetAbsoluteSumOfDimensions < distanceMax * 2
		);

		cellPosInChars.overwriteWith
		(
			cellPosInCellsFromUpperLeft
		).multiply
		(
			cellSizeInChars
		);

		var cellAsLines = [];

		if
		(
			offsetIsInRange == false
			&& Math.abs(offset.x) == distanceMax
		)
		{
			cellAsLines.push(
				"".padEnd(cellSizeInChars.x, " ")
			);

			for (var i = 0; i < cellSizeInChars.y - 1; i++)
			{
				cellAsLines.push
				(
					"".padEnd(cellSizeInChars.x, " ")
				);
			}
		}
		else
		{
			var map = world.map;
			var mapSizeInCells = map.sizeInCells;

			BaseLandUsage.centerOffsetAndMapSizeToPos
			(
				base.pos, offset, mapSizeInCells, cellPosInCells
			);

			if (cellPosInCells.isInRangeMaxExclusive(mapSizeInCells))
			{
				var horizontalBorder =
					"+".padEnd(cellSizeInChars.x, "-") + "+";
				cellAsLines.push(horizontalBorder);

				var cell = map.cellAtPosInCells(cellPosInCells);
				var cellTerrainCode = cell.terrainCode;
				var cellTerrain = cell.terrain(world);
				var cellTerrainName = cellTerrain.name;
				var cellTerrainAsString =
					cellTerrainName
					+ " (" + cellTerrainCode + ")"

				cellAsLines.push
				(
					"|" + cellTerrainAsString.padEnd(cellSizeInChars.x - 1, " ") + "|"
				);

				var riverIndicator = (cell.hasRiver() ? "River" : "");
				var resourceSpecialPresent = cell.resourceSpecialPresent();
				var resourceSpecialPresentName =
				(
					resourceSpecialPresent == null
					? ""
					: resourceSpecialPresent.name
				);
				var cellTerrainFeaturesAsString =
					resourceSpecialPresentName
					+ " " + riverIndicator;

				cellAsLines.push
				(
					"|" + cellTerrainFeaturesAsString.padEnd(cellSizeInChars.x - 1, " ") + "|"
				);

				var cellImprovements =
					(cell.hasRailroads() ? "RRs " : (cell.hasRoads() ? "Rds " : ""))
					+ (cell.hasFarmland() ? "Frm " : (cell.hasIrrigation() ? "Irr " : ""));
					+ (cell.hasFortress() ? "Frt" : "");
				cellAsLines.push
				(
					"|" + cellImprovements.padEnd(cellSizeInChars.x - 1, " ") + "|"
				);

				var cellResourcesProduced = cell.resourcesProduced(world, base);
				var food = cellResourcesProduced.food;
				var industry = cellResourcesProduced.industry;
				var trade = cellResourcesProduced.trade;
				var resourcesProduced =
					(food > 0 ? "f" + food + " " : "")
					+ (industry > 0 ? "i" + industry + " " : "")
					+ (trade > 0 ? "t" + trade + " " : "");

				cellAsLines.push
				(
					"|" + resourcesProduced.padEnd(cellSizeInChars.x - 1, " ") + "|"
				);

				var cellIsInUse = this.offsetsInUse.some(x => x.equals(offset));
				var isInUseFlag = (cellIsInUse ? "In Use" : "");
				cellAsLines.push
				(
					"|" + isInUseFlag.padEnd(cellSizeInChars.x - 1, " ") + "|"
				);

				cellAsLines.push
				(
					"|".padEnd(cellSizeInChars.x, " ") + "|"
				);
			}

		}

		StringHelper.copyStringsIntoStringsAtPos
		(
			cellAsLines, territoryAsLines, cellPosInChars
		);
	}

	turnUpdate(world: World, base: Base): void
	{
		// todo
	}
}
