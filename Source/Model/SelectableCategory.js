"use strict";
class SelectableCategory {
    constructor(index, name) {
        this.index = index;
        this.name = name;
    }
    static Instances() {
        if (SelectableCategory._instances == null) {
            SelectableCategory._instances = new SelectableCategory_Instances();
        }
        return SelectableCategory._instances;
    }
    static byName(name) {
        return SelectableCategory.Instances().byName(name);
    }
}
class SelectableCategory_Instances {
    constructor() {
        this.Bases = new SelectableCategory(0, "Bases");
        this.Units = new SelectableCategory(1, "Units");
        this._All =
            [
                this.Bases,
                this.Units
            ];
        this._AllByName = new Map(this._All.map(x => [x.name, x]));
    }
}
