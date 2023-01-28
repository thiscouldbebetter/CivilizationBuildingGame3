
class Direction
{
	name: string;
	code: string;
	offset: Coords;

	constructor(name: string, code: string, offset: Coords)
	{
		this.name = name;
		this.code = code;
		this.offset = offset;
	}

	static byOffset(offset: Coords): Direction
	{
		return Direction.Instances().byOffset(offset);
	}

	static _instances: Direction_Instances
	static Instances(): Direction_Instances
	{
		if (Direction._instances == null)
		{
			Direction._instances = new Direction_Instances();
		}
		return Direction._instances;
	}

	static byCode(code: string): Direction
	{
		return Direction.Instances().byCode(code);
	}
}

class Direction_Instances
{
	East: Direction;
	North: Direction;
	Northeast: Direction;
	Northwest: Direction;
	South: Direction;
	Southeast: Direction;
	Southwest: Direction;
	West: Direction;

	_All: Direction[];

	_AllByCode: Map<string, Direction>;

	constructor()
	{
		this.East = new Direction("East", "e", Coords.fromXY(1, 0) );
		this.North = new Direction("North", "n", Coords.fromXY(0, -1) );
		this.Northeast = new Direction("Northeast", "ne", Coords.fromXY(1, -1) );
		this.Northwest = new Direction("Northwest", "nw", Coords.fromXY(-1, -1) );
		this.South = new Direction("South", "s", Coords.fromXY(0, 1) );
		this.Southeast = new Direction("Southeast", "se", Coords.fromXY(1, 1) );
		this.Southwest = new Direction("Southwest", "sw", Coords.fromXY(-1, 1) );
		this.West = new Direction("West", "w", Coords.fromXY(-1, 0) );

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

		this._AllByCode = new Map(this._All.map((x: Direction) => [x.code, x] ) );
	}

	byCode(code: string): Direction
	{
		return this._AllByCode.get(code);
	}

	byOffset(offset: Coords): Direction
	{
		return this._All.find(x => x.offset.equals(offset));
	}
}
