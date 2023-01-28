
class MapOfCellsCellTerrain
{
	name: string;
	abbreviation: string;
	categoryName: string;
	code: string;
	colorName: string;
	symbol: string;
	movesToTraverse: number;
	resourceProductionPerTurn: ResourceProduction;

	constructor
	(
		name: string,
		abbreviation: string,
		categoryName: string,
		code: string,
		colorName: string,
		symbol: string,
		movesToTraverse: number,
		resourceProductionPerTurn: ResourceProduction
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

	static _instances: MapOfCellsCellTerrain_Instances;
	static Instances(): MapOfCellsCellTerrain_Instances
	{
		if (MapOfCellsCellTerrain._instances == null)
		{
			MapOfCellsCellTerrain._instances =
				new MapOfCellsCellTerrain_Instances();
		}
		return MapOfCellsCellTerrain._instances;
	}

	isLand(): boolean
	{
		return (this.categoryName == "Land");
	}
}

class MapOfCellsCellTerrain_Instances
{
	Desert: MapOfCellsCellTerrain;
	Forest: MapOfCellsCellTerrain;
	Glacier: MapOfCellsCellTerrain;
	Grassland: MapOfCellsCellTerrain;
	Hills: MapOfCellsCellTerrain;
	Jungle: MapOfCellsCellTerrain;
	Mountains: MapOfCellsCellTerrain;
	Ocean: MapOfCellsCellTerrain;
	Plains: MapOfCellsCellTerrain;
	Swamp: MapOfCellsCellTerrain;
	Tundra: MapOfCellsCellTerrain;

	_All: MapOfCellsCellTerrain[];

	constructor()
	{
		var t =
		(
			a: string, b: string, c: string, d: string,
			e: string, f: string, g: number, h: ResourceProduction
		) =>
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
