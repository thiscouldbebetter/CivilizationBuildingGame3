
class OwnerDiplomacyRelationship
{
	ownerOtherName: string;
	postureName: string;
	embassyHasBeenEstablished: boolean;

	timesSneakAttacksExecuted: number;
	timesWarDeclaredBeforeAgression: number;
	timesWarThreatened: number;
	turnsOfPeace: number;

	constructor
	(
		ownerOther: Owner,
		posture: OwnerDiplomacyPosture,
		embassyHasBeenEstablished: boolean
	)
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

	static fromOwnerOther(ownerOther: Owner): OwnerDiplomacyRelationship
	{
		return new OwnerDiplomacyRelationship
		(
			ownerOther,
			OwnerDiplomacyPosture.Instances().Unknown,
			false // embassyHasBeenEstablished
		);
	}

	ownerOther(world: World): Owner
	{
		return world.ownerByName(this.ownerOtherName);
	}

	posture(): OwnerDiplomacyPosture
	{
		return OwnerDiplomacyPosture.byName(this.postureName);
	}

	postureSetTo(postureToSet: OwnerDiplomacyPosture, world: World): void
	{
		this.postureName = postureToSet.name;
		var ownerOther = this.ownerOther(world);
		var ownerOtherRelationship = ownerOther.relationshipWithOwner(ownerOther);
		ownerOtherRelationship.postureName = postureToSet.name;
	}

	// Convenience methods.

	postureSetToAlliance(world: World): void
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Alliance, world);
	}

	postureSetToPeace(world: World): void
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Peace, world);
	}

	postureSetToUncontacted(world: World): void
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().Uncontacted, world);
	}

	postureSetToWar(world: World): void
	{
		this.postureSetTo(OwnerDiplomacyPosture.Instances().War, world);
	}
}
