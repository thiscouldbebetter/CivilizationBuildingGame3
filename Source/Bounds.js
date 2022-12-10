
class Bounds
{
	constructor(min, max)
	{
		this.min = min;
		this.max = max;

		this.size = Coords.create();
	}

	static create()
	{
		return new Bounds(Coords.create(), Coords.create());
	}

	static fromMinAndMax(min, max)
	{
		return new Bounds(min, max);
	}

	recalculate()
	{
		this.size.overwriteWith(this.max).subtract(this.min);
		return this;
	}

	setFromCoordsMany(coordsGroup)
	{
		var coordsFirst = coordsGroup[0];

		this.min.overwriteWith(coordsFirst);
		this.max.overwriteWith(coordsFirst);

		for (var i = 1; i < coordsGroup.length; i++)
		{
			var coords = coordsGroup[i];

			if (coords.x < this.min.x)
			{
				this.min.x = coords.x;
			}
			if (coords.y < this.min.y)
			{
				this.min.y = coords.y;
			}
			if (coords.z < this.min.z)
			{
				this.min.z = coords.z;
			}

			if (coords.x > this.max.x)
			{
				this.max.x = coords.x;
			}
			if (coords.y > this.max.y)
			{
				this.max.y = coords.y;
			}
			if (coords.z > this.max.z)
			{
				this.max.z = coords.z;
			}
		}

		this.recalculate();

		return this;
	}
