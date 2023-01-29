"use strict";
class Unit {
    constructor(ownerName, defnName, pos) {
        this.ownerName = ownerName;
        this.defnName = defnName;
        this.pos = pos;
        this.id = IdHelper.idNext();
        this.baseSupportingId = null;
        this._moveThirdsThisTurn = null;
        this.movesThisTurnClear();
        this._isSleeping = false;
        this._cellToPos = Coords.create();
    }
    baseSupporting(world) {
        return world.baseById(this.baseSupportingId);
    }
    baseSupportingSet(base) {
        this.baseSupportingId = base.id;
        base.unitSupport(this);
    }
    category() {
        return SelectableCategory.Instances().Units;
    }
    defn(world) {
        return world.defns.unitDefnByName(this.defnName);
    }
    fortify() {
        // todo
    }
    isAwake() {
        return (this.isSleeping() == false);
    }
    isIdle() {
        return (this.hasMovesThisTurn() && this.isAwake());
    }
    isSleeping() {
        return this._isSleeping;
    }
    initialize(world) {
        this.turnUpdate(world);
    }
    isInBaseSupporting(world) {
        return this.baseSupporting(world).pos.equals(this.pos);
    }
    owner(world) {
        return world.ownerByName(this.ownerName);
    }
    ownerSet(owner) {
        this.ownerName = owner.name;
    }
    select(world) {
        var owner = this.owner(world);
        owner.unitSelect(this);
    }
    sleep(world) {
        var activityDefns = UnitActivityDefn.Instances();
        this.activityDefnStartForWorld(activityDefns.Sleep, world);
    }
    toStringDetails(world) {
        var defn = this.defn(world);
        var lines = [
            "ID: " + this.id,
            "Type: " + this.defnName,
            "Position: " + this.pos.toString(),
            "Moves: " + this.movesThisTurn() + "/" + defn.movement.movesPerTurn(),
            defn.combat.toString()
        ];
        var linesJoined = lines.join("\n");
        return linesJoined;
    }
    toStringForList() {
        return this.id + ": " + this.defnName + " @" + this.pos.toString();
    }
    turnUpdate(world) {
        var defn = this.defn(world);
        this.moveThirdsThisTurnSet(defn.movement.moveThirdsPerTurn);
        this.activityUpdate(null, world);
    }
    // Activity.
    actionPromptForSelection(world) {
        var activityMove = this.activity();
        var activityDefnActionSelect = UnitActivityDefn.Instances().ActionSelect;
        this.activityDefnStartForWorldWithVariables(activityDefnActionSelect, world, activityMove.variableValuesByName);
    }
    actionSelect(actionToSelect, world) {
        var activityPromptForSelection = this.activity();
        this.activityDefnStartForWorldWithVariables(actionToSelect, world, activityPromptForSelection.variableValuesByName);
    }
    actionSelectDiplomatBribeUnit(world) {
        this.actionSelect(UnitActivityDefn.Instances().DiplomatBribeUnit, world);
    }
    activity() {
        return this._activity;
    }
    activityClear() {
        this.activitySet(null);
    }
    activityDefnStart(activityDefn) {
        this.activityDefnStartForWorld(activityDefn, null);
    }
    activityDefnStartForWorld(activityDefn, world) {
        this.activityDefnStartForWorldWithVariables(activityDefn, world, null);
    }
    activityDefnStartForWorldWithDirection(activityDefn, world, direction) {
        this.activityDefnStartForWorldWithVariableNameAndValue(activityDefn, world, UnitActivityVariableNames.Direction(), direction);
    }
    activityDefnStartForWorldWithVariableNameAndValue(activityDefn, world, variableName, variableValue) {
        this.activityDefnStartForWorldWithVariables(activityDefn, world, new Map([[variableName, variableValue]]));
    }
    activityDefnStartForWorldWithVariables(activityDefn, world, variableValuesByName) {
        var activity = new UnitActivity(activityDefn.name, variableValuesByName);
        this.activitySet(activity);
        this.activityUpdate(null, world);
    }
    activitySet(value) {
        this._activity = value;
    }
    activityUpdate(universe, world) {
        if (this._activity != null) {
            var owner = this.owner(world);
            this._activity.perform(universe, world, owner, this);
        }
    }
    hasActionsToSelectFromOnAttack(world) {
        var unitDefns = UnitDefn.Instances();
        var unitDefn = this.defn(world);
        var hasActions = (unitDefn == unitDefns.Diplomat
            || unitDefn == unitDefns.Spy);
        return hasActions;
    }
    isWaitingForActionSelection() {
        var activity = this.activity();
        var activityDefn = activity.defn();
        var isWaiting = (activityDefn == UnitActivityDefn.Instances().ActionSelect);
        return isWaiting;
    }
    // Combat.
    attackUnit(unitDefender, world) {
        var attackerDefnCombat = this.defn(world).combat;
        var defenderDefnCombat = unitDefender.defn(world).combat;
        var attackStrength = this.attackStrength(world);
        var defenseStrength = unitDefender.defenseStrength(world);
        var sumOfStrengths = attackStrength + defenseStrength;
        var attackRoll = Math.random() * sumOfStrengths;
        if (attackRoll <= attackStrength) {
            var damageInflicted = attackerDefnCombat.damagePerHit;
            unitDefender.integritySubtractDamage(damageInflicted, world);
        }
        else {
            var damageInflicted = defenderDefnCombat.damagePerHit;
            this.integritySubtractDamage(damageInflicted, world);
        }
    }
    attackStrength(world) {
        var defn = this.defn(world);
        var returnValue = defn.combat.attackStrength;
        // todo - Bonus for veteran status.
        return returnValue;
    }
    defenseStrength(world) {
        var defn = this.defn(world);
        var returnValue = defn.combat.attackStrength;
        // todo - Bonuses for fortification, improvements.
        return returnValue;
    }
    integritySubtractDamage(damage, world) {
        this.defn(world).combat.integritySubtractDamageFromUnit(damage, this);
    }
    isMilitary(world) {
        return (this.defn(world).combat.attackStrength > 0);
    }
    // Movement.
    canCarryPassengers(world) {
        return (this.defn(world).passengersMax > 0);
    }
    canMoveInDirection(directionToMove, world) {
        var costToMove = this.costToMoveInDirection(directionToMove, world);
        var canMove = (costToMove <= this.movesThisTurn());
        return canMove;
    }
    canMoveInDirectionEast(world) { return this.canMoveInDirection(Direction.Instances().East, world); }
    canMoveInDirectionNorth(world) { return this.canMoveInDirection(Direction.Instances().North, world); }
    canMoveInDirectionNortheast(world) { return this.canMoveInDirection(Direction.Instances().Northeast, world); }
    canMoveInDirectionNorthwest(world) { return this.canMoveInDirection(Direction.Instances().Northwest, world); }
    canMoveInDirectionSouth(world) { return this.canMoveInDirection(Direction.Instances().South, world); }
    canMoveInDirectionSoutheast(world) { return this.canMoveInDirection(Direction.Instances().Southeast, world); }
    canMoveInDirectionSouthwest(world) { return this.canMoveInDirection(Direction.Instances().Southwest, world); }
    canMoveInDirectionWest(world) { return this.canMoveInDirection(Direction.Instances().West, world); }
    cellsFromAndToForDirectionAndWorld(directionToMove, world) {
        var map = world.map;
        var cellFromPos = this.pos;
        var offsetToMove = directionToMove.offset;
        var cellToPos = this._cellToPos.overwriteWith(cellFromPos).add(offsetToMove);
        var cellFrom = map.cellAtPosInCells(cellFromPos);
        var cellTo = map.cellAtPosInCells(cellToPos);
        return [cellFrom, cellTo];
    }
    costToMoveInDirection(directionToMove, world) {
        return this.costToMoveInDirectionInThirds(directionToMove, world) / 3;
    }
    costToMoveInDirectionInThirds(directionToMove, world) {
        var cellsFromAndTo = this.cellsFromAndToForDirectionAndWorld(directionToMove, world);
        var cellFrom = cellsFromAndTo[0];
        var cellTo = cellsFromAndTo[1];
        var defn = this.defn(world);
        var costToMoveInThirds = defn.movement.costToMoveFromCellToCellInThirds(world, this, cellFrom, cellTo);
        return costToMoveInThirds;
    }
    hasMovesThisTurn() {
        return (this.moveThirdsThisTurn() > 0);
    }
    isGround(world) {
        return this.defn(world).isGround(world, this);
    }
    moveInDirection(directionToMove, world) {
        var activityDefns = UnitActivityDefn.Instances();
        var variableNameDirection = UnitActivityVariableNames.Direction();
        this.activityDefnStartForWorldWithVariableNameAndValue(activityDefns.Move, world, variableNameDirection, directionToMove);
    }
    moveInDirectionEast(world) { this.moveInDirection(Direction.Instances().East, world); }
    moveInDirectionNorth(world) { this.moveInDirection(Direction.Instances().North, world); }
    moveInDirectionNortheast(world) { this.moveInDirection(Direction.Instances().Northeast, world); }
    moveInDirectionNorthwest(world) { this.moveInDirection(Direction.Instances().Northwest, world); }
    moveInDirectionSouth(world) { this.moveInDirection(Direction.Instances().South, world); }
    moveInDirectionSoutheast(world) { this.moveInDirection(Direction.Instances().Southeast, world); }
    moveInDirectionSouthwest(world) { this.moveInDirection(Direction.Instances().Southwest, world); }
    moveInDirectionWest(world) { this.moveInDirection(Direction.Instances().West, world); }
    moveStartTowardPosInWorld(targetPos, world) {
        var activityDefns = UnitActivityDefn.Instances();
        this.activityDefnStartForWorldWithVariableNameAndValue(activityDefns.MoveTo, world, UnitActivityVariableNames.TargetPos(), targetPos);
    }
    moveThirdsThisTurn() {
        return this._moveThirdsThisTurn;
    }
    moveThirdsThisTurnSet(value) {
        this._moveThirdsThisTurn = value;
    }
    movesThisTurn() {
        return this.moveThirdsThisTurn() / 3;
    }
    movesThisTurnClear() {
        this.moveThirdsThisTurnSet(0);
    }
    ownerMapKnowledgeUpdate(world) {
        var owner = this.owner(world);
        var ownerMapKnowledge = owner.mapKnowledge;
        ownerMapKnowledge.update(null, world, owner);
    }
}
