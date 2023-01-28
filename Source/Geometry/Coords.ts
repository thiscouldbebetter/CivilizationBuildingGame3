
class Coords
{
	x: number;
	y: number;
	z: number;

	constructor(x: number, y: number, z: number)
	{
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static create(): Coords
	{
		return new Coords(0, 0, 0);
	}

	static fromXY(x: number, y: number): Coords
	{
		return new Coords(x, y, 0);
	}

	static ones(): Coords
	{
		return new Coords(1, 1, 1);
	}

	static random(): Coords
	{
		return Coords.create().randomize();
	}

	static zeroes(): Coords
	{
		return new Coords(0, 0, 0);
	}

	absolute(): Coords
	{
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		this.z = Math.abs(this.z);
		return this;
	}

	add(other: Coords): Coords
	{
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}

	addXY(x: number, y: number): Coords
	{
		this.x += x;
		this.y += y;
		return this;
	}

	clear(): Coords
	{
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	}

	clone(): Coords
	{
		return new Coords(this.x, this.y, this.z);
	}

	crossProduct(other: Coords): Coords
	{
		this.overwriteWithDimensions
		(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x
		);
		return this;
	}

	directions(): Coords
	{
		this.x = (this.x == 0 ? 0 : this.x / Math.abs(this.x) );
		this.y = (this.y == 0 ? 0 : this.y / Math.abs(this.y) );
		this.z = (this.z == 0 ? 0 : this.z / Math.abs(this.z) );
		return this;
	}

	divideScalar(scalar: number): Coords
	{
		this.x /= scalar;
		this.y /= scalar;
		this.z /= scalar;
		return this;
	}

	dotProduct(other: Coords): number
	{
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	equals(other: Coords): boolean
	{
		var areDimensionsEqual =
		(
			this.x == other.x
			&& this.y == other.y
			&& this.z == other.z
		);

		return areDimensionsEqual;
	}

	floor(): Coords
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	}

	half(): Coords
	{
		return this.divideScalar(2);
	}

	isInRangeMaxExclusive(max: Coords): boolean
	{
		var returnValue =
		(
			this.x >= 0
			&& this.x < max.x
			&& this.y >= 0
			&& this.y < max.y
		);
		return returnValue;
	}

	isYInRangeMaxExclusive(max: Coords): boolean
	{
		return (this.y >= 0 && this.y < max.y);
	}

	magnitude(): number
	{
		return Math.sqrt
		(
			this.x * this.x + this.y * this.y + this.z * this.z
		);
	}

	multiply(other: Coords): Coords
	{
		this.x *= other.x;
		this.y *= other.y;
		this.z *= other.z;
		return this;
	}

	multiplyScalar(scalar: number): Coords
	{
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	normalize(): Coords
	{
		var magnitude = this.magnitude();
		if (magnitude != null)
		{
			this.divideScalar(magnitude);
		}
		return this;
	}

	overwriteWith(other: Coords): Coords
	{
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		return this;
	}

	overwriteWithDimensions(x: number, y: number, z: number): Coords
	{
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	randomize(): Coords
	{
		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		return this;
	}

	round(): Coords
	{
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		return this;
	}

	subtract(other: Coords): Coords
	{
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}

	sumOfDimensions(): number
	{
		return this.x + this.y + this.z;
	}

	toString(): string
	{
		return this.x + "," + this.y + "," + this.z;
	}

	toStringXY(): string
	{
		return this.x + "," + this.y;
	}

	wrapXToMax(max: Coords): Coords
	{
		while (this.x < 0)
		{
			this.x += max.x;
		}
		while (this.x >= max.x)
		{
			this.x -= max.x;
		}

		return this;
	}

	wrapXTrimYToMax(max: Coords): Coords
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
