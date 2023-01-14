
class OwnerDiplomacy
{
	constructor()
	{
		this.relationshipsByOwnerName = new Map([]);
	}

	static default()
	{
		return new OwnerDiplomacy();
	}

	ownerIsAttackable(ownerOther)
	{
		var relationship = this.relationshipWithOwner(ownerOther);
		var posture = relationship.posture();
		isAttackable = posture.isAttackable();
		return isAttackable;
	}

	ownerIsKnown(ownerOther)
	{
		var relationship = this.relationshipWithOwner(ownerOther);
		var posture = relationship.posture();
		var isUnknown = posture.isUnknown();
		return (isUnknown == false);
	}

	relationshipWithOwner(ownerOther)
	{
		if (this.relationshipsByOwnerName.has(ownerOther.name) == false)
		{
			var relationship = OwnerDiplomacyRelationship.default();
			this.relationshipsByOwnerName.set(ownerOther.name, relationship);
		}
		return this.relationshipsByOwnerName.get(ownerOther.name);
	}
}

class OwnerDiplomacyPosture
{
	constructor(name)
	{
		this.name = name;
	}

	static Instances()
	{
		if (OwnerDiplomacyPosture._instances == null)
		{
			OwnerDiplomacyPosture._instances =
				new OwnerDiplomacyPosture_Instances();
		}
		return OwnerDiplomacyPosture._instances;
	}

	static byName(name)
	{
		return OwnerDiplomacyPosture.Instances().byName(name);
	}

	isAttackable()
	{
		return this.isUnknown() || this.isUncontacted() || this.isWar();
	}

	// Convenience methods.

	isAlliance()
	{
		return (this == OwnerDiplomacyPosture.Instances().Alliance);
	}

	isPeace()
	{
		return (this == OwnerDiplomacyPosture.Instances().Peace);
	}

	isUncontacted()
	{
		return (this == OwnerDiplomacyPosture.Instances().Uncontacted);
	}

	isUnknown()
	{
		return (this == OwnerDiplomacyPosture.Instances().Unknown);
	}

	isWar()
	{
		return (this == OwnerDiplomacyPosture.Instances().War);
	}
}

class OwnerDiplomacyPosture_Instances
{
	constructor()
	{
		this.Alliance = new OwnerDiplomacyPosture("Alliance");
		this.Peace = new OwnerDiplomacyPosture("Peace");
		this.Uncontacted = new OwnerDiplomacyPosture("Uncontacted");
		this.Unknown = new OwnerDiplomacyPosture("Unknown");
		this.War = new OwnerDiplomacyPosture("War");

		this._All =
		[
			this.Alliance,
			this.Peace,
			this.Uncontacted,
			this.Unknown,
			this.War
		];
		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
	}
}

class OwnerDiplomacyRelationship
{
	constructor(posture)
	{
		this.postureName = posture.name;

		// todo - Intelligence, reputation.
	}

	static default()
	{
		return new OwnerDiplomacyRelationship
		(
			OwnerDiplomacyPosture.Instances().Unknown
		);
	}

	posture()
	{
		return OwnerDiplomacyPosture.byName(this.postureName);
	}

	postureSetTo(postureToSet)
	{
		this.postureName = postureToSet.name;
	}

	// Convenience methods.

	postureSetToAlliance()
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Alliance);
	}

	postureSetToPeace()
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Peace);
	}

	postureSetToUncontacted()
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Uncontacted);
	}

	postureSetToWar()
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().War);
	}
}
