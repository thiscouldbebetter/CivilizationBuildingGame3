
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
