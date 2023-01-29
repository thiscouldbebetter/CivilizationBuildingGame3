
class OwnerDiplomacy
{
	relationshipsByOwnerName: Map<string, OwnerDiplomacyRelationship>;

	constructor()
	{
		this.relationshipsByOwnerName = new Map([]);
	}

	static default(): OwnerDiplomacy
	{
		return new OwnerDiplomacy();
	}

	ownerIsAttackable(ownerOther: Owner): boolean
	{
		var relationship = this.relationshipWithOwner(ownerOther);
		var posture = relationship.posture();
		var isAttackable = posture.isAttackable();
		return isAttackable;
	}

	ownerIsKnown(ownerOther: Owner): boolean
	{
		var relationship = this.relationshipWithOwner(ownerOther);
		var posture = relationship.posture();
		var isUnknown = posture.isUnknown();
		return (isUnknown == false);
	}

	relationshipWithOwner(ownerOther: Owner): OwnerDiplomacyRelationship
	{
		if (this.relationshipsByOwnerName.has(ownerOther.name) == false)
		{
			var relationship =
				OwnerDiplomacyRelationship.fromOwnerOther(ownerOther);
			this.relationshipsByOwnerName.set(ownerOther.name, relationship);
		}
		return this.relationshipsByOwnerName.get(ownerOther.name);
	}

	// Reputation.

	timesSneakAttacksExecuted(): number
	{
		var countSoFar = 0;
		for (var ownerName in this.relationshipsByOwnerName.keys)
		{
			var relationship =
				this.relationshipsByOwnerName.get(ownerName);
			countSoFar += relationship.timesSneakAttacksExecuted;
		}
		return countSoFar;
	}

	timesWarDeclaredBeforeAgression(): number
	{
		var countSoFar = 0;
		for (var ownerName in this.relationshipsByOwnerName.keys)
		{
			var relationship =
				this.relationshipsByOwnerName.get(ownerName);
			countSoFar += relationship.timesWarDeclaredBeforeAgression;
		}
		return countSoFar;
	}

	timesWarThreatened(): number
	{
		var countSoFar = 0;
		for (var ownerName in this.relationshipsByOwnerName.keys)
		{
			var relationship =
				this.relationshipsByOwnerName.get(ownerName);
			countSoFar += relationship.timesWarThreatened;
		}
		return countSoFar;
	}

	turnsOfPeaceWithOwnersOther(): number
	{
		var countSoFar = 0;
		for (var ownerName in this.relationshipsByOwnerName.keys)
		{
			var relationship =
				this.relationshipsByOwnerName.get(ownerName);
			countSoFar += relationship.turnsOfPeace;
		}
		return countSoFar;
	}
}