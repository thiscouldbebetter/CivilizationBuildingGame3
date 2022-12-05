
class MapOfCells
{
	constructor(sizeInCells, cells)
	{
		this.sizeInCells = sizeInCells;
		this.cells = cells;
	}

	static fromCellsAsStrings(cellsAsStrings)
	{
		var sizeInCells = new Coords
		(
			cellsAsStrings[0].length, cellsAsStrings.length
		);
		var cells = [];

		var cellPosInCells = Coords.create();

		for (var y = 0; y < sizeInCells.y; y++)
		{
			cellPosInCells.y = y;

			for (var x = 0; x < sizeInCells.x; x++)
			{
				cellPosInCells.x = x;

				var cellAsString = cellsAsStrings[y][x];
				var cellTerrainCode = cellAsString;

				var cell = new MapOfCellsCell
				(
					cellPosInCells.clone(),
					cellTerrainCode
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

	draw(universe, world)
	{
		var display = universe.display;
		var cellPosInCells = Coords.create();
		var cellSizeInPixels = Coords.ones().multiplyScalar(16); // hack
		var cellPosInPixels = Coords.create();

		for (var y = 0; y < this.sizeInCells.y; y++)
		{
			cellPosInCells.y = y;

			for (var x = 0; x < this.sizeInCells.x; x++)
			{
				cellPosInCells.x = x;

				cellPosInPixels.overwriteWith(cellPosInCells).multiply(cellSizeInPixels);

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
		basePresentId,
		improvementsPresentNames,
		unitsPresentIds
	)
	{
		this.pos = pos;
		this.terrainCode = terrainCode;
		this.basePresentId = basePresentId;
		this.improvementsPresentNames = improvementsPresentNames || [];
		this.unitsPresentIds = unitsPresentIds || [];

		this._resourcesProducedThisTurn = ResourceProduction.create();
	}

	baseAdd(base)
	{
		this.basePresentId = base.id;
	}

	basePresent(world)
	{
		return (this.basePresentId == null ? null : world.baseById(this.basePresentId));
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

		if (this.hasRoads())
		{
			resources.trade++;
		}

		return resources;
	}

	terrain(world)
	{
		return world.defns.terrainByCode(this.terrainCode);
	}

	unitAdd(unit)
	{
		this.unitsPresentIds.push(unit.id);
	}

	unitRemove(unit)
	{
		this.unitsPresentIds.splice(this.unitsPresentIds.indexOf(unit.id), 1);
	}

	unitsPresent(world)
	{
		return (this.unitsPresentIds.map(x => world.unitById(x)));
	}

	value(world, base)
	{
		var returnValue =
			this.resourcesProduced(world, base).sumOfResourceQuantities();

		return returnValue;
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
}

class MapOfCellsCellImprovement_Instances
{
	constructor()
	{
		var effectTodo = "";

		this.Irrigation = new MapOfCellsCellImprovement("Irrigation", "i", effectTodo);
		this.Mines = new MapOfCellsCellImprovement("Mines", "m", effectTodo);
		this.Railroads = new MapOfCellsCellImprovement("Railroads", "R", effectTodo);
		this.Roads = new MapOfCellsCellImprovement("Roads", "r", effectTodo);
	}
}

class MapOfCellsCellTerrain
{
	constructor
	(
		name,
		categoryName,
		code,
		colorName,
		symbol,
		movesToTraverse,
		resourceProductionPerTurn
	)
	{
		this.name = name;
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
		var t = (a, b, c, d, e, f, g) =>
		{
			return new MapOfCellsCellTerrain(a, b, c, d, e, f, g);
		};

		var rp = (food, industry, trade) => new ResourceProduction(food, industry, trade);

		var land = "Land";
		var water = "Water";

		// 					name,			cat,	code,	color,				symbol, moves, 	resourceProd
		this.Desert 	= t("Desert",		land,	"/", 	"rgb(255,000,128)",	"/",	1,		rp(0, 1, 0) );
		this.Forest		= t("Forest", 		land,	"@",	"rgb(000,255,000)",	"@",	2,		rp(1, 2, 0) );
		this.Glacier	= t("Glacier", 		land,	"#",	"rgb(255,255,255)",	"#",	2,		rp(0, 0, 0) );
		this.Grassland	= t("Grassland", 	land,	":",	"rgb(000,255,000)",	":",	1,		rp(2, 0, 0) );
		this.Hills		= t("Hills",		land,	"*",	"rgb(000,255,000)",	"*",	2,		rp(1, 0, 0) );
		this.Jungle		= t("Jungle",		land, 	"&",	"rgb(000,064,000)",	"&",	2,		rp(1, 0, 0) );
		this.Mountains	= t("Mountains",	land, 	"^", 	"rgb(128,128,128)",	"^",	3, 		rp(0, 1, 0) );
		this.Ocean 		= t("Ocean",		water,	"~",	"rgb(000,000,255)",	"~",	100,	rp(1, 0, 2) );
		this.Plains 	= t("Plains",		land,	".",	"rgb(000,128,000)",	".",	1,		rp(1, 1, 0) );
		this.Swamp		= t("Swamp",		land,	"=",	"rgb(064,192,000)",	"=",	2,		rp(1, 0, 0) );
		this.Tundra		= t("Tundra",		land, 	"-",	"rgb(128,255,128)",	"-",	2,		rp(1, 0, 0) );

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
