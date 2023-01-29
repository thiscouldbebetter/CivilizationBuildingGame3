
class Bounds
{
	max: Coords;
	min: Coords;
	_size: Coords;

	constructor(min: Coords, max: Coords)
	{
		this.min = min;
		this.max = max;
	}

	size(): Coords
	{
		return this._size.overwriteWith(this.max).subtract(this.min);
	}

	static ofPoints(points: Coords[]): Bounds
	{
		var point0 = points[0];
		var min = point0.clone();
		var max = point0.clone();

		for (var i = 1; i < points.length; i++)
		{
			var point = points[i];
			if (point.x < min.x)
			{
				min.x = point.x;
			}
			if (point.y < min.y)
			{
				min.y = point.y;
			}
			if (point.z < min.z)
			{
				min.z = point.z;
			}

			if (point.x > max.x)
			{
				max.x = point.x;
			}
			if (point.y > max.y)
			{
				max.y = point.y;
			}
			if (point.z > max.z)
			{
				max.z = point.z;
			}
		}

		var returnBounds = new Bounds(min, max);

		return returnBounds;
	}
}