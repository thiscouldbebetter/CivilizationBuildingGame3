"use strict";
class OwnerDiplomacy {
    constructor() {
        this.relationshipsByOwnerName = new Map([]);
    }
    static default() {
        return new OwnerDiplomacy();
    }
    ownerIsAttackable(ownerOther) {
        var relationship = this.relationshipWithOwner(ownerOther);
        var posture = relationship.posture();
        var isAttackable = posture.isAttackable();
        return isAttackable;
    }
    ownerIsKnown(ownerOther) {
        var relationship = this.relationshipWithOwner(ownerOther);
        var posture = relationship.posture();
        var isUnknown = posture.isUnknown();
        return (isUnknown == false);
    }
    relationshipWithOwner(ownerOther) {
        if (this.relationshipsByOwnerName.has(ownerOther.name) == false) {
            var relationship = OwnerDiplomacyRelationship.fromOwnerOther(ownerOther);
            this.relationshipsByOwnerName.set(ownerOther.name, relationship);
        }
        return this.relationshipsByOwnerName.get(ownerOther.name);
    }
    // Reputation.
    timesSneakAttacksExecuted() {
        var countSoFar = 0;
        var ownerNames = this.relationshipsByOwnerName.keys;
        ownerNames.forEach(ownerName => {
            var relationship = this.relationshipsByOwnerName.get(ownerName);
            countSoFar += relationship.timesSneakAttacksExecuted;
        });
        return countSoFar;
    }
    timesWarDeclaredBeforeAgression() {
        var countSoFar = 0;
        var ownerNames = this.relationshipsByOwnerName.keys;
        ownerNames.forEach(ownerName => {
            var relationship = this.relationshipsByOwnerName.get(ownerName);
            countSoFar += relationship.timesWarDeclaredBeforeAgression;
        });
        return countSoFar;
    }
    timesWarThreatened() {
        var countSoFar = 0;
        var ownerNames = this.relationshipsByOwnerName.keys;
        ownerNames.forEach(ownerName => {
            var relationship = this.relationshipsByOwnerName.get(ownerName);
            countSoFar += relationship.timesWarThreatened;
        });
        return countSoFar;
    }
    turnsOfPeaceWithOwnersOther() {
        var countSoFar = 0;
        var ownerNames = this.relationshipsByOwnerName.keys;
        ownerNames.forEach(ownerName => {
            var relationship = this.relationshipsByOwnerName.get(ownerName);
            countSoFar += relationship.turnsOfPeace;
        });
        return countSoFar;
    }
}
