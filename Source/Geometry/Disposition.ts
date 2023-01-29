
class Disposition
{
	pos: Coords;
	ori: Orientation;

	constructor(pos: Coords, ori: Orientation)
	{
		this.pos = pos;
		this.ori = ori;
	}

	static fromPos(pos: Coords): Disposition
	{
		return new Disposition(pos, Orientation.default());
	}
}