
class Coords
{
	constructor(x, y, z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static create()
	{
		return new Coords(0, 0, 0);
	}

	static fromXY(x, y)
	{
		return new Coords(x, y, 0);
	}

	static ones()
	{
		return new Coords(1, 1, 1);
	}

	static random()
	{
		return Coords.create().randomize();
	}

	static zeroes()
	{
		return new Coords(0, 0, 0);
	}

	absolute()
	{
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		this.z = Math.abs(this.z);
		return this;
	}

	add(other)
	{
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	clear()
	{
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	}

	clone()
	{
		return new Coords(this.x, this.y, this.z);
	}

	crossProduct(other)
	{
		this.overwriteWithDimensions
		(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x
		);
		return this;
	}

	directions()
	{
		this.x = (this.x == 0 ? 0 : this.x / Math.abs(this.x) );
		this.y = (this.y == 0 ? 0 : this.y / Math.abs(this.y) );
		this.z = (this.z == 0 ? 0 : this.z / Math.abs(this.z) );
		return this;
	}

	divideScalar(scalar)
	{
		this.x /= scalar;
		this.y /= scalar;
		this.z /= scalar;
		return this;
	}

	dotProduct(other)
	{
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	equals(other)
	{
		var areDimensionsEqual =
		(
			this.x == other.x
			&& this.y == other.y
			&& this.z == other.z
		);

		return areDimensionsEqual;
	}

	floor()
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	}

	half()
	{
		return this.divideScalar(2);
	}

	magnitude()
	{
		return Math.sqrt
		(
			this.x * this.x + this.y * this.y + this.z * this.z
		);
	}

	multiply(other)
	{
		this.x *= other.x;
		this.y *= other.y;
		this.z *= other.z;
		return this;
	}

	multiplyScalar(scalar)
	{
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	overwriteWith(other)
	{
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		return this;
	}

	overwriteWithDimensions(x, y, z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	randomize()
	{
		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		return this;
	}

	round()
	{
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		return this;
	}

	subtract(other)
	{
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	sumOfDimensions()
	{
		return this.x + this.y + this.z;
	}

	toString()
	{
		return this.x + "," + this.y + "," + this.z;
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
