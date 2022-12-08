
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

		this.governmentName = Government.Instances().Despotism.name; // todo
		this.selection = new OwnerSelection();
	}

	areAnyBasesOrUnitsIdle(world)
	{
		var areAnyBasesIdle = this.bases.some(x => x.isIdle() );
		var areAnyUnitsIdle = this.units.some(x => x.isIdle() );
		var returnValue = (areAnyBasesIdle || areAnyUnitsIdle);
		return returnValue;
	}

	baseAdd(base)
	{
		this.bases.push(base);
	}

	baseCapital()
	{
		return this.bases[0]; // todo
	}

	baseRemove(base)
	{
		this.bases.splice(this.bases.indexOf(base), 1);
	}

	buildablesKnownNames()
	{
		return this.research.buildablesKnownNames();
	}

	canBuildBuildable(buildable)
	{
		return this.research.canBuildBuildable(buildable, this);
	}

	corruptionPerUnitDistanceFromCapital()
	{
		return this.government().corruptionPerUnitDistanceFromCapital;
	}

	foodConsumedPerSettler()
	{
		return 2; // todo
	}

	government()
	{
		return Government.byName(this.governmentName);
	}

	governmentsKnown()
	{
		return this.research.governmentsKnown();
	}

	industryConsumedByUnitCount(unitCount)
	{
		var unitsFree = 2;
		var unitsSupportedCount = unitCount - unitsFree;
		if (unitsSupportedCount < 0)
		{
			unitsSupportedCount = 0;
		}
		var industryConsumedPerUnitSupported = 2;
		var industryConsumed =
			unitsSupportedCount * industryConsumedPerUnitSupported;
		return industryConsumed;
	}

	initialize(world)
	{
		this.bases.forEach(x => x.initialize(world) );
		this.units.forEach(x => x.initialize(world) );

		this.unitSelectNextIdle();
	}

	researchThisTurn(world)
	{
		var researchSoFar = 0;
		this.bases.forEach
		(
			x => researchSoFar += x.researchThisTurn(world)
		);
		return researchSoFar;
	}

	taxRate()
	{
		return this.incomeAllocation.upkeepFraction;
	}

	technologiesKnown()
	{
		return this.research.technologiesKnown();
	}

	technologiesResearchable()
	{
		return this.research.technologiesResearchable();
	}

	technologyResearch(technology)
	{
		this.research.technologyResearch(technology);
	}

	turnUpdate(world)
	{
		this.bases.forEach(x => x.turnUpdate(world) );
		this.units.forEach(x => x.turnUpdate(world) );

		this.research.turnUpdate(world, this);

		this.unitSelectNextIdle();
	}

	unitAdd(unit)
	{
		if (this.units.indexOf(unit) == -1)
		{
			this.units.push(unit);
		}
	}

	unitRemove(unit)
	{
		this.units.splice(this.units.indexOf(unit), 1);
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

	selectableSelected()
	{
		return this.selection.selectableSelected(this);
	}

	unitSelectById(idToSelect)
	{
		return this.selection.unitSelectById(this, idSelect);
	}

	unitSelectNextIdle()
	{
		return this.selection.unitSelectNextIdle(this);
	}

	unitSelected()
	{
		return this.selection.unitSelected(this);
	}

	unitSelectedClear()
	{
		this.selection.clear();
		return this;
	}

}

class OwnerDiplomacy
{
	constructor()
	{
		this.relationshipNamesByOwnerName = new Map([]);
	}

	relationshipByOwner(ownerOther)
	{
		return this.relationshipNamesByOwnerName.get(ownerOther.name);
	}

	ownerIsEnemy(ownerOther)
	{
		var isOwnerOtherKnown = this.ownerIsKnown(ownerOther);
		if (isOwnerOtherKnown == false)
		{
			isEnemy = false;
		}
		else
		{
			var relationship = this.relationshipByOwner(ownerOther.name);
			isEnemy = (relationship == OwnerDiplomacyRelationship.Instances().War);
		}
		return isEnemy;
	}

	ownerIsKnown(ownerOther)
	{
		return this.relationshipNamesByOwnerName.has(ownerOther.name);
	}
}

class OwnerDiplomacyRelationship
{
	constructor(name)
	{
		this.name = name;
	}

	static Instances()
	{
		if (OwnerDiplomacyRelationship._instances == null)
		{
			OwnerDiplomacyRelationship._instances =
				new OwnerDiplomacyRelationship_Instances();
		}
		return OwnerDiplomacyRelationship._instances;
	}
}

