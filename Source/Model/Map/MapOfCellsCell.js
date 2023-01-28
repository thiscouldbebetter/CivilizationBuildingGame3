
class MapOfCellsCell
{
	constructor
	(
		pos,
		terrainCode,
		resourceSpecialPresentCode,
		hasPollution,
		basePresentId,
		improvementsPresentNames,
		unitsPresentIds
	)
	{
		this.pos = pos;
		this.terrainCode = terrainCode;
		this.resourceSpecialPresentCode = resourceSpecialPresentCode;
		this.hasPollution = hasPollution || false;
		this.basePresentId = basePresentId;
		this.improvementsPresentNames = improvementsPresentNames || [];
		this.unitsPresentIds = unitsPresentIds || [];

		this._resourcesProducedThisTurn = ResourceProduction.create();
	}

	static fromPosAndCodes(pos, codes)
	{
		var terrainCode = codes[0];
		var resourceSpecialCode = codes[1];
		return new MapOfCellsCell(
			pos, terrainCode, resourceSpecialCode, null, null, null, null
		);
	}

	static fromTerrainCode(terrainCode)
	{
		return new MapOfCellsCell(null, terrainCode, null, null, null, null, null);
	}

	baseAdd(base)
	{
		this.basePresentId = base.id;
	}

	basePresent(world)
	{
		return (this.basePresentId == null ? null : world.baseById(this.basePresentId));
	}

	canBeIrrigated()
	{
		var returnValue =
		(
			this.hasIrrigation() == false
			// todo - Certain terrain types only.
			// todo - Neighbor has water source.
		);

		return returnValue;
	}

	hasBase()
	{
		return (this.basePresentId != null);
	}

	hasFarmland()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Farmland) );
	}

	hasFortress()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Fortress) );
	}

	hasImprovement(improvement)
	{
		return (this.improvementsPresentNames.indexOf(improvement.name) >= 0);
	}

	hasIrrigation()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Irrigation) );
	}

	hasMines()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Mines) );
	}

	hasRailroads()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Railroads) );
	}

	hasRiver()
	{
		return this._hasRiver;
	}

	hasRoads()
	{
		return (this.hasImprovement(MapOfCellsCellImprovement.Instances().Roads) );
	}

	improvementAdd(improvement)
	{
		var improvementName = improvement.name;
		if (this.improvementsPresentNames.indexOf(improvementName) == -1)
		{
			this.improvementsPresentNames.push(improvementName);
		}
	}

	improvementAddIrrigation()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Irrigation);
	}

	improvementAddMines()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Mines);
	}

	improvementAddRailroads()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Railroads);
	}

	improvementAddRoads()
	{
		this.improvementAdd(MapOfCellsCellImprovement.Instances().Roads);
	}

	resourcesProduced(world, base)
	{
		var terrain = this.terrain(world);
		var resources = this._resourcesProducedThisTurn.overwriteWith
		(
			terrain.resourceProductionPerTurn
		);

		if (this.hasIrrigation())
		{
			resources.food++; // todo - Depending on terrain.
		}

		if (this.hasRivers)
		{
			resources.trade++;
		}

		if (this.hasRoads())
		{
			resources.trade++; // todo - Depending on terrain?
		}

		var resourceSpecialPresent = this.resourceSpecialPresent();
		if (resourceSpecialPresent != null)
		{
			resources.add(resourceSpecialPresent.resourcesProduced);
		}

		var owner = base.owner(world);
		if (owner.governmentIsAnarchyOrDespotism())
		{
			if (resources.food > 2)
			{
				resources.food--;
			}
			if (resources.industry > 2)
			{
				resources.industry--;
			}
			if (resources.trade > 2)
			{
				resources.trade--;
			}
		}

		return resources;
	}

	resourceSpecialPresent()
	{
		var returnValue =
		(
			this.resourceSpecialPresentCode == null
			? null
			: MapOfCellsCellResource.byCode(this.resourceSpecialPresentCode)
		);
		return returnValue;
	}

	terrain(world)
	{
		return world.defns.terrainByCode(this.terrainCode);
	}

	unitAdd(unit)
	{
		this.unitsPresentIds.push(unit.id);
	}

	unitNotAlliedWithOwnerIsPresent(owner, world)
	{
		var unitsPresent = this.unitsPresent(world);
		var unitNotAlliedWithOwnerIsPresent =
			unitsPresent.some(x => x.ownerName != owner.ownerName);
		return unitNotAlliedWithOwnerIsPresent;
	}

	unitRemove(unit)
	{
		this.unitsPresentIds.splice(this.unitsPresentIds.indexOf(unit.id), 1);
	}

	unitsOrBasesPresent(world)
	{
		var unitsOrBasesPresent = this.unitsPresent(world);
		var basePresent = this.basePresent(world);
		if (basePresent != null)
		{
			unitsOrBasesPresent.push(basePresent);
		}
		return unitsOrBasesPresent;
	}

	unitsPresent(world)
	{
		return (this.unitsPresentIds.map(x => world.unitById(x)));
	}

	unitsPresentNotAlliedWithOwner(owner, world)
	{
		var unitsPresent = this.unitsPresent(world);
		var unitsNotAlliedWithOwnerPresent =
			unitsPresent.filter(x => x.ownerName != owner.ownerName);
		return unitsNotAlliedWithOwnerPresent;
	}

	unitsPresentOwnedBySameOwnerAsUnit(unit, world)
	{
		var unitsPresent = this.unitsPresent(world);
		var unitsOwnedBySameOwnerPresent = unitsPresent.filter
		(
			x =>
			(
				x.id != unit.id
				&& x.ownerName == unit.ownerName
			)
		);
		return unitsOwnedBySameOwnerPresent;
	}

	unitsPresentQualifiedToBePassengersOnUnit(unit, world)
	{
		var unitsOwnedBySameOwnerPresent =
			this.unitsPresentOwnedBySameOwnerAsUnit(unit, world);
		var unitsQualifiedToBePassengers =
			unitsOwnedBySameOwnerPresent.filter
			(
				unit => unit.isGround(world) && unit.isSleeping()
			);
		return unitsQualifiedToBePassengers;
	}

	value(world, base)
	{
		var foodThisTurnNet = base.foodThisTurnNet(world);
		var industryThisTurnNet = base.industryThisTurnNet(world);
		var moneyThisTurnNet = base.moneyThisTurnNet(world);

		var foodWeight = (foodThisTurnNet >= 1 ? 0 : -foodThisTurnNet);
		var industryWeight = (industryThisTurnNet >= 1 ? 0 : -industryThisTurnNet);
		var tradeWeight = (moneyThisTurnNet >= 1 ? 0 : -moneyThisTurnNet);
		var totalWeight = foodWeight + industryWeight + tradeWeight;

		var resourcesProduced = this.resourcesProduced(world, base);

		var cellValue =
		(
			totalWeight == 0
			? resourcesProduced.sumOfResourceQuantities()
			:
			(
				resourcesProduced.food * foodWeight
				+ resourcesProduced.industry * industryWeight
				+ resourcesProduced.trade * tradeWeight
			)
		);

		return cellValue;
	}

}
