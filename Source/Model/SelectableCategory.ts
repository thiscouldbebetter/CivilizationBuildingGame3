
class SelectableCategory
{
	index: number;
	name: string;

	constructor(index: number, name: string)
	{
		this.index = index;
		this.name = name;
	}

	static _instances: SelectableCategory_Instances;
	static Instances(): SelectableCategory_Instances
	{
		if (SelectableCategory._instances == null)
		{
			SelectableCategory._instances = new SelectableCategory_Instances();
		}
		return SelectableCategory._instances;
	}

	static byName(name: string): SelectableCategory
	{
		return SelectableCategory.Instances().byName(name);
	}
}

class SelectableCategory_Instances
{
	Bases: SelectableCategory;
	Units: SelectableCategory;
	_All: SelectableCategory[];
	_AllByName: Map<string, SelectableCategory>;

	constructor()
	{
		this.Bases = new SelectableCategory(0, "Bases");
		this.Units = new SelectableCategory(1, "Units");

		this._All =
		[
			this.Bases,
			this.Units
		];

		this._AllByName = new Map
		(
			this._All.map
			(
				(x: SelectableCategory) => [x.name, x]
			)
		);
	}

	byName(name: string): SelectableCategory
	{
		return this._AllByName.get(name);
	}
}
