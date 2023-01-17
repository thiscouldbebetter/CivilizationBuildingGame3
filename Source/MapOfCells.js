
class MapOfCells
{
	constructor(sizeInCells, cells)
	{
		this.sizeInCells = sizeInCells;
		this.cells = cells;
	}

	static fromCellsAsStringGroups(cellsAsStringGroups)
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

	cellAtPosInCells(posInCells)
	{
		return this.cells[this.cellIndexAtPos(posInCells)];
	}

	cellIndexAtPos(posInCells)
	{
		return posInCells.y * this.sizeInCells.x + posInCells.x;
	}

	cellIndexToPosInCells(cellIndex, cellPosInCells)
	{
		cellPosInCells.overwriteWithDimensions
		(
			cellIndex % this.sizeInCells.x,
			Math.floor(cellIndex / this.sizeInCells.x),
			0
		);
	}

	cellsWithPollutionCount()
	{
		var cellsWithPollutionCountSoFar = 0;
		this.cells.forEach
		(
			x => cellsWithPollutionCountSoFar += (x.hasPollution ? 1 : 0)
		);
		return cellsWithPollutionCountSoFar;
	}

	draw(universe, world)
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

class MapOfCellsCell
{
	constructor
	(
		pos,
		terrainCode,
		resourceSpecialPresentCode,
		hasPollution,
		basePresentId,
		improvementsPresentNames,
		unitsPresentIds
	)
	{
		this.pos = pos;
		this.terrainCode = terrainCode;
		this.resourceSpecialPresentCode = resourceSpecialPresentCode;
		this.hasPollution = hasPollution || false;
		this.basePresentId = basePresentId;
		this.improvementsPresentNames = improvementsPresentNames || [];
		this.unitsPresentIds = unitsPresentIds || [];

		this._resourcesProducedThisTurn = ResourceProduction.create();
	}

	static fromPosAndCodes(pos, codes)
	{
		var terrainCode = codes[0];
		var resourceSpecialCode = codes[1];
		return new MapOfCellsCell(
			pos, terrainCode, resourceSpecialCode, null, null, null, null
		);
	}

	static fromTerrainCode(terrainCode)
	{
		return new MapOfCellsCell(null, terrainCode, null, null, null, null, null);
	}

	baseAdd(base)
	{
		this.basePresentId = base.id;
	}

	basePresent(world)
	{
		return (this.basePresentId == null ? null : world.baseById(this.basePresentId));
	}

	canBeIrrigated()
	{
		var returnValue =
		(
			this.hasIrrigation() == false
			// todo - Certain terrain types only.
			// todo - Neighbor has water source.
		);

		return returnValue;
	}

	hasBase()
	{
		return (this.basePresentId != null);
	}

