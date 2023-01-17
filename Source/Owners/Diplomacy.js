
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
		var isAttackable = posture.isAttackable();
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
			var relationship =
				OwnerDiplomacyRelationship.fromOwnerOther(ownerOther);
			this.relationshipsByOwnerName.set(ownerOther.name, relationship);
		}
		return this.relationshipsByOwnerName.get(ownerOther.name);
	}

	// Reputation.

	timesSneakAttacksExecuted()
	{
		var countSoFar = 0;
		var ownerNames = this.relationshipsByOwnerName.keys;
		ownerNames.forEach
		(
			ownerName =>
			{
				var relationship =
					this.relationshipsByOwnerName.get(ownerName);
				countSoFar += relationship.timesSneakAttacksExecuted;
			}
		);
		return countSoFar;
	}

	timesWarDeclaredBeforeAgression()
	{
		var countSoFar = 0;
		var ownerNames = this.relationshipsByOwnerName.keys;
		ownerNames.forEach
		(
			ownerName =>
			{
				var relationship =
					this.relationshipsByOwnerName.get(ownerName);
				countSoFar += relationship.timesWarDeclaredBeforeAgression;
			}
		);
		return countSoFar;
	}

	timesWarThreatened()
	{
		var countSoFar = 0;
		var ownerNames = this.relationshipsByOwnerName.keys;
		ownerNames.forEach
		(
			ownerName =>
			{
				var relationship =
					this.relationshipsByOwnerName.get(ownerName);
				countSoFar += relationship.timesWarThreatened;
			}
		);
		return countSoFar;
	}

	turnsOfPeaceWithOwnersOther()
	{
		var countSoFar = 0;
		var ownerNames = this.relationshipsByOwnerName.keys;
		ownerNames.forEach
		(
			ownerName =>
			{
				var relationship =
					this.relationshipsByOwnerName.get(ownerName);
				countSoFar += relationship.turnsOfPeace;
			}
		);
		return countSoFar;
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
	constructor(ownerOther, posture, embassyHasBeenEstablished)
	{
		this.ownerOtherName = ownerOther.name;
		this.postureName = posture.name;
		this.embassyHasBeenEstablished = embassyHasBeenEstablished;

		// todo - Intelligence.

		// Reputation.
		this.timesSneakAttacksExecuted = 0;
		this.timesWarDeclaredBeforeAgression = 0;
		this.timesWarThreatened = 0;
		this.turnsOfPeace = 0;
	}

	static fromOwnerOther(ownerOther)
	{
		return new OwnerDiplomacyRelationship
		(
			ownerOther,
			OwnerDiplomacyPosture.Instances().Unknown,
			false // embassyHasBeenEstablished
		);
	}

	ownerOther(world)
	{
		return world.ownerByName(this.ownerOtherName);
	}

	posture()
	{
		return OwnerDiplomacyPosture.byName(this.postureName);
	}

	postureSetTo(postureToSet, world)
	{
		this.postureName = postureToSet.name;
		var ownerOther = this.ownerOther(world);
		var ownerOtherRelationship = ownerOther.relationshipWithOwner(ownerOther);
		ownerOtherRelationship.postureName = postureToSet.name;
	}

	// Convenience methods.

	postureSetToAlliance(world)
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Alliance, world);
	}

	postureSetToPeace(world)
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Peace, world);
	}

	postureSetToUncontacted(world)
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Uncontacted, world);
	}

	postureSetToWar(world)
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().War, world);
	}
}
