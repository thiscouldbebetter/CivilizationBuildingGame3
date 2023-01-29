"use strict";
class OwnerDiplomacyPosture {
    constructor(name) {
        this.name = name;
    }
    static Instances() {
        if (OwnerDiplomacyPosture._instances == null) {
            OwnerDiplomacyPosture._instances =
                new OwnerDiplomacyPosture_Instances();
        }
        return OwnerDiplomacyPosture._instances;
    }
    static byName(name) {
        return OwnerDiplomacyPosture.Instances().byName(name);
    }
    isAttackable() {
        return this.isUnknown() || this.isUncontacted() || this.isWar();
    }
    // Convenience methods.
    isAlliance() {
        return (this == OwnerDiplomacyPosture.Instances().Alliance);
    }
    isPeace() {
        return (this == OwnerDiplomacyPosture.Instances().Peace);
    }
    isUncontacted() {
        return (this == OwnerDiplomacyPosture.Instances().Uncontacted);
    }
    isUnknown() {
        return (this == OwnerDiplomacyPosture.Instances().Unknown);
    }
    isWar() {
        return (this == OwnerDiplomacyPosture.Instances().War);
    }
}
class OwnerDiplomacyPosture_Instances {
    constructor() {
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
        this._AllByName = new Map(this._All.map(x => [x.name, x]));
    }
    byName(name) {
        return this._AllByName.get(name);
    }
}
