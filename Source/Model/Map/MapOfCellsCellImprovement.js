
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