	hasFarmland()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Farmland) );
	}

	hasFortress()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Fortress) );
	}

	hasImprovement(improvement)
	{
		return (this.improvementsPresentNames.indexOf(improvement.name) >= 0);
	}

	hasIrrigation()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Irrigation) );
	}

	hasMines()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Mines) );
	}

	hasRailroads()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Railroads) );
	}

	hasRiver()
	{
		return this._hasRiver;
	}

	hasRoads()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Roads) );
	}

	improvementAdd(improvement)
	{
		var improvementName = improvement.name;
		if (this.improvementsPresentNames.indexOf(improvementName) == -1)
		{
			this.improvementsPresentNames.push(improvementName);
		}
	}

	improvementAddIrrigation()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Irrigation);
	}

	improvementAddMines()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Mines);
	}

	improvementAddRailroads()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Railroads);
	}

	improvementAddRoads()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Roads);
	}

	resourcesProduced(world, base)
	{
		var terrain = this.terrain(world);
		var resources = this._resourcesProducedThisTurn.overwriteWith
		(
			terrain.resourceProductionPerTurn
		);

		if (this.hasIrrigation())
		{
			resources.food++; // todo - Depending on terrain.
		}

		if (this.hasRivers)
		{
			resources.trade++;
		}

		if (this.hasRoads())
		{
			resources.trade++; // todo - Depending on terrain?
		}

		var resourceSpecialPresent = this.resourceSpecialPresent();
		if (resourceSpecialPresent != null)
		{
			resources.add(resourceSpecialPresent.resourcesProduced);
		}

		var owner = base.owner(world);
		if (owner.governmentIsAnarchyOrDespotism())
		{
			if (resources.food > 2)
			{
				resources.food--;
			}
			if (resources.industry > 2)
			{
				resources.industry--;
			}
			if (resources.trade > 2)
			{
				resources.trade--;
			}
		}

		return resources;
	}

	resourceSpecialPresent()
	{
		var returnValue =
		(
			this.resourceSpecialPresentCode == null
			? null
			: MapOfCellsCellResource.byCode(this.resourceSpecialPresentCode)
		);
		return returnValue;
	}

	terrain(world)
	{
		return world.defns.terrainByCode(this.terrainCode);
	}

	unitAdd(unit)
	{
		this.unitsPresentIds.push(unit.id);
	}

	unitNotAlliedWithOwnerIsPresent(owner, world)
	{
		var unitsPresent = this.unitsPresent(world);
		var unitNotAlliedWithOwnerIsPresent =
			unitsPresent.some(x => x.ownerName != owner.ownerName);
		return unitNotAlliedWithOwnerIsPresent;
	}

	unitRemove(unit)
	{
		this.unitsPresentIds.splice(this.unitsPresentIds.indexOf(unit.id), 1);
	}

	unitsOrBasesPresent(world)
	{
		var unitsOrBasesPresent = this.unitsPresent(world);
		var basePresent = this.basePresent(world);
		if (basePresent != null)
		{
			unitsOrBasesPresent.push(basePresent);
		}
		return unitsOrBasesPresent;
	}

	unitsPresent(world)
	{
		return (this.unitsPresentIds.map(x => world.unitById(x)));
	}

	unitsPresentNotAlliedWithOwner(owner, world)
	{
		var unitsPresent = this.unitsPresent(world);
		var unitsNotAlliedWithOwnerPresent =
			unitsPresent.filter(x => x.ownerName != owner.ownerName);
		return unitsNotAlliedWithOwnerPresent;
	}

	unitsPresentOwnedBySameOwnerAsUnit(unit, world)
	{
		var unitsPresent = this.unitsPresent(world);
		var unitsOwnedBySameOwnerPresent = unitsPresent.filter
		(
			x =>
			(
				x.id != unit.id
				&& x.ownerName == unit.ownerName
			)
		);
		return unitsOwnedBySameOwnerPresent;
	}

	unitsPresentQualifiedToBePassengersOnUnit(unit, world)
	{
		var unitsOwnedBySameOwnerPresent =
			this.unitsPresentOwnedBySameOwnerAsUnit(unit, world);
		var unitsQualifiedToBePassengers =
			unitsOwnedBySameOwnerPresent.filter
			(
				unit => unit.isGround(world) && unit.isSleeping()
			);
		return unitsQualifiedToBePassengers;
	}

	value(world, base)
	{
		var foodThisTurnNet = base.foodThisTurnNet(world);
		var industryThisTurnNet = base.industryThisTurnNet(world);
		var moneyThisTurnNet = base.moneyThisTurnNet(world);

		var foodWeight = (foodThisTurnNet >= 1 ? 0 : -foodThisTurnNet);
		var industryWeight = (industryThisTurnNet >= 1 ? 0 : -industryThisTurnNet);
		var tradeWeight = (moneyThisTurnNet >= 1 ? 0 : -moneyThisTurnNet);
		var totalWeight = foodWeight + industryWeight + tradeWeight;

		var resourcesProduced = this.resourcesProduced(world, base);

		var cellValue =
		(
			totalWeight == 0
			? resourcesProduced.sumOfResourceQuantities()
			:
			(
				resourcesProduced.food * foodWeight
				+ resourcesProduced.industry * industryWeight
				+ resourcesProduced.trade * tradeWeight
			)
		);

		return cellValue;
	}

}

class MapOfCellsCellImprovement
{
	constructor(name, code, effect)
	{
		this.name = name;
		this.code = code;
		this.effect = effect;
	}

	static Instances()
	{
		if (MapOfCellsCellImprovement._instances == null)
		{
			MapOfCellsCellImprovement._instances =
				new MapOfCellsCellImprovement_Instances();
		}
		return MapOfCellsCellImprovement._instances;
	}

