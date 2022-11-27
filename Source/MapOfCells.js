
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

	resourcesProduced(world, base)
	{
		var terrain = this.terrain(world);
		var resources = this._resourcesProducedThisTurn.overwriteWith
		(
			terrain.resourceProductionPerTurn
		);
		// todo - Apply improvements, bonuses, penalties.
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
		this.Mine = new MapOfCellsCellImprovement("Mine", "m", effectTodo);
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

		var land = "Land";
		var water = "Water";

		// 					name,			cat,	code,	color,				symbol, moves, 	resourceProd
		this.Desert 	= t("Desert",		land,	"/", 	"rgb(255,000,128)",	"/",	1,		null);
		this.Forest		= t("Forest", 		land,	"@",	"rgb(000,255,000)",	"@",	2,		null);
		this.Glacier	= t("Glacier", 		land,	"#",	"rgb(255,255,255)",	"#",	2,		null);
		this.Grassland	= t("Grassland", 	land,	":",	"rgb(000,255,000)",	":",	1,		null);
		this.Hills		= t("Hills",		land,	"*",	"rgb(000,255,000)",	"*",	2,		null);
		this.Jungle		= t("Jungle",		land, 	"&",	"rgb(000,064,000)",	"&",	2,		null);
		this.Mountains	= t("Mountains",	land, 	"^", 	"rgb(128,128,128)",	"^",	3, 		null);
		this.Ocean 		= t("Ocean",		water,	"~",	"rgb(000,000,255)",	"~",	100,	null);
		this.Plains 	= t("Plains",		land,	".",	"rgb(000,128,000)",	".",	1,		null);
		this.River		= t("River",		land,	"S",	"rgb(000,255,032)",	"S",	1,		null);
		this.Swamp		= t("Swamp",		land,	"=",	"rgb(064,192,000)",	"=",	2,		null);
		this.Tundra		= t("Tundra",		land, 	"-",	"rgb(128,255,128)",	"-",	2,		null);

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
			this.River,
			this.Swamp,
			this.Tundra
		];
	}
}
