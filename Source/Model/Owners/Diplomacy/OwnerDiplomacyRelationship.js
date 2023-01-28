
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
