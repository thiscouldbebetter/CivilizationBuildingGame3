
class UnitDefnCombat
{
	constructor(attackStrength, defenseStrength, integrityMaxOver10, damagePerHit)
	{
		this.attackStrength = attackStrength;
		this.defenseStrength = defenseStrength;
		this.integrityMax = integrityMaxOver10 * 10;
		this.damagePerHit = damagePerHit;
	}

	integritySubtractDamageFromUnit(damage, unit)
	{
		unit.integrity -= damage;
		if (unit.integrity <= 0)
		{
			// todo
		}
	}

	toString()
	{
		return "Attack/Defense: " + this.attack + "/" + this.defense;
	}
}
