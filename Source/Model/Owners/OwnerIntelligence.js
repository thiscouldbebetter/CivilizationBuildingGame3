"use strict";
class OwnerIntelligence {
    constructor(name, commandChoose) {
        this.name = name;
        this._commandChoose = commandChoose;
    }
    static human() {
        return new OwnerIntelligence("Human", () => null);
    }
    static machine() {
        return new OwnerIntelligence("Machine", () => null);
    }
    commandChoose() {
        return this._commandChoose();
    }
}
