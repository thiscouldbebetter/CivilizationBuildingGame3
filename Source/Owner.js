
class Owner
{
	constructor
	(
		name,
		colorName,
		incomeAllocation,
		research,
		mapKnowledge,
		bases,
		units
	)
	{
		this.name = name;
		this.colorName = colorName;
		this.incomeAllocation = incomeAllocation;
		this.research = research;
		this.mapKnowledge = mapKnowledge;
		this.bases = bases;
		this.units = units;

		this.selection = new OwnerSelection();
	}

	initialize(world)
	{
		this.bases.forEach(x => x.initialize(world) );
		this.units.forEach(x => x.initialize(world) );

		this.unitSelectNextWithMoves();
	}

	turnAdvance(world)
	{
		this.bases.forEach(x => x.turnAdvance(world) );
		this.units.forEach(x => x.turnAdvance(world) );

		this.unitSelectNextWithMoves();
	}

	// Selection.

	baseSelectNextIdle()
	{
		return this.selection.baseSelectNextIdle(this);
	}

	baseSelected()
	{
		return this.selection.baseSelected(this);
	}

	unitSelectById(idToSelect)
	{
		return this.selection.unitSelectById(this, idSelect);
	}

	unitSelectNextWithMoves()
	{
		return this.selection.unitSelectNextWithMoves(this);
	}

	unitSelected()
	{
		return this.selection.unitSelected(this);
	}

}

class OwnerIncomeAllocation
{
	constructor(upkeepFraction, researchFraction, luxuriesFraction)
	{
		this.upkeepFraction = upkeepFraction;
		this.researchFraction = researchFraction;
		this.luxuriesFraction = luxuriesFraction;
	}

	static default()
	{
		return new OwnerIncomeAllocation(.5, .5, 0);
	}

	isValid()
	{
		var sumOfFractions =
			this.upkeepFraction
			+ this.researchFraction
			+ this.luxuriesFraction;

		return (sumOfFractions == 1);
	}
}

class OwnerMapKnowledge
{
	constructor(cellsKnownIndices)
	{
		cellsKnownIndices = cellsKnownIndices || [];
		this.cellsKnownIndicesByIndex =
			new Map(cellsKnownIndices.map(x => [x, x]));
		this.cellsVisibleIndicesByIndex = new Map();
	}

	static default()
	{
		return new OwnerMapKnowledge(null);
	}

	draw(universe, world, owner)
	{
		var mapComplete = world.map;
		var mapSizeInCells = mapComplete.sizeInCells;
		var cellSizeInPixels = Coords.ones().multiplyScalar(16);
		var cellSizeInPixelsHalf = cellSizeInPixels.clone().half();
		var cellPosInCells = Coords.create();
		var cellPosInPixels = Coords.create();

		var mapSizeInPixels = mapSizeInCells.clone().multiply(cellSizeInPixels);
		var display = universe.display;
		display.drawBackground("Black");

		this.draw_1_CellsKnown
		(
			cellPosInCells,
			mapSizeInCells,
			mapComplete,
			cellPosInPixels,
			cellSizeInPixels,
			world,
			display
		);

		var basesAndUnitsVisible = this.draw_2_CellsVisible
		(
			cellPosInCells,
			mapSizeInCells,
			mapComplete,
			cellPosInPixels,
			cellSizeInPixels,
			world,
			display
		);

		var cellSizeInPixelsHalf = cellSizeInPixels.clone().half();
		var cellCenterInPixels = Coords.create();

		var basesVisible = basesAndUnitsVisible[0];
		this.draw_3_BasesVisible
		(
			owner,
			basesVisible,
			cellPosInPixels,
			cellSizeInPixels,
			cellCenterInPixels,
			cellSizeInPixelsHalf,
			world,
			display
		);

		var unitsVisible = basesAndUnitsVisible[1];
		this.draw_4_UnitsVisible
		(
			owner,
			unitsVisible,
			cellPosInPixels,
			cellSizeInPixels,
			cellCenterInPixels,
			cellSizeInPixelsHalf,
			world,
			display
		);
	}

