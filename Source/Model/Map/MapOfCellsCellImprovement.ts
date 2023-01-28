
class MapOfCellsCellImprovement
{
	name: string;
	code: string;
	effect: any;

	constructor(
		name: string,
		code: string,
		effect: any
	)
	{
		this.name = name;
		this.code = code;
		this.effect = effect;
	}

	static _instances: MapOfCellsCellImprovement_Instances;
	static Instances(): MapOfCellsCellImprovement_Instances
	{
		if (MapOfCellsCellImprovement._instances == null)
		{
			MapOfCellsCellImprovement._instances =
				new MapOfCellsCellImprovement_Instances();
		}
		return MapOfCellsCellImprovement._instances;
	}

	static byCode(code: string): MapOfCellsCellImprovement
	{
		return MapOfCellsCellImprovement.Instances().byCode(code);
	}
}

class MapOfCellsCellImprovement_Instances
{
	Farmland: MapOfCellsCellImprovment;
	Fortress: MapOfCellsCellImprovment;
	Irrigation: MapOfCellsCellImprovment;
	Mines: MapOfCellsCellImprovment;
	Railroads: MapOfCellsCellImprovment;
	Roads: MapOfCellsCellImprovment;

	_All: MapOfCellsCellImprovment[];
	_AllByName: Map<string, MapOfCellsCellImprovment>;

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

	byCode(code: string): MapOfCellsCellImprovement
	{
		return this._AllByCode.get(code);
	}
}
