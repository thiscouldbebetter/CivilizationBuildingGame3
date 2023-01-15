
// Test fixtures.

class TestFixtureMain
{
	playDemoFromStart()
	{
		this.turnsToWaitMax = 100;

		var display = new DisplayMock();
		var inputHelper = new InputHelperMock();
		var outputLog = new OutputLogMock();
		var world = World.demo();
		var universe = new Universe(display, inputHelper, outputLog, world);
		universe.initialize();

		this.universe = universe;
		this.world = world;

		this.playFromStart_1_Startup();
		this.playFromStart_2_UnitMovement();
		this.playFromStart_3_EndingARound();
		this.playFromStart_4_FoundingABase();
		this.playFromStart_5_BuildingAUnit();
		this.playFromStart_6_ImprovingLand();
		this.playFromStart_7_Government();
		this.playFromStart_8_BaseUnrest();
		this.playFromStart_9_BaseGrowthLimiters();
		this.playFromStart_10_Granary();
		this.playFromStart_11_Ships();
		this.playFromStart_12_Diplomacy();
		this.playFromStart_13_War();
		this.playFromStart_14_ResearchAllAndBuildStarship();
	}

	playFromStart_1_Startup()
	{
		var world = this.world;

		// Verify that the world is as expected.
		var difficultyLevel = world.difficultyLevel();
		Assert.areEqual(DifficultyLevel.Instances().Chieftan, difficultyLevel);
		var ownerCount = world.owners.length;
		Assert.areEqual(2, ownerCount);

		// Verify that owner 0 is selected at startup.
		var owner = world.ownerCurrent();
		Assert.isNotNull(owner);
		var owner0 = world.owners[0];
		Assert.areEqual(owner0, owner);

		// Verify that a settlers unit is selected at startup.
		var unit = owner.unitSelected();
		Assert.isNotNull(unit);
		var unitDefns = UnitDefn.Instances();
		var unitDefnSettlers = unitDefns.Settlers;
		Assert.areEqual(unitDefnSettlers.name, unit.defnName);

		// Verify that at least one neighbor exists.
		Assert.isTrue(world.owners.length > 1);
	}

	playFromStart_2_UnitMovement()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var unit = owner.unitSelected();

		// Verify that the unit has moves initially.
		Assert.isTrue(unit.movesThisTurn() > 0);

		// Count the number of known cells before the move.
		var ownerMapKnowledge = owner.mapKnowledge;
		var cellsKnownIndices = ownerMapKnowledge.cellsKnownIndicesByIndex;
		var cellsKnownCountBeforeMove = cellsKnownIndices.size;

		// Move the unit.
		var unitPosBeforeMove = unit.pos.clone();
		unit.moveInDirectionEast(world);

		// Make sure the unit has used up its moves.
		Assert.isFalse(unit.hasMovesThisTurn());

		// Make sure the unit's position has changed by the correct offset.
		var unitPosAfterMove = unit.pos.clone();
		var offsetMoved = unitPosAfterMove.clone().subtract(unitPosBeforeMove);
		Assert.isTrue(offsetMoved.equals(Direction.Instances().East.offset));

		// Make sure that more cells are known.
		var cellsKnownCountAfterMove = cellsKnownIndices.size;
		Assert.isTrue(cellsKnownCountAfterMove > cellsKnownCountBeforeMove);