	draw_1_CellsKnown
	(
		cellPosInCells,
		mapSizeInCells,
		mapComplete,
		cellPosInPixels,
		cellSizeInPixels,
		world,
		display
	)
	{
		var cellsKnownIndices = Array.from(this.cellsKnownIndicesByIndex.keys());
		for (var c = 0; c < cellsKnownIndices.length; c++)
		{
			var cellIndex = cellsKnownIndices[c];
			cellPosInCells.overwriteWithXY
			(
				cellIndex % mapSizeInCells.x,
				Math.floor(cellIndex / mapSizeInCells.x)
			);
			var cell = mapComplete.cellAtPosInCells(cellPosInCells);
			cellPosInPixels.overwriteWith
			(
				cellPosInCells
			).multiply
			(
				cellSizeInPixels
			);

			var terrain = cell.terrain(world);
			var terrainColorName = terrain.colorName;

			display.drawRectangle
			(
				cellPosInPixels, cellSizeInPixels, terrainColorName, "Gray"
			);

			var isCellCurrentlyVisible =
				this.cellsVisibleIndicesByIndex.has(cellIndex);
			if (isCellCurrentlyVisible == false)
			{
				display.drawRectangle(cellPosInPixels, cellSizeInPixels, "rgba(0, 0, 0, 0.5)", null);
			}
		}
	}

	draw_2_CellsVisible
	(
		cellPosInCells,
		mapSizeInCells,
		mapComplete,
		cellPosInPixels,
		cellSizeInPixels,
		world,
		display
	)
	{
		var basesVisible = [];
		var unitsVisible = [];

		var cellsVisibleIndices = Array.from(this.cellsVisibleIndicesByIndex.keys());
		for (var c = 0; c < cellsVisibleIndices.length; c++)
		{
			var cellIndex = cellsVisibleIndices[c];
			cellPosInCells.overwriteWithXY
			(
				cellIndex % mapSizeInCells.x,
				Math.floor(cellIndex / mapSizeInCells.x)
			);
			var cell = mapComplete.cellAtPosInCells(cellPosInCells);
			cellPosInPixels.overwriteWith
			(
				cellPosInCells
			).multiply
			(
				cellSizeInPixels
			);

			var basePresent = cell.basePresent(world);
			if (basePresent != null)
			{
				basesVisible.push(basePresent);
			}

			var unitsPresent = cell.unitsPresent(world);
			unitsVisible.push(...unitsPresent);
		}

		var basesAndUnitsVisible = [ basesVisible, unitsVisible];

		return basesAndUnitsVisible;
	}

	draw_3_BasesVisible
	(
		owner,
		basesVisible,
		cellPosInPixels,
		cellSizeInPixels,
		cellCenterInPixels,
		cellSizeInPixelsHalf,
		world,
		display
	)
	{
		var baseSelected = owner.baseSelected();

		basesVisible.forEach(base =>
		{
			cellPosInPixels.overwriteWith
			(
				base.pos
			).multiply
			(
				cellSizeInPixels
			);

			cellCenterInPixels.overwriteWith
			(
				cellPosInPixels
			).add
			(
				cellSizeInPixelsHalf
			);

			var baseOwner = base.owner(world);
			var baseColorName = baseOwner.colorName;
			var isSelected = (base == baseSelected);
			var borderColor = (isSelected ? "White" : "Gray");

			display.drawRectangle
			(
				cellPosInPixels, cellSizeInPixels,
				basePresentColorName, borderColor
			);
			display.drawText
			(
				basePresent.name, cellCenterInPixels, borderColor
			);
		});
	}

	draw_4_UnitsVisible
	(
		owner,
		unitsVisible,
		cellPosInPixels,
		cellSizeInPixels,
		cellCenterInPixels,
		cellSizeInPixelsHalf,
		world,
		display
	)
	{
		var cellRadiusInPixels = cellSizeInPixelsHalf.x;

		var unitSelected = owner.unitSelected();
		unitsVisible.forEach(unit =>
		{
			cellPosInPixels.overwriteWith
			(
				unit.pos
			).multiply
			(
				cellSizeInPixels
			);

			cellCenterInPixels.overwriteWith
			(
				cellPosInPixels
			).add
			(
				cellSizeInPixelsHalf
			);

			var unitDefn = unit.defn(world);
			var unitSymbol = unitDefn.symbol;
			var unitOwner = unit.owner(world);
			var unitOwnerColorName = unitOwner.colorName;

			var isSelected = (unit == unitSelected);
			var borderColor = (isSelected ? "White" : "Gray");
			display.drawCircle
			(
				cellCenterInPixels, cellRadiusInPixels,
				unitOwnerColorName, borderColor
			);
			display.drawText(unitSymbol, cellCenterInPixels, borderColor);
		});
	}

