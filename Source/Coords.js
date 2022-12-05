
class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	static create()
	{
		return new Coords(0, 0);
	}

	static ones()
	{
		return new Coords(1, 1);
	}

	static random()
	{
		return Coords.create().randomize();
	}

	static zeroes()
	{
		return new Coords(0, 0);
	}

	absolute()
	{
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	}

	add(other)
	{
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	clone()
	{
		return new Coords(this.x, this.y);
	}

	divideScalar(scalar)
	{
		this.x /= scalar;
		this.y /= scalar;
		return this;
	}

	equals(other)
	{
		var areDimensionsEqual =
		(
			this.x == other.x
			&& this.y == other.y
		);

		return areDimensionsEqual;
	}

	floor()
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	half()
	{
		return this.divideScalar(2);
	}

	magnitude()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	multiply(other)
	{
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}

	multiplyScalar(scalar)
	{
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	overwriteWith(other)
	{
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	overwriteWithXY(x, y)
	{
		this.x = x;
		this.y = y;
		return this;
	}

	randomize()
	{
		this.x = Math.random();
		this.y = Math.random();
		return this;
	}

	subtract(other)
	{
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	sumOfDimensions()
	{
		return this.x + this.y;
	}

	toString()
	{
		return this.x + "," + this.y;
	}

	wrapXTrimYToMax(max)
	{
		while (this.x < 0)
		{
			this.x += max.x;
		}
		while (this.x >= max.x)
		{
			this.x -= max.x;
		}

		if (this.y < 0)
		{
			this.y = 0;
		}
		else if (this.y > max.y)
		{
			this.y = max.y - 1; // hack
		}

		return this;
	}
}
