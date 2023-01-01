
class UnitDefnCombat
{
	constructor(attack, defense, integrityMaxOver10, damagePerHit)
	{
		this.attack = attack;
		this.defense = defense;
		this.integrityMax = integrityMaxOver10 * 10;
		this.damagePerHit = damagePerHit;
	}

	unitAttackDefender(attacker, defender, world)
	{
		var attackerDefn = this.defn(world);
		var defenderDefn = defender.defn(world);
		
		var attackerCombat = attackerDefn.combat;
		var defenderCombat = defenderDefn.combat;

		var attackOfAttacker = attackerDefn.combat.attack;
		var defenseOfDefender = defenderDefn.combat.defense;

		var attackOfAttackerPlusDefenseOfDefender =
			attackOfAttacker + defenseOfDefender;
		var attackerAttackRoll =
			Math.random() * attackOfAttackerPlusDefenseOfDefender;

		if (attackerAttackRoll > defenseOfDefender)
		{
			defender.integritySubtract(attackerCombat.damagePerHit, world);
		}
		else
		{
			this.integritySubtract(defenderCombat.damagePerHit, world);
		}
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