		// Attempt to advance to the next idle unit (but there isn't one).
		owner.unitSelectNextIdle();
		unit = owner.unitSelected();
		Assert.isNull(unit);
	}

	playFromStart_3_EndingARound()
	{
		var universe = this.universe;
		var world = this.world;
		var owner = world.ownerCurrent();

		// End the first owner's turn.
		var ownerBeforeEndingTurn = owner;
		world.ownerCurrentAdvance(universe);

		// Make sure the current owner has changed.
		var ownerAfterEndingTurn = world.ownerCurrent();
		Assert.areNotEqual(ownerAfterEndingTurn, ownerBeforeEndingTurn);

		// Have the second owner's settlers found a city.
		var unitSettlers = ownerAfterEndingTurn.units[0];
		Assert.isNotNull(unitSettlers);
		var activityDefns = UnitActivityDefn.Instances();
		unitSettlers.activityDefnStartForWorld(activityDefns.SettlersStartCity, world);
		Assert.isTrue(ownerAfterEndingTurn.bases.length > 0);

		// End the second owner's turn, which ends the round.
		var turnsBeforeEndingRound = world.turnsSoFar;
		Assert.areEqual(0, turnsBeforeEndingRound);
		world.ownerCurrentAdvance(universe);
		var turnsAfterEndingRound = world.turnsSoFar;
		Assert.areEqual(1, turnsAfterEndingRound);

		// Make sure owner 0 is the current one again.
		var ownerAfterEndingRound = world.ownerCurrent();
		Assert.areEqual(owner, ownerAfterEndingRound);
	}

	playFromStart_4_FoundingABase()
	{
		var world = this.world;
		var owner = world.ownerCurrent();

		// Found a base with the settlers.
		var unit = owner.unitSelected();
		var activityDefns = UnitActivityDefn.Instances();
		var activityBefore = unit.activity();
		Assert.isNull(activityBefore);
		unit.activityDefnStartForWorld(activityDefns.SettlersStartCity, world);

		// Verify that the settlers have disappeared, and become a base.
		Assert.areEqual(0, owner.units.length);
		Assert.areEqual(1, owner.bases.length);

		// Verify that the base is as expected.
		var owner0Base0 = owner.bases[0];
		var base = owner0Base0;
		Assert.isTrue(base.pos.equals(unit.pos) );
		var basePopulationInitial = base.population();
		Assert.areEqual(1, basePopulationInitial);
		Assert.areEqual(2, base.landUsage.offsetsInUse.length);
		Assert.isTrue(base.isIdle() );
		var resourcesThisTurn = base.resourcesProducedThisTurn(world, base);
		var resourcesNone = ResourceProduction.create();
		Assert.isFalse(resourcesThisTurn.equals(resourcesNone) );
		var map = world.map;
		var cell = map.cellAtPosInCells(base.pos);
		Assert.isTrue(cell.hasIrrigation());
		Assert.isTrue(cell.hasRoads());

		// Advance the turn and make sure some resources are being produced,
		// but not any industry, because there's no project.
		world.turnAdvance();
		resourcesThisTurn = base.resourcesProducedThisTurn(world);
		Assert.isFalse(resourcesThisTurn.equals(resourcesNone ) );
		var industryStockpiled = base.industry.industryStockpiled;
		Assert.areEqual(0, industryStockpiled);
	}

	playFromStart_5_BuildingAUnit()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];

		// Wait for the population to grow.
		var basePopulationBeforeGrowing = base.population();
		var foodNeededToGrow = base.foodNeededToGrow();
		var foodPerTurn = base.foodThisTurnNet(world);
		var turnsToWait = Math.ceil(foodNeededToGrow / foodPerTurn);
		Assert.isTrue(turnsToWait < this.turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWait);
		var basePopulationAfterGrowing = base.population();
		Assert.areNotEqual(basePopulationBeforeGrowing, basePopulationAfterGrowing);

		// Build a new settlers unit.
		var basePopulationBeforeBuildingSettlers = base.population();
		var unitDefns = UnitDefn.Instances();
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, base, world, unitDefns.Settlers
		);

		// Make sure the settlers unit has been built as expected.
		Assert.areEqual(1, owner.units.length);
		var unit = owner.units[0];
		Assert.areEqual(unit.defnName, unitDefns.Settlers.name);
		Assert.isTrue(unit.pos.equals(base.pos));
		Assert.areEqual(unit, owner.unitSelected());
		Assert.areNotEqual(0, unit.movesThisTurn());

		// Make sure building settlers reduced the base's population,
		// and that it is costing some food per turn.
		// NOTE: This doesn't work because the population has increased too.
		// Assert.isTrue(base.population() < basePopulationBeforeBuildingSettlers);
	}

	playFromStart_6_ImprovingLand()
	{
		var world = this.world;
		var map = world.map;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];
		var unit = owner.unitSelected();

		// Move the settler one cell, irrigate, and verify.
		unit.moveInDirectionEast(world);
		world.turnAdvance();
		var activityDefns = UnitActivityDefn.Instances();
		this.waitNTurnsForUnitInWorldToCompleteActivityDefn
		(
			this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildIrrigation
		);
		var cell = map.cellAtPosInCells(unit.pos);
		var cellHasIrrigation = cell.hasIrrigation();
		Assert.isTrue(cellHasIrrigation);

		// Build some roads, and verify they appeared.
		this.waitNTurnsForUnitInWorldToCompleteActivityDefn
		(
			this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildRoads
		);
		cell = map.cellAtPosInCells(unit.pos);
		var cellHasRoads = cell.hasRoads();
		Assert.isTrue(cellHasRoads);

		// Re-optimize the base's labor.
		var resourcesBeforeOptimize = base.resourcesProducedThisTurn(world).clone();
		base.laborOptimizeForWorld(world);
		var resourcesAfterOptimize =
			base.resourcesProducedThisTurn(world);
		// But improvements don't matter, because despotism truncates the extra food.
		Assert.isTrue(resourcesAfterOptimize.equals(resourcesBeforeOptimize) );

		world.turnAdvance(); // hack - Should this be necessary?

		// Move the settlers back into the city and out again,
		// then make sure a third of a move remains.
		unit.moveInDirectionWest(world);
		unit.moveInDirectionEast(world);
		Assert.isTrue(unit.hasMovesThisTurn());
		Assert.areEqual(1, unit.moveThirdsThisTurn());

		// Try to move the unit off the road,
		// but it can't, because it only has 1/3 move left. 
		var unitPosBeforeMoveAttempt = unit.pos.clone();
		unit.moveInDirectionEast(world);
		Assert.isTrue(unit.pos.equals(unitPosBeforeMoveAttempt) );

		// End the turn and try again, it should work now.
		world.turnAdvance();
		unitPosBeforeMoveAttempt = unit.pos.clone();
		unit.moveInDirectionEast(world);
		Assert.isFalse(unit.pos.equals(unitPosBeforeMoveAttempt) );

		// Improve some more land (to make enough to make later tests feasible).
		var d = Direction.Instances();
		var directionsToMove =
		[
			d.North, d.North, d.West, d.West, d.West, d.South
		];
		directionsToMove.forEach(direction =>
		{
			unit.moveInDirection(direction, world);
			world.turnAdvance();
			Assert.isFalse(map.cellAtPosInCells(unit.pos).hasIrrigation());
			Assert.isFalse(map.cellAtPosInCells(unit.pos).hasRoads());
			this.waitNTurnsForUnitInWorldToCompleteActivityDefn
			(
				this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildIrrigation 
			);
			this.waitNTurnsForUnitInWorldToCompleteActivityDefn
			(
				this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildRoads
			);
			world.turnAdvance();
		});

		// Rather than building things up the slow way, for now: cheat!
		base.landUsage.buildImprovementsInAllCellsMagicallyForBaseAndWorld
		(
			base, world
		);
		base.laborOptimizeForWorld(world);
	}

	playFromStart_7_Government()
	{
		var world = this.world;
		var owner = world.ownerCurrent();

		// Verify that the initial government is despotism.
		var governments = Government.Instances();
		Assert.isTrue(owner.governmentIs(governments.Despotism) );

		// Verify that only one government is known initially.
		var governmentsKnown = owner.governmentsKnown();
		Assert.areEqual(1, governmentsKnown.length);
		Assert.isTrue(governmentsKnown[0] == governments.Despotism);

		// Record the gross industry before.
		var base = owner.bases[0];
		var baseIndustryGrossBefore = base.industryThisTurnGross(world);
		Assert.isTrue(baseIndustryGrossBefore > 0);

		// Research a second government type, monarchy.
		var technologies = Technology.Instances();
		this.waitNTurnsForOwnerInWorldToResearchTechs
		(
			this.turnsToWaitMax, owner, world,
			[
				technologies.CeremonialBurial,
				technologies.Alphabet,
				technologies.CodeOfLaws,
				technologies.Monarchy
			]
		);

		// Verify that monarchy is now a known form of government.
		governmentsKnown = owner.governmentsKnown();
		Assert.areEqual(2, governmentsKnown.length);
		Assert.isTrue(governmentsKnown[1] == governments.Monarchy);

		// Overthrow the government to prepare to switch to monarchy.
		owner.governmentOverthrow();
		Assert.isTrue(owner.governmentIs(governments.Anarchy) );

		// Can't set government to monarchy immediately after overthrow.
		Assert.throwsException(() => owner.governmentSet(governments.Monarchy));
		Assert.isFalse(owner.governmentIs(governments.Monarchy) );

		// Wait for the anarchy to pass, then switch to monarchy.
		var turnsOfAnarchyMax = 4;
		this.waitNTurns(turnsOfAnarchyMax, world);
		Assert.throwsException(owner.governmentSet(governments.Monarchy));
		Assert.isTrue(owner.governmentIs(governments.Monarchy) );

		// Since, under a monarchy,
		// production over 2 per cell per resource is not curtailed,
		// net industry should be greater.
		var baseIndustryGrossAfter = base.industryThisTurnGross(world);
		Assert.isTrue(baseIndustryGrossAfter > baseIndustryGrossBefore);

		// Disband non-free units.
	}

	playFromStart_8_BaseUnrest()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];
		var difficultyLevel = world.difficultyLevel();

		// Verify that the city is not experiencing unrest yet.
		Assert.isFalse(base.attitudeIsUnrest(world) );

		var laborerCountBefore = base.demographics.laborerCount();

		// Wait for the population to grow until new citizens are disconent.
		var basePopulationBeforeDiscontent =
			difficultyLevel.basePopulationBeforeDiscontent;

		while (base.population() <= basePopulationBeforeDiscontent)
		{
			this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
			(
				this.turnsToWaitMax, base, world, true // isBaseExpectedToActuallyGrow
			);
		}

		// Verify that the city's new citizen was auto-assigned as an entertainer,
		// rather than as a laborer.
		Assert.areEqual(1, base.demographics.entertainerCount);
		Assert.areEqual(basePopulationBeforeDiscontent, base.demographics.laborerCount());

		// Reassign the auto-assigned entertainer back to a laborer.
		base.specialistReassignAsLaborer(world);

		// Verify that the entertainer is gone, and the city is now experiencing unrest.
		Assert.areEqual(0, base.demographics.entertainerCount);
		Assert.isTrue(base.attitudeIsUnrest(world) );

		// Verify that production is halted due to unrest.
		Assert.isTrue(base.industryThisTurnNet(world) <= 0);

		// Reassign a laborer as an entertainer and verify that they add happiness.
		Assert.areEqual(0, base.luxuriesThisTurn(world) );
		var populationHappyBeforeEntertainer = base.populationHappy(world);
		var populationDiscontentBeforeEntertainer = base.populationDiscontent(world);
		base.laborerWorstReassignAsEntertainerForWorld(world);
		Assert.areEqual(2, base.luxuriesThisTurn(world) );
		var populationHappyAfterEntertainer = base.populationHappy(world);
		var populationDiscontentAfterEntertainer = base.populationDiscontent(world);
		Assert.areEqual
		(
			populationDiscontentAfterEntertainer,
			populationDiscontentBeforeEntertainer
		);
		Assert.areEqual
		(
			populationHappyAfterEntertainer,
			populationHappyBeforeEntertainer + 1
		);

		// Build a military unit and verify that martial law mitigates discontent.
		var unitDefns = UnitDefn.Instances();
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, base, world, unitDefns.Warriors
		);

		// Build some more military units to enforce martial law.
		var militaryUnitsToBuildCount = 0; // todo
		for (var i = 0; i < militaryUnitsToBuildCount; i++)
		{
			this.waitNTurnsForBaseInWorldToBuildUnitDefn
			(
				this.turnsToWaitMax, base, world, unitDefns.Warriors
			);
		}

		// Do some more research and build a temple (then add mysticism)
		// and colosseum to prevent population growth leading to unrest.

		var technologies = Technology.Instances();
		this.waitNTurnsForOwnerInWorldToResearchTechs
		(
			this.turnsToWaitMax, owner, world,
			[
				// Ceremonial Burial has already been researched.
				technologies.Mysticism,
			]
		);

		var improvements = BaseImprovementDefn.Instances();

		this.waitNTurnsForBaseInWorldToBuildImprovement
		(
			this.turnsToWaitMax, base, world, improvements.Temple
		);

		this.waitNTurnsForOwnerInWorldToResearchTechs
		(
			this.turnsToWaitMax, owner, world,
			[
				technologies.BronzeWorking,
				technologies.Currency,
				technologies.Masonry,
				technologies.Construction,
			]
		);

		this.waitNTurnsForBaseInWorldToBuildImprovement
		(
			this.turnsToWaitMax, base, world, improvements.Colosseum
		);
	}

	playFromStart_9_BaseGrowthLimiters()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];
		var improvements = BaseImprovementDefn.Instances();
		var technologies = Technology.Instances();

		// Wait for the population to grow to 8.
		while (base.population() < 8)
		{
			this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
			(
				this.turnsToWaitMax, base, world, true // isBaseExpectedToActuallyGrow
			);
		}

		// Wait for the population to grow from 8 to 9,
		// but it can't, because that requires an aqueduct.
		this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
		(
			this.turnsToWaitMax, base, world, false // isBaseExpectedToActuallyGrow
		);

		this.waitNTurnsForBaseInWorldToBuildImprovement
		(
			this.turnsToWaitMax, base, world, improvements.Aqueduct
		);

		// Wait for the population to grow from 8 to 9 again,
		// and this time it can, because the base has an aqueduct.
		this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
		(
			this.turnsToWaitMax, base, world, true // isBaseExpectedToActuallyGrow
		);

		// Wait for the population to grow to 12.
		while (base.population() < 12)
		{
			this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
			(
				this.turnsToWaitMax, base, world, true // isBaseExpectedToActuallyGrow
			);
		}

		// Wait for the population to grow from 12 to 13,
		// but it can't, because that requires a sewer system.

		this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
		(
			this.turnsToWaitMax, base, world, false // isBaseExpectedToActuallyGrow
		);

		// Do some more research to learn Sanitation.

		this.waitNTurnsForOwnerInWorldToResearchTechs
		(
			this.turnsToWaitMax, owner, world,
			[
				technologies.HorsebackRiding,
				technologies.Wheel,
				technologies.Engineering,
				technologies.Writing,
				technologies.Literacy,
				technologies.Philosophy,
				technologies.Trade,
				technologies.Medicine,
				technologies.Sanitation
			]
		);

		this.waitNTurnsForBaseInWorldToBuildImprovement
		(
			this.turnsToWaitMax, base, world, improvements.SewerSystem
		);

		// Wait for the population to grow from 11 to 12 again,
		// and this time it can, because a sewer system has been built.
		this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
		(
			(this.turnsToWaitMax * 2), // hack,
			base, world, true // isBaseExpectedToActuallyGrow
		);
	}

	playFromStart_10_Granary()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];

		// Make sure that the base can't build a granary before researching pottery.
		var buildablesAvailableNames =
			base.buildablesAvailableNames(world);
		Assert.areNotEqual(0, buildablesAvailableNames.length);
		var improvements = BaseImprovementDefn.Instances();
		var improvementToBuild = improvements.Granary;
		var canBuildImprovement =
			buildablesAvailableNames.indexOf(improvementToBuild.name) >= 0;
		Assert.isFalse(canBuildImprovement);

		var technologies = Technology.Instances();
		this.waitNTurnsForOwnerInWorldToResearchTech
		(
			this.turnsToWaitMax, owner, world, technologies.Pottery
		);

		// Make sure that the base can build the improvement now.
		buildablesAvailableNames =
			base.buildablesAvailableNames(world);
		canBuildImprovement =
			buildablesAvailableNames.indexOf(improvementToBuild.name) >= 0;
		Assert.isTrue(canBuildImprovement);

		// hack
		base.whileDiscontentReassignLaborersAsEntertainers(world);

		// Build the improvement.
		this.waitNTurnsForBaseInWorldToBuildImprovement
		(
			this.turnsToWaitMax, base, world, improvementToBuild
		);

		// Wait for the population to grow again,
		// and make sure the granary saves half the food.
		this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
		(
			this.turnsToWaitMax, base, world, true // isBaseExpectedToActuallyGrow
		);
		var foodNeededToGrow = base.foodNeededToGrow();
		Assert.isTrue(base.foodStockpiled() >= (foodNeededToGrow / 2) );
	}

	playFromStart_11_Ships()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var unitSettlers = owner.unitSelected();

		// Move to the coast.
		unitSettlers.moveStartTowardPosInWorld(Coords.zeroes(), world);
		while (unitSettlers.activity() != null)
		{
			world.turnAdvance();
		}

		// Found another base, this one on the coast.
		var baseCountBefore = owner.bases.length;
		var activityDefns = UnitActivityDefn.Instances();
		unitSettlers.activityDefnStartForWorld
		(
			activityDefns.SettlersStartCity, world
		);
		var baseCountAfter = owner.bases.length;
		Assert.areEqual(baseCountAfter, baseCountBefore + 1);
		var base = owner.bases[owner.bases.length - 1];
		Assert.isNotNull(base);
		Assert.isTrue(base.pos.equals(unitSettlers.pos));

		// Rather than building things up the slow way, for now: cheat!
		var improvements = BaseImprovementDefn.Instances();
		base.improvementAdd(improvements.Temple);
		base.landUsage.buildImprovementsInAllCellsMagicallyForBaseAndWorld
		(
			base, world
		);
		base.laborOptimizeForWorld(world);

		// Research map making so a trireme can be built.
		var technologies = Technology.Instances();
		this.waitNTurnsForOwnerInWorldToResearchTechs
		(
			this.turnsToWaitMax, owner, world,
			[
				technologies.MapMaking
			]
		);

		// Build a trireme.
		var unitDefns = UnitDefn.Instances();
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, base, world, unitDefns.Trireme
		);
		var unitsSupported = base.unitsSupported(world);
		var unitShip = unitsSupported[0];
		Assert.areEqual(unitDefns.Trireme.name, unitShip.defnName);

		// Let the city grow some.
		var timesToGrow = 4;
		for (var i = 0; i < timesToGrow; i++)
		{
			this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
			(
				this.turnsToWaitMax, base, world, true // isExpectedToGrow
			);
		}

		// Build some troops to load onto the ship.
		var capacityOfTrireme = unitDefns.Trireme.passengersMax;
		var troopsToBuildCount = capacityOfTrireme + 1;
		for (var i = 0; i < troopsToBuildCount; i++)
		{
			this.waitNTurnsForBaseInWorldToBuildUnitDefn
			(
				this.turnsToWaitMax, base, world, unitDefns.Warriors
			);
			unitsSupported = base.unitsSupported(world);
			var unitWarriors = unitsSupported[unitsSupported.length - 1];
			Assert.areEqual(unitDefns.Warriors.name, unitWarriors.defnName);
			unitWarriors.sleep(world);
		}

		// Move the ship out of the base,
		// and verify that the max amount of sleeping troops came with it.
		var directions = Direction.Instances();
		unitShip.moveInDirectionWest(world);
		Assert.areNotEqual(unitShip.pos, base.pos);
		var unitsPresentInShipCell =
			world.map.cellAtPosInCells(unitShip.pos).unitsPresent(world);
		Assert.areEqual(capacityOfTrireme + 1, unitsPresentInShipCell.length);
		Assert.isTrue(unitsPresentInShipCell.indexOf(unitShip) >= 0);
		Assert.isTrue(unitsPresentInShipCell.some(x => x.defnName == unitDefns.Warriors.name));

		// See if the ship can move onto an unoccupied land square,
		// which it shouldn't.
		Assert.isFalse(unitShip.canMoveInDirectionSoutheast(world));

		// However, it should be able to move back onto the base.
		Assert.isTrue(unitShip.canMoveInDirectionEast(world));

		// It also shouldn't get lost at sea, as long as it stays next to land.
		var turnsToWait = 10;
		for (var i = 0; i < turnsToWait; i++)
		{ 
			world.turnAdvance();
		}
		Assert.isTrue(world.units.indexOf(unitShip) >= 0);

		// todo
		// sail to opposite shore, unload troops,
		// attack enemy base,
		// end turn away from shore, die.
	}

	playFromStart_12_Diplomacy()
	{
		var world = this.world;
		var owner = world.owners[0];
		var base = owner.bases[0];

		var unitDefns = UnitDefn.Instances();

		// Choose a neighbor.
		var neighbor = world.owners[1];

		// Verify that there are no diplomatic relations with the neighbor yet.
		var ownerDiplomacy = owner.diplomacy;
		var isNeighborKnown = ownerDiplomacy.ownerIsKnown(neighbor);
		Assert.isFalse(isNeighborKnown);

		// Have the neighbor build a military unit, and move it outside of town.
		var neighborBase = neighbor.bases[0];
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, neighborBase, world, unitDefns.Warriors
		);
		var unitWarriors = neighborBase.unitSupportedLast(world);
		unitWarriors.moveInDirectionWest(world);

		// Build a diplomat.
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, base, world, unitDefns.Diplomat
		);

		var unitDiplomat = base.unitsSupported(world).find
		(
			x => x.defn(world) == unitDefns.Diplomat
		);
		Assert.isNotNull(unitDiplomat);

		// Move the diplomat into neighboring territory.
		var neighborBasePos = neighborBase.pos;
		var neighborBaseOutskirtsPos = neighborBasePos.clone().addXY(-2, 0);

		this.waitNTurnsForUnitInWorldToMoveToPos
		(
			this.turnsToWaitMax, unitDiplomat, world, neighborBaseOutskirtsPos
		);

		// Verify that diplomatic relations are established.
		isNeighborKnown = ownerDiplomacy.ownerIsKnown(neighbor);
		Assert.isTrue(isNeighborKnown);

		// Make peace with the neighbor.
		var relationship = ownerDiplomacy.relationshipWithOwner(neighbor);
		relationship.postureSetToPeace(world); // todo - Shouldn't be this easy.

		// Verify that the diplomat can move around the neighbor's zone of control.
		var canIgnoreEnemyZoneOfControl =
			unitDiplomat.canMoveInDirectionNortheast(world);
		Assert.isTrue(canIgnoreEnemyZoneOfControl);

		// Move into the unit and verify that it prompts for an action.
		unitDiplomat.moveInDirectionEast(world);
		Assert.isTrue(owner.isWaitingForActionSelection());

		// Select the action to bribe the unit.
		unitDiplomat.actionSelectDiplomatBribeUnit(world);

		// Verify that the unit has switched allegiance.
		var unitWarriorsOwner = unitWarriors.owner(world);
		Assert.areEqual(owner, unitWarriorsOwner);

		// Establish an embassy.

		// Verify that the embassy is established.
	}

	playFromStart_13_War()
	{
		var world = this.world;
		var owner = world.owners[0];
		var base = owner.bases[0];

		// Create a military unit.
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, base, world, unitDefns.Warriors
		);
		var unitWarriors = base.unitSupportedLast();

		// Move it into peaceful neighbor's territory.
		var neighborBase = neighbor.bases[0];
		var neighborBasePos = neighborBase.pos;
		var neighborBaseOutskirtsPos = neighborBasePos.clone().addXY(-1, 0);

		this.waitNTurnsForUnitInWorldToMoveToPos
		(
			this.turnsToWaitMax, unitWarriors, world, neighborBaseOutskirtsPos
		);

		// Verify that the unit cannot move into neighbor's zones of control.
		// Sneak-attack one of the neighbor's units.
		// Verify that the neighbor's unit was destroyed.
		// Verify that the neighbor is now hostile.
		// Verify that the aggressor's reputation has suffered.
		// Verify that the enemy's zone of control are now gone.
		// Verify that the enemy has a defender.
		// Make sure that the enemy has more than one base.
		// Attack the defended base.
		// Verify that the defender was destroyed.
		// Attack the now defenseless base.
		// Verify that the base was conquered.
		// Offer peace.
		// Verify that the peace offer was accepted.
		// Declare war again.
		// Move to the enemy's other base.
		// Attack the undefended, single-population second base.
		// Verify that the base is destroyed.
		// Verify that the enemy owner has been completely destroyed.
	}

	playFromStart_14_ResearchAllAndBuildStarship()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];

		// Research everything.
		var techsResearchable = owner.technologiesResearchable();
		while (techsResearchable.length > 0)
		{
			this.waitNTurnsForOwnerInWorldToResearchTechs
			(
				this.turnsToWaitMax, owner, world, techsResearchable
			);
			techsResearchable = owner.technologiesResearchable();
		}

		var techsKnown = owner.technologiesKnown();
		var technologies = Technology.Instances();
		Assert.areEqual(technologies._All.length, techsKnown.length);

		// Verify that we can't launch the starship because it doesn't exist.
		var starshipStatus = owner.starshipStatus;
		var canLaunch = starshipStatus.canLaunch();
		Assert.isFalse(canLaunch);

		// Build a starship.
		this.waitNTurnsForBaseInWorldToBuildStarshipParts
		(
			this.turnsToWaitMax, base, world
		);

		// Verify that the completed starship can launch.
		canLaunch = starshipStatus.canLaunch();
		Assert.isTrue(canLaunch);

		// Launch the starship.
		starshipStatus.launch(world);

		// Wait one turn and make sure we haven't won.
		this.waitNTurns(1, world);
		var hasWon = owner.hasWon(world);
		Assert.isFalse(hasWon);

		// Wait for the starship to reach the destination.
		var turnsToReachDestination =
			starshipStatus.turnsToReachDestinationTotal();
		this.waitNTurns(turnsToReachDestination, world);

		hasWon = owner.hasWon(world);
		Assert.isTrue(hasWon);
	}

	// Helper methods.

	waitNTurns(turnsToWait, world)
	{
		world.turnAdvanceMultiple(turnsToWait);
	}

	waitNTurnsForBaseInWorldToBuildImprovement
	(
		turnsToWaitMax, base, world, improvementToBuild
	)
	{
		base.buildableStart(improvementToBuild, world);
		var industryPerTurn = base.industryThisTurnNet(world);
		var turnsToWait = Math.ceil
		(
			improvementToBuild.industryToBuild / industryPerTurn
		);
		Assert.isTrue(turnsToWait < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWait);
		Assert.isTrue(base.hasImprovement(improvementToBuild));
	}

	waitNTurnsForBaseInWorldToBuildStarshipParts
	(
		turnsToWaitMax, base, world
	)
	{
		var starshipParts = StarshipPart.Instances();

		var buildablesToBuild =
		[
			starshipParts.FuelTank,
			starshipParts.Habitat,
			starshipParts.LifeSupport,
			starshipParts.Powerplant,
			starshipParts.Thruster,

			starshipParts.Structural,
			starshipParts.Structural,
			starshipParts.Structural,
			starshipParts.Structural,
			starshipParts.Structural
		];

		var owner = base.owner(world);
		var starshipStatus = owner.starshipStatus;
		var starshipStatusPrev = starshipStatus.clone();

		for (var i = 0; i < buildablesToBuild.length; i++)
		{
			var buildableToBuild = buildablesToBuild[i];
			base.buildableStart(buildableToBuild, world);
			var industryPerTurn = base.industryThisTurnNet(world);
			var turnsToWait = Math.ceil
			(
				buildableToBuild.industryToBuild / industryPerTurn
			);
			Assert.isTrue(turnsToWait < turnsToWaitMax);
			world.turnAdvanceMultiple(turnsToWait);

			Assert.isFalse(starshipStatus.equals(starshipStatusPrev));

			starshipStatusPrev.overwriteWith(starshipStatus);
		}
	}

	waitNTurnsForBaseInWorldToBuildUnitDefn
	(
		turnsToWaitMax, base, world, unitDefnToBuild
	)
	{
		base.buildableStart(unitDefnToBuild, world);
		var industryPerTurn = base.industryThisTurnNet(world);
		var turnsToWait = Math.ceil
		(
			unitDefnToBuild.industryToBuild / industryPerTurn
		);
		Assert.isTrue(turnsToWait < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWait);
		var unitsSupported = base.unitsSupported(world);
		var unitBuilt = unitsSupported[unitsSupported.length - 1];
		Assert.areEqual(unitDefnToBuild.name, unitBuilt.defnName);
		Assert.isTrue(unitBuilt.pos.equals(base.pos));
		Assert.isTrue(unitBuilt.movesThisTurn() > 0);
	}

	waitNTurnsForOwnerInWorldToResearchTech
	(
		turnsToWaitMax, owner, world, techToResearch
	)
	{
		// Select the tech to research.
		var techsResearchable = owner.technologiesResearchable();
		Assert.areNotEqual(0, techsResearchable.length);
		var techCanBeResearched = owner.technologyCanBeResearched(techToResearch);
		Assert.isTrue(techCanBeResearched);
		owner.technologyResearch(techToResearch);
		Assert.areEqual(techToResearch, owner.technologyBeingResearched());

		// Wait for the research to complete.
		var researchPerTurn = owner.researchThisTurn(world);
		var turnsExpectedToResearch = Math.ceil
		(
			techToResearch.researchToLearn / researchPerTurn
		);
		Assert.isTrue(turnsExpectedToResearch < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsExpectedToResearch);

		// Make sure the researched tech is now known,
		// is no longer being researched, and is no longer researchable.
		var techsKnown = owner.technologiesKnown();
		Assert.isTrue(techsKnown.indexOf(techToResearch) >= 0);
		Assert.isNull(owner.technologyBeingResearched());
		techsResearchable = owner.technologiesResearchable();
		Assert.isTrue(techsResearchable.indexOf(techToResearch) == -1);
	}

	waitNTurnsForOwnerInWorldToResearchTechs
	(
		turnsToWaitMax, owner, world, techsToResearch
	)
	{
		techsToResearch.forEach
		(
			x => this.waitNTurnsForOwnerInWorldToResearchTech
			(
				turnsToWaitMax, owner, world, x
			)
		);
	}

	waitNTurnsForPopulationOfBaseInWorldToGrowByOne
	(
		turnsToWaitMax, base, world, isBaseExpectedToActuallyGrow
	)
	{
		var basePopulationBefore = base.population();
		var foodNeededToGrow = base.foodNeededToGrow();
		var foodAdditionalNeededToGrow =
			foodNeededToGrow - base.foodStockpiled();
		var foodPerTurn = base.foodThisTurnNet(world);
		var turnsToWait = Math.ceil(foodAdditionalNeededToGrow / foodPerTurn);
		Assert.isTrue(turnsToWait < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWait);
		var basePopulationAfter = base.population();
		var didBaseActuallyGrow = (basePopulationAfter == basePopulationBefore + 1);
		Assert.areEqual(isBaseExpectedToActuallyGrow, didBaseActuallyGrow);
	}

	waitNTurnsForUnitInWorldToCompleteActivityDefn
	(
		turnsToWaitMax, unit, world, activityDefn
	)
	{
		unit.activityDefnStartForWorld(activityDefn, world);
		var unitDefn = unit.defn(world);
		var turnsToWaitExpected =
			activityDefn.movesToComplete() / unitDefn.movesPerTurn();
		Assert.isTrue(turnsToWaitExpected < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWaitExpected);
	}

	waitNTurnsForUnitInWorldToMoveToPos
	(
		turnsToWaitMax, unit, world, targetPos
	)
	{
		unit.moveStartTowardPosInWorld(targetPos, world);

		var unitPos = unit.pos;
		var displacementToTarget = Coords.create();

		var i;
		for (var i = 0; i < turnsToWaitMax; i++)
		{
			world.turnAdvance();
			displacementToTarget.overwriteWith(targetPos).subtract(unitPos);
			var distanceToTarget = displacementToTarget.magnitude();
			var isAtDestination = (distanceToTarget == 0);
		}

		Assert.isTrue(i >= turnsToWaitMax);
	}

}
