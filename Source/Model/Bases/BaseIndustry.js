"use strict";
class BaseIndustry {
    constructor(buildableInProgressName, industryStockpiled) {
        this.buildableInProgressName = buildableInProgressName;
        this.industryStockpiled = industryStockpiled || 0;
    }
    static default() {
        return new BaseIndustry(null, 0);
    }
    buildableStart(buildableToBuild, world, owner, base) {
        var buildableName = buildableToBuild.name;
        if (buildableToBuild == null) {
            throw new Error("Unrecognized buildable name: " + buildableName);
        }
        else if (owner.canBuildBuildable(buildableToBuild) == false) {
            throw new Error("Cannot build buildable with name: " + buildableName);
        }
        else {
            this.buildableInProgressName = buildableName;
            this.industryStockpiled = 0;
        }
    }
    buildableInProgress(world, base) {
        var returnValue = null;
        if (this.buildableInProgressName != null) {
            returnValue = BaseBuildable.byName(this.buildableInProgressName);
        }
        return returnValue;
    }
    buildableInProgressBuild(world, base) {
        var buildableInProgress = this.buildableInProgress(world, base);
        buildableInProgress.build(world, base);
        this.buildableInProgressClear();
    }
    buildableInProgressClear() {
        this.buildableInProgressName = null;
        this.industryStockpiled = 0;
    }
    canBuildBuildable(buildable, world, base) {
        var owner = base.owner(world);
        var canBuild = owner.canBuildBuildable(buildable);
        // todo - Some bases can't build some things, for instance, boats.
        return canBuild;
    }
    toString(world, base) {
        var buildableInProgress = this.buildableInProgress(world, base);
        var buildableDetails = "";
        if (buildableInProgress == null) {
            buildableDetails = "[nothing]";
        }
        else {
            buildableDetails =
                buildableInProgress.name
                    + " "
                    + this.industryStockpiled
                    + "/"
                    + buildableInProgress.industryToBuild;
        }
        var returnValue = "Building: " + buildableDetails;
        return returnValue;
    }
    turnUpdate(world, base) {
        var buildableInProgress = this.buildableInProgress(world, base);
        if (buildableInProgress != null) {
            var industryThisTurnNet = base.industryThisTurnNet(world);
            this.industryStockpiled += industryThisTurnNet;
            if (this.industryStockpiled < 0) {
                var unitsSupported = base.unitsSupported(world);
                var unitToBeDisbanded = unitsSupported[unitsSupported.length - 1];
                world.unitRemove(unitToBeDisbanded);
                var message = "Base '" + base.name
                    + "' could not support unit '" + unitToBeDisbanded.defnName
                    + "', disbanding.";
                var owner = base.owner(world);
                owner.notifyByMessageForWorld(message, world);
                this.buildableInProgressClear();
            }
            else {
                var industryRequired = buildableInProgress.industryToBuild;
                if (this.industryStockpiled >= industryRequired) {
                    this.buildableInProgressBuild(world, base);
                }
            }
        }
    }
}