	update(universe, world, owner)
	{
		this.cellsVisibleIndicesByIndex = new Map();

		var mapSizeInCells = world.map.sizeInCells;
		var cellOffsetPos = Coords.create();

		var ownerBases = owner.bases;

		var ownerUnits = owner.units;

		for (var i = 0; i < ownerUnits.length; i++)
		{
			var unit = ownerUnits[i];
			var unitPos = unit.pos;
			var cellsAdjacentPositions = [];
			for (var y = -1; y <= 1; y++)
			{
				cellOffsetPos.y = y;

				for (var x = -1; x <= 1; x++)
				{
					cellOffsetPos.x = x;

					var cellAdjacentPos =
						unitPos.clone().add(cellOffsetPos);
					var cellAdjacentIndex =
						cellAdjacentPos.y * mapSizeInCells.x + cellAdjacentPos.x;

					if (this.cellsKnownIndicesByIndex.has(cellAdjacentIndex) == false)
					{
						this.cellsKnownIndicesByIndex.set
						(
							cellAdjacentIndex, cellAdjacentIndex
						);
					}

					if (this.cellsVisibleIndicesByIndex.has(cellAdjacentIndex) == false)
					{
						this.cellsVisibleIndicesByIndex.set
						(
							cellAdjacentIndex, cellAdjacentIndex
						);
					}

				}
			}
		}
	}
}

class OwnerResearch
{
	constructor
	(
		technologiesKnownNames,
		technologyBeingResearchedName,
		researchStockpiled
	)
	{
		this.technologiesKnownNames = technologiesKnownNames || [];
		this.technologyBeingResearchedName = technologyBeingResearchedName;
		this.researchStockpiled = researchStockpiled || 0;
	}

	static default()
	{
		return new OwnerResearch(null, null, null);
	}
}

class OwnerSelection
{
	constructor()
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;
	}

	baseSelectNextIdle(owner)
	{
		var bases = owner.bases;

		var areThereAnyBasesIdle =
			bases.some(x => x.isIdle());

		if (areThereAnyBasesIdle == false)
		{
			this.baseSelectedIndex = null;
		}
		else
		{
			if (this.baseSelectedIndex == null)
			{
				this.baseSelectedIndex = -1;
			}

			while (true)
			{
				this.baseSelectedIndex++;
				if (this.baseSelectedIndex >= bases.length)
				{
					this.baseSelectedIndex = 0;
				}

				var baseSelected = this.baseSelected(owner);
				if (baseSelected.isIdle())
				{
					break;
				}

			}
		}
	}

	baseSelected(owner)
	{
		var bases = owner.bases;

		var base =
		(
			this.baseSelectedIndex == null
			? null
			: bases[this.baseSelectedIndex]
		);

		return base;
	}

	unitSelectById(owner, idToSelect)
	{
		var units = owner.units;
		var unitToSelect = units.find(x => x.id == idToSelect);
		if (unitToSelect == null)
		{
			throw new Error("No unit found with ID: " + idToSelect);
		}
		else
		{
			var unitToSelectIndex = units.indexOf(unitToSelect);
			this.unitSelectedIndex = unitToSelectIndex;
		}
	}

	unitSelectNextWithMoves(owner)
	{
		var units = owner.units;

		var areThereAnyUnitsWithMoves =
			units.some(x => x.hasMovesThisTurn());

		if (areThereAnyUnitsWithMoves == false)
		{
			this.unitSelectedIndex = null;
		}
		else
		{
			if (this.unitSelectedIndex == null)
			{
				this.unitSelectedIndex = -1;
			}

			while (true)
			{
				this.unitSelectedIndex++;
				if (this.unitSelectedIndex >= units.length)
				{
					this.unitSelectedIndex = 0;
				}

				var unitSelected = this.unitSelected(owner);
				if (unitSelected.hasMovesThisTurn())
				{
					break;
				}

			}
		}
	}

	unitSelected(owner)
	{
		var units = owner.units;

		var unit =
		(
			this.unitSelectedIndex == null
			? null
			: units[this.unitSelectedIndex]
		);

		return unit;
	}

}
