
class MapOfCells
{
	sizeInCells: Coords;
	cells: MapOfCellsCell;

	constructor(sizeInCells: Coords, cells: MapOfCellsCell)
	{
		this.sizeInCells = sizeInCells;
		this.cells = cells;
	}

	static fromCellsAsStringGroups
	(
		cellsAsStringGroups: string[][]
	): MapOfCells
	{
		var cellsAsStrings = cellsAsStringGroups[0];
		var sizeInCells = new Coords
		(
			cellsAsStrings[0].length, cellsAsStrings.length, 1
		);
		var cells = [];

		var cellPosInCells = Coords.create();

		for (var y = 0; y < sizeInCells.y; y++)
		{
			cellPosInCells.y = y;

			for (var x = 0; x < sizeInCells.x; x++)
			{
				cellPosInCells.x = x;

				var cellCodes =
					cellsAsStringGroups.map(cellsAsStrings => cellsAsStrings[y][x]);

				var cell = MapOfCellsCell.fromPosAndCodes
				(
					cellPosInCells.clone(),
					cellCodes
				);

				cells.push(cell);
			}
		}

		var map = new MapOfCells(sizeInCells, cells);

		return map;
	}

	cellAtPosInCells(posInCells: Coords): MapOfCellsCell
	{
		return this.cells[this.cellIndexAtPos(posInCells)];
	}

	cellIndexAtPos(posInCells: Coords): MapOfCellsCell
	{
		return posInCells.y * this.sizeInCells.x + posInCells.x;
	}

	cellIndexToPosInCells(cellIndex: number, cellPosInCells: Coords): Coords
	{
		cellPosInCells.overwriteWithDimensions
		(
			cellIndex % this.sizeInCells.x,
			Math.floor(cellIndex / this.sizeInCells.x),
			0
		);
	}

	cellsWithPollutionCount(): number
	{
		var cellsWithPollutionCountSoFar = 0;
		this.cells.forEach
		(
			x => cellsWithPollutionCountSoFar += (x.hasPollution ? 1 : 0)
		);
		return cellsWithPollutionCountSoFar;
	}

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;
		var owner = world.ownerCurrent();
		var camera = owner.camera;

		var cellPosInCells = Coords.create();
		var cellSizeInPixels = Coords.ones().multiplyScalar(16); // hack
		var cellPosInPixels = Coords.create();

		var cameraCornerPositions =
			camera.cornerPositionsClockwiseFromLowerRight();
		var cellPosBounds = Coords.create().boundsOf(cameraCornerPositions);
		var cellPosMin = cellPosBounds.min;
		var cellPosMax = cellPosBounds.max;

		for (var y = cellPosMin.x; y <= cellPosMax.y; y++)
		{
			cellPosInCells.y = y;

			for (var x = cellPosMin.x; x <= cellPosMax.x; x++)
			{
				cellPosInCells.x = x;

				camera.coordsTransformWorldToView
				(
					cellPosInPixels.overwriteWith
					(
						cellPosInCells
					).multiply
					(
						cellSizeInPixels
					)
				);

				var cell = this.cellAtPosInCells(cellPosInCells);
				var cellTerrain = cell.terrain(world);
				var cellTerrainSymbol = cellTerrain.symbol;
				var cellTerrainColorName = cellTerrain.colorName;

				display.drawRectangle
				(
					cellPosInPixels, cellSizeInPixels, cellTerrainColorName, "Gray"
				);
			}
		}
	}
}