	static byCode(code)
	{
		return MapOfCellsCellImprovement.Instances().byCode(code);
	}
}

class MapOfCellsCellImprovement_Instances
{
	constructor()
	{
		var effectTodo = "";

		this.Farmland 	= new MapOfCellsCellImprovement("Farmland", "I", effectTodo);
		this.Fortress 	= new MapOfCellsCellImprovement("Fortress", "f", effectTodo);
		this.Irrigation = new MapOfCellsCellImprovement("Irrigation", "i", effectTodo);
		this.Mines 		= new MapOfCellsCellImprovement("Mines", "m", effectTodo);
		this.Railroads 	= new MapOfCellsCellImprovement("Railroads", "R", effectTodo);
		this.Roads 		= new MapOfCellsCellImprovement("Roads", "r", effectTodo);

		this._All =
		[
			this.Farmland,
			this.Fortress,
			this.Irrigation,
			this.Mines,
			this.Railroads,
			this.Roads
		];

		this._AllByCode = new Map(this._All.map(x => [x.code, x] ) );
	}

	byCode(code)
	{
		return this._AllByCode.get(code);
	}
}

class MapOfCellsCellResource
{
	constructor(name, code, terrain, resourcesProduced)
	{
		this.name = name;
		this.code = code;
		this.terrainCode = terrain.code;
		this.resourcesProduced = resourcesProduced;
	}

	static Instances()
	{
		if (MapOfCellsCellResource._instances == null)
		{
			MapOfCellsCellResource._instances =
				new MapOfCellsCellResource_Instances();
		}
		return MapOfCellsCellResource._instances;
	}

	static byCode(code)
	{
		return MapOfCellsCellResource.Instances().byCode(code);
	}
}

class MapOfCellsCellResource_Instances
{
	constructor()
	{
		var r = (n, c, tc, rp) => new MapOfCellsCellResource(n, c, tc, rp);
		var ts = MapOfCellsCellTerrain.Instances();
		var rp = (f, i, t) => new ResourceProduction(f, i, t);

		// 				  	name, 		code, 	terr, 			effect
		this.Buffalo 	= r("Buffalo", 	"A", 	ts.Plains, 		rp(0, 2, 0));
		this.Coal 		= r("Coal", 	"B", 	ts.Hills, 		rp(0, 2, 0));
		this.Fish 		= r("Fish", 	"C", 	ts.Ocean, 		rp(3, 0, 0));
		this.Fruit 		= r("Fruit", 	"D", 	ts.Jungle, 		rp(3, 0, 1));
		this.Furs		= r("Furs",		"E", 	ts.Tundra, 		rp(1, 0, 3));
		this.Game 		= r("Game", 	"F", 	ts.Tundra, 		rp(2, 1, 0));
		this.Gems 		= r("Gems",		"G", 	ts.Jungle, 		rp(0, 0, 4));
		this.Gold 		= r("Gold",		"H", 	ts.Mountains, 	rp(0, 0, 6));
		this.Iron 		= r("Iron", 	"I", 	ts.Mountains, 	rp(0, 4, 0));
		this.Ivory 		= r("Ivory",	"J", 	ts.Glacier, 	rp(1, 1, 4));
		this.Oasis 		= r("Oasis",	"K", 	ts.Desert, 		rp(3, 0, 0));
		this.Oil 		= r("Oil",		"L", 	ts.Desert, 		rp(0, 4, 0));
		this.Oil2 		= r("Oil2",		"M", 	ts.Glacier, 	rp(0, 4, 0));
		this.Peat 		= r("Peat",		"N", 	ts.Swamp, 		rp(0, 4, 0));
		this.Pheasant 	= r("Pheasant",	"O", 	ts.Forest, 		rp(2, 0, 0));
		this.Shield 	= r("Shield", 	"P", 	ts.Plains, 		rp(0, 1, 0));
		this.Silk 		= r("Silk", 	"Q", 	ts.Forest, 		rp(0, 0, 1));
		this.Spice 		= r("Spice", 	"R", 	ts.Swamp, 		rp(2, 4, 0));
		this.Whales 	= r("Whales",	"S", 	ts.Ocean, 		rp(1, 2, 1));
		this.Wheat 		= r("Wheat",	"T", 	ts.Plains, 		rp(2, 0, 0));
		this.Wine 		= r("Wine", 	"U",	ts.Hills, 		rp(0, 0, 4));

		this._All =
		[
			this.Buffalo,
			this.Coal,
			this.Fish,
			this.Fruit,
			this.Furs,
			this.Game,
			this.Gems,
			this.Gold,
			this.Iron,
			this.Ivory,
			this.Oasis,
			this.Oil,
			this.Peat,
			this.Pheasant,
			this.Shield,
			this.Silk,
			this.Spice,
			this.Whales,
			this.Wheat,
			this.Wine
		];

		this._AllByCode = new Map(this._All.map(x => [x.code, x] ) );
	}

