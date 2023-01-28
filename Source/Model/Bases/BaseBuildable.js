"use strict";
class BaseBuildable {
    static byName(name) {
        var returnValue = null;
        var unitDefn = UnitDefn.byName(name);
        if (unitDefn != null) {
            returnValue = unitDefn;
        }
        else {
            var improvementDefn = BaseImprovementDefn.byName(name);
            if (improvementDefn != null) {
                returnValue = improvementDefn;
            }
            else {
                var starshipPart = StarshipPart.byName(name);
                returnValue = starshipPart;
            }
        }
        return returnValue;
    }
}
