"use strict";
class OwnerMapKnowledge {
    constructor(cellsKnownIndices) {
        cellsKnownIndices = cellsKnownIndices || [];
        this.cellsKnownIndicesByIndex =
            new Map(cellsKnownIndices.map(x => [x, x]));
        this.cellsVisibleIndicesByIndex = new Map();
        this._cellAdjacentPos = Coords.create();
        this._cellOffsetPos = Coords.create();
    }
    static default() {
        return new OwnerMapKnowledge(null);
    }
    draw(universe, world, owner) {
        var mapComplete = world.map;
        var mapSizeInCells = mapComplete.sizeInCells;
        var cellSizeInPixels = Coords.ones().multiplyScalar(16);
        var cellSizeInPixelsHalf = cellSizeInPixels.clone().half();
        var cellPosInCells = Coords.create();
        var cellPosInPixels = Coords.create();
        var display = universe.display;
        display.drawBackground("Black");
        this.draw_1_CellsKnown(cellPosInCells, mapSizeInCells, mapComplete, cellPosInPixels, cellSizeInPixels, world, owner, display);
        var basesAndUnitsVisible = this.draw_2_CellsVisible(cellPosInCells, mapSizeInCells, mapComplete, cellPosInPixels, cellSizeInPixels, world, display);
        var cellSizeInPixelsHalf = cellSizeInPixels.clone().half();
        var cellCenterInPixels = Coords.create();
        var basesVisible = basesAndUnitsVisible[0];
        this.draw_3_BasesVisible(owner, basesVisible, cellPosInPixels, cellSizeInPixels, cellCenterInPixels, cellSizeInPixelsHalf, world, display);
        var unitsVisible = basesAndUnitsVisible[1];
        this.draw_4_UnitsVisible(owner, unitsVisible, cellPosInPixels, cellSizeInPixels, cellCenterInPixels, cellSizeInPixelsHalf, world, display);
    }
    draw_1_CellsKnown(cellPosInCells, mapSizeInCells, mapComplete, cellPosInPixels, cellSizeInPixels, world, owner, display) {
        var camera = owner.camera;
        var cellsKnownIndices = Array.from(this.cellsKnownIndicesByIndex.keys());
        for (var c = 0; c < cellsKnownIndices.length; c++) {
            var cellIndex = cellsKnownIndices[c];
            mapComplete.cellIndexToPosInCells(cellIndex, cellPosInCells);
            var cell = mapComplete.cellAtPosInCells(cellPosInCells);
            cellPosInPixels.overwriteWith(cellPosInCells).multiply(cellSizeInPixels);
            camera.coordsTransformFromWorldToView(cellPosInPixels);
            var terrain = cell.terrain(world);
            var terrainColorName = terrain.colorName;
            display.drawRectangle(cellPosInPixels, cellSizeInPixels, terrainColorName, "Gray");
            var isCellCurrentlyVisible = this.cellsVisibleIndicesByIndex.has(cellIndex);
            if (isCellCurrentlyVisible == false) {
                display.drawRectangle(cellPosInPixels, cellSizeInPixels, "rgba(0, 0, 0, 0.5)", null);
            }
        }
    }
    draw_2_CellsVisible(cellPosInCells, mapSizeInCells, mapComplete, cellPosInPixels, cellSizeInPixels, world, display) {
        var basesVisible = [];
        var unitsVisible = [];
        var cellsVisibleIndices = Array.from(this.cellsVisibleIndicesByIndex.keys());
        for (var c = 0; c < cellsVisibleIndices.length; c++) {
            var cellIndex = cellsVisibleIndices[c];
            cellPosInCells.overwriteWithDimensions(cellIndex % mapSizeInCells.x, Math.floor(cellIndex / mapSizeInCells.x), 0);
            var cell = mapComplete.cellAtPosInCells(cellPosInCells);
            cellPosInPixels.overwriteWith(cellPosInCells).multiply(cellSizeInPixels);
            var basePresent = cell.basePresent(world);
            if (basePresent != null) {
                basesVisible.push(basePresent);
            }
            var unitsPresent = cell.unitsPresent(world);
            unitsVisible.push(...unitsPresent);
        }
        var basesAndUnitsVisible = [basesVisible, unitsVisible];
        return basesAndUnitsVisible;
    }
    draw_3_BasesVisible(owner, basesVisible, cellPosInPixels, cellSizeInPixels, cellCenterInPixels, cellSizeInPixelsHalf, world, display) {
        var baseSelected = owner.baseSelected();
        basesVisible.forEach(base => {
            cellPosInPixels.overwriteWith(base.pos).multiply(cellSizeInPixels);
            cellCenterInPixels.overwriteWith(cellPosInPixels).add(cellSizeInPixelsHalf);
            var baseOwner = base.owner(world);
            var baseColorName = baseOwner.colorName;
            var isSelected = (base == baseSelected);
            var borderColor = (isSelected ? "White" : "Gray");
            display.drawRectangle(cellPosInPixels, cellSizeInPixels, baseColorName, borderColor);
            display.drawText(base.name, cellCenterInPixels, borderColor);
        });
    }
    draw_4_UnitsVisible(owner, unitsVisible, cellPosInPixels, cellSizeInPixels, cellCenterInPixels, cellSizeInPixelsHalf, world, display) {
        var cellRadiusInPixels = cellSizeInPixelsHalf.x;
        var unitSelected = owner.unitSelected();
        unitsVisible.forEach(unit => {
            cellPosInPixels.overwriteWith(unit.pos).multiply(cellSizeInPixels);
            cellCenterInPixels.overwriteWith(cellPosInPixels).add(cellSizeInPixelsHalf);
            var unitDefn = unit.defn(world);
            var unitSymbol = unitDefn.symbol;
            var unitOwner = unit.owner(world);
            var unitOwnerColorName = unitOwner.colorName;
            var fillColorName = unitOwnerColorName;
            var isSelected = (unit == unitSelected);
            var borderColorName = (isSelected && unit.isAwake()
                ? "White"
                : "Gray");
            display.drawCircle(cellCenterInPixels, cellRadiusInPixels, fillColorName, borderColorName);
            if (unit.isSleeping()) {
                display.drawCircle(cellCenterInPixels, cellRadiusInPixels, "rgb(255, 255, 255, 0.25)", null);
            }
            display.drawText(unitSymbol, cellCenterInPixels, borderColorName);
        });
    }
    update(universe, world, owner) {
        this.cellsVisibleIndicesByIndex = new Map();
        var ownerViewerGroups = [
            owner.bases,
            owner.units
        ];
        for (var g = 0; g < ownerViewerGroups.length; g++) {
            var ownerViewers = ownerViewerGroups[g];
            var sightDistance = (g == 0 ? 2 : 1); // hack - A base's field of view isn't square.
            this.update_Group(world, owner, ownerViewers, sightDistance);
        }
    }
    update_Group(world, owner, ownerViewers, sightDistance) {
        var cellOffsetPos = this._cellOffsetPos;
        for (var i = 0; i < ownerViewers.length; i++) {
            var viewer = ownerViewers[i];
            var viewerPos = viewer.pos;
            for (var y = -sightDistance; y <= sightDistance; y++) {
                cellOffsetPos.y = y;
                for (var x = -sightDistance; x <= sightDistance; x++) {
                    cellOffsetPos.x = x;
                    this.update_Group_CellOffset(world, owner, viewerPos, cellOffsetPos);
                }
            }
        }
    }
    update_Group_CellOffset(world, owner, viewerPos, cellOffsetPos) {
        var map = world.map;
        var mapSizeInCells = map.sizeInCells;
        var cellAdjacentPos = this._cellAdjacentPos.overwriteWith(viewerPos).add(cellOffsetPos).wrapXToMax(mapSizeInCells);
        if (cellAdjacentPos.isInRangeMaxExclusive(mapSizeInCells)) {
            var cellAdjacentIndex = cellAdjacentPos.y * mapSizeInCells.x + cellAdjacentPos.x;
            if (this.cellsKnownIndicesByIndex.has(cellAdjacentIndex) == false) {
                this.cellsKnownIndicesByIndex.set(cellAdjacentIndex, cellAdjacentIndex);
            }
            if (this.cellsVisibleIndicesByIndex.has(cellAdjacentIndex) == false) {
                this.cellsVisibleIndicesByIndex.set(cellAdjacentIndex, cellAdjacentIndex);
            }
            var cellAdjacent = map.cellAtPosInCells(cellAdjacentPos);
            var unitsOrBasesPresent = cellAdjacent.unitsOrBasesPresent(world);
            var areUnitsOrBasesBelongingToOthersPresent = unitsOrBasesPresent.some(x => x.ownerName != owner.name);
            if (areUnitsOrBasesBelongingToOthersPresent) {
                var unitsOrBasesBelongingToOthers = unitsOrBasesPresent.filter(x => x.ownerName != owner.name);
                var ownerDiplomacy = owner.diplomacy;
                for (var u = 0; u < unitsOrBasesBelongingToOthers.length; u++) {
                    var unitOrBase = unitsOrBasesBelongingToOthers[u];
                    var ownerOther = unitOrBase.owner(world);
                    var isOwnerOtherKnown = ownerDiplomacy.ownerIsKnown(ownerOther);
                    if (isOwnerOtherKnown == false) {
                        ownerDiplomacy.relationshipWithOwner(ownerOther).postureSetToUncontacted(world);
                    }
                }
            }
        }
    }
}
