
class MapOfCells
{
	sizeInCells: Coords;
	cells: MapOfCellsCell[];

	constructor(sizeInCells: Coords, cells: MapOfCellsCell[])
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
		var cells = new Array<MapOfCellsCell>();

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
		var cellIndex = this.cellIndexAtPos(posInCells);
		return this.cells[cellIndex];
	}

	cellIndexAtPos(posInCells: Coords): number
	{
		return posInCells.y * this.sizeInCells.x + posInCells.x;
	}

	cellIndexToPosInCells
	(
		cellIndex: number, cellPosInCells: Coords
	): Coords
	{
		return cellPosInCells.overwriteWithDimensions
		(
			cellIndex % this.sizeInCells.x,
			Math.floor(cellIndex / this.sizeInCells.x),
			0
		);
	}

	cellsNeighboringCellAtPosInCells
	(
		cellPosInCells: Coords
	): MapOfCellsCell[]
	{
		var cellsNeighboring = new Array<MapOfCellsCell>();

		var cellPos = Coords.create();

		for (var y = -1; y <= 1; y++)
		{
			cellPos.y = y;

			for (var x = -1; x <= 1; x++)
			{
				cellPos.x = x;

				var cell = this.cellAtPosInCells(cellPos);
				if (cell != null)
				{
					cellsNeighboring.push(cell);
				}
			}
		}

		return cellsNeighboring;
	}

	cellsWithPollutionCount(): number
	{
		var cellsWithPollutionCountSoFar = 0;
		this.cells.forEach
		(
			(x: MapOfCellsCell) =>
				cellsWithPollutionCountSoFar += (x.hasPollution ? 1 : 0)
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
			camera.viewCornersClockwiseFromLowerRight();
		var cellPosBounds =
			Bounds.ofPoints(cameraCornerPositions);
		var cellPosMin = cellPosBounds.min;
		var cellPosMax = cellPosBounds.max;

		for (var y = cellPosMin.x; y <= cellPosMax.y; y++)
		{
			cellPosInCells.y = y;

			for (var x = cellPosMin.x; x <= cellPosMax.x; x++)
			{
				cellPosInCells.x = x;

				camera.coordsTransformFromWorldToView
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
				var cellTerrainColorName = cellTerrain.colorName;

				display.drawRectangle
				(
					cellPosInPixels, cellSizeInPixels, cellTerrainColorName, "Gray"
				);
			}
		}
	}

	toString(): string
	{
		var lines = [];

		var cellPosInCells = Coords.create();

		for (var y = 0; y < this.sizeInCells.y; y++)
		{
			cellPosInCells.y = y;

			var line = "";
			for (var x = 0; x < this.sizeInCells.x; x++)
			{
				cellPosInCells.x = x;

				var cell = this.cellAtPosInCells(cellPosInCells);
				var terrainCode = cell.terrainCode;
				line += terrainCode;
			}

			lines.push(line);
		}

		var returnValue = lines.join("\n");

		return returnValue;
	}
}