class OwnerDiplomacyRelationship_Instances
{
	constructor()
	{
		this.Alliance = new OwnerDiplomacyRelationship("Alliance");
		this.Peace = new OwnerDiplomacyRelationship("Peace");
		this.War = new OwnerDiplomacyRelationship("War");
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
				baseColorName, borderColor
			);
			display.drawText
			(
				base.name, cellCenterInPixels, borderColor
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
			var fillColorName = unitOwnerColorName;

			var isSelected = (unit == unitSelected);
			var borderColorName =
			(
				isSelected && (unit.isSleeping == false)
				? "White"
				: "Gray"
			);

			display.drawCircle
			(
				cellCenterInPixels, cellRadiusInPixels,
				fillColorName, borderColorName
			);

			if (unit.isSleeping)
			{
				display.drawCircle
				(
					cellCenterInPixels, cellRadiusInPixels,
					"rgb(255, 255, 255, 0.25)", null
				);
			}

			display.drawText(unitSymbol, cellCenterInPixels, borderColorName);
		});
	}

	update(universe, world, owner)
	{
		this.cellsVisibleIndicesByIndex = new Map();

		var mapSizeInCells = world.map.sizeInCells;
		var cellOffsetPos = Coords.create();

		var ownerViewers = [];
		ownerViewers.push(...owner.bases);
		ownerViewers.push(...owner.units);

		for (var i = 0; i < ownerViewers.length; i++)
		{
			var viewer = ownerViewers[i];
			var viewerPos = viewer.pos;
			var cellsAdjacentPositions = [];
			for (var y = -1; y <= 1; y++)
			{
				cellOffsetPos.y = y;

				for (var x = -1; x <= 1; x++)
				{
					cellOffsetPos.x = x;

					var cellAdjacentPos =
						viewerPos.clone().add(cellOffsetPos);
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
		this.technologiesKnownNames =
			technologiesKnownNames || [ Technology.Instances()._Basic.name ];
		this.technologyBeingResearchedName = technologyBeingResearchedName;
		this.researchStockpiled = researchStockpiled || 0;
	}

	static default()
	{
		return new OwnerResearch(null, null, null);
	}

	buildablesKnownNames()
	{
		var buildablesKnownNames = [];

		var technologiesKnown = this.technologiesKnown();
		technologiesKnown.forEach
		(
			x => buildablesKnownNames.push(...x.buildablesAllowedNames)
		);

		return buildablesKnownNames;
	}

	canBuildBuildable(buildable)
	{
		var buildableName = buildable.name;
		var technologiesKnown = this.technologiesKnown();
		var canBuild = technologiesKnown.some
		(
			x => x.buildablesAllowedNames.indexOf(buildableName) >= 0
		);
		return canBuild;
	}

	governmentsKnown()
	{
		var governmentsKnown = [];
		var techsKnown = this.technologiesKnown();
		techsKnown.forEach
		(
			x =>
			{
				if (x.governmentAllowedName != null)
				{
					var government = Government.byName(x.governmentAllowedName);
					governmentsKnown.push(government);
				}
			}
		);
		return governmentsKnown;
	}

	technologiesKnown()
	{
		var technologiesKnown =
			this.technologiesKnownNames.map(x => Technology.byName(x));
		return technologiesKnown;
	}

	technologiesResearchable()
	{
		var techsAll = Technology.Instances()._All;
		var techsKnown = this.technologiesKnown();
		var techsResearchable = techsAll.filter
		(
			x =>
				techsKnown.indexOf(x) == -1
				&& x.prerequisitesAreSatisfiedByTechnologies(techsKnown)
		);
		return techsResearchable;
	}

	technologyBeingResearched()
	{
		return Technology.byName(this.technologyBeingResearchedName);
	}

	technologyResearch(technology)
	{
		this.technologyBeingResearchedName = technology.name;
		this.researchStockpiled = 0;
	}

	turnUpdate(world, owner)
	{
		var technologyBeingResearched =
			this.technologyBeingResearched();

		if (technologyBeingResearched != null)
		{
			var researchThisTurn = owner.researchThisTurn(world);
			this.researchStockpiled += researchThisTurn;
			if (this.researchStockpiled >= technologyBeingResearched.researchToLearn)
			{
				this.technologiesKnownNames.push
				(
					technologyBeingResearched.name
				);
				this.researchStockpiled = 0;
			}
		}
	}
}

class OwnerSelection
{
	constructor()
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;

		this.selectableSelectedCategoryIndex =
			SelectableCategory.Instances().Units.index;
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

	selectableSelectNextIdle(owner)
	{
		var returnValue = null;

		var categories = SelectableCategory.Instances();

		if (this.selectableSelectedCategoryIndex == categories.Bases.index)
		{
			returnValue = this.baseSelectNextIdle(owner);
		}
		else if (this.selectableSelectedCategoryIndex == categories.Units.index)
		{
			returnValue = this.unitSelectNextIdle(owner);
		}

		return returnValue;
	}

	selectableSelected(owner)
	{
		var returnValue = null;

		var categories = SelectableCategory.Instances();

		if (this.selectableSelectedCategoryIndex == categories.Bases.index)
		{
			returnValue = this.baseSelected(owner);
		}
		else if (this.selectableSelectedCategoryIndex == categories.Units.index)
		{
			returnValue = this.unitSelected(owner);
		}

		return returnValue;
	}

	clear()
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;

		return this;
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

	unitSelectNextIdle(owner)
	{
		var units = owner.units;

		var areThereAnyUnitsIdle =
			units.some(x => x.isIdle());

		if (areThereAnyUnitsIdle == false)
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
