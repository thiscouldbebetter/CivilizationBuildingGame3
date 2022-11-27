
class Direction
{
	constructor(name, code, offset)
	{
		this.name = name;
		this.code = code;
		this.offset = offset;
	}

	static Instances()
	{
		if (Direction._instances == null)
		{
			Direction._instances = new Direction_Instances();
		}
		return Direction._instances;
	}

	static byCode(code)
	{
		return Direction.Instances().byCode(code);
	}
}

class Direction_Instances
{
	constructor()
	{
		this.East = new Direction("East", "e", new Coords(1, 0) );
		this.North = new Direction("North", "n", new Coords(0, -1) );
		this.Northeast = new Direction("Northeast", "ne", new Coords(1, -1) );
		this.Northwest = new Direction("Northwest", "nw", new Coords(-1, -1) );
		this.South = new Direction("South", "s", new Coords(0, 1) );
		this.Southeast = new Direction("Southeast", "se", new Coords(1, 1) );
		this.Southwest = new Direction("Southwest", "sw", new Coords(-1, 1) );
		this.West = new Direction("West", "w", new Coords(-1, 0) );

		this._All =
		[
			this.East,
			this.Southeast,
			this.South,
			this.Southwest,
			this.West,
			this.Northwest,
			this.North,
			this.Northeast
		];

		this._AllByCode = new Map(this._All.map(x => [x.code, x] ) );
	}

	byCode(code)
	{
		return this._AllByCode.get(code);
	}
}
