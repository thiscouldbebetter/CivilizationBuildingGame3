
class UnitDefnCombat
{
	attackStrength: number;
	defenseStrength: number;
	integrityMax: number;
	damagePerHit: number;

	constructor
	(
		attackStrength: number,
		defenseStrength: number,
		integrityMaxOver10: number,
		damagePerHit: number
	)
	{
		this.attackStrength = attackStrength;
		this.defenseStrength = defenseStrength;
		this.integrityMax = integrityMaxOver10 * 10;
		this.damagePerHit = damagePerHit;
	}

	integritySubtractDamageFromUnit
	(
		damage: number, unit: Unit
	): void
	{
		unit.integrity -= damage;
		if (unit.integrity <= 0)
		{
			// todo
		}
	}

	toString(): string
	{
		return "Attack/Defense: " + this.attackStrength + "/" + this.defenseStrength;
	}
}