	byCode(code)
	{
		return this._AllByCode.get(code);
	}
}

class MapOfCellsCellTerrain
{
	constructor
	(
		name,
		abbreviation,
		categoryName,
		code,
		colorName,
		symbol,
		movesToTraverse,
		resourceProductionPerTurn
	)
	{
		this.name = name;
		this.abbreviation = abbreviation;
		this.categoryName = categoryName;
		this.code = code;
		this.colorName = colorName;
		this.symbol = symbol;
		this.movesToTraverse = movesToTraverse;
		this.resourceProductionPerTurn = resourceProductionPerTurn;
	}

	static Instances()
	{
		if (MapOfCellsCellTerrain._instances == null)
		{
			MapOfCellsCellTerrain._instances =
				new MapOfCellsCellTerrain_Instances();
		}
		return MapOfCellsCellTerrain._instances;
	}

	isLand()
	{
		return (this.categoryName == "Land");
	}
}

class MapOfCellsCellTerrain_Instances
{
	constructor()
	{
		var t = (a, b, c, d, e, f, g, h) =>
		{
			return new MapOfCellsCellTerrain(a, b, c, d, e, f, g, h);
		};

		var rp = (food, industry, trade) => new ResourceProduction(food, industry, trade);

		var land = "Land";
		var water = "Water";

		// 					name,			abbr,	cat,	code,	color,				symbol, moves, 	resourceProd
		this.Desert 	= t("Desert",		"d",	land,	"/", 	"rgb(255,000,128)",	"/",	1,		rp(0, 1, 0) );
		this.Forest		= t("Forest", 		"f",	land,	"@",	"rgb(000,255,000)",	"@",	2,		rp(1, 2, 0) );
		this.Glacier	= t("Glacier", 		"i",	land,	"#",	"rgb(255,255,255)",	"#",	2,		rp(0, 0, 0) );
		this.Grassland	= t("Grassland", 	"g",	land,	":",	"rgb(000,255,000)",	":",	1,		rp(2, 0, 0) );
		this.Hills		= t("Hills",		"h",	land,	"*",	"rgb(000,255,000)",	"*",	2,		rp(1, 0, 0) );
		this.Jungle		= t("Jungle",		"j",	land, 	"&",	"rgb(000,064,000)",	"&",	2,		rp(1, 0, 0) );
		this.Mountains	= t("Mountains",	"m",	land, 	"^", 	"rgb(128,128,128)",	"^",	3, 		rp(0, 1, 0) );
		this.Ocean 		= t("Ocean",		"o",	water,	"~",	"rgb(000,000,255)",	"~",	100,	rp(1, 0, 2) );
		this.Plains 	= t("Plains",		"p",	land,	".",	"rgb(000,128,000)",	".",	1,		rp(1, 1, 0) );
		this.Swamp		= t("Swamp",		"s",	land,	"=",	"rgb(064,192,000)",	"=",	2,		rp(1, 0, 0) );
		this.Tundra		= t("Tundra",		"t",	land, 	"-",	"rgb(128,255,128)",	"-",	2,		rp(1, 0, 0) );

		// todo - Rivers.

		this._All =
		[
			this.Desert,
			this.Forest,
			this.Glacier,
			this.Grassland,
			this.Hills,
			this.Jungle,
			this.Mountains,
			this.Ocean,
			this.Plains,
			this.Swamp,
			this.Tundra
		];
	}
}
