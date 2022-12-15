
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
		this.playFromStart_7_BaseUnrest();
		this.playFromStart_8_Research();
		this.playFromStart_9_BaseGrowthLimiters();
		this.playFromStart_10_ResearchAllAndBuildStarship();
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
	}

	playFromStart_2_UnitMovement()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var unit = owner.unitSelected();
		var directions = Direction.Instances();
		var east = directions.East;
		var west = directions.West;

		// Verify that the unit has moves initially.
		Assert.isTrue(unit.movesThisTurn() > 0);

		// Count the number of known cells before the move.
		var ownerMapKnowledge = owner.mapKnowledge;
		var cellsKnownIndices = ownerMapKnowledge.cellsKnownIndicesByIndex;
		var cellsKnownCountBeforeMove = cellsKnownIndices.size;

		// Move the unit.
		var unitPosBeforeMove = unit.pos.clone();
		var directionToMove = east;
		unit.moveInDirection(directionToMove, world);

		// Make sure the unit has used up its moves.
		Assert.isFalse(unit.hasMovesThisTurn());

		// Make sure the unit's position has changed by the correct offset.
		var unitPosAfterMove = unit.pos.clone();
		var offsetMoved = unitPosAfterMove.clone().subtract(unitPosBeforeMove);
		Assert.isTrue(offsetMoved.equals(directionToMove.offset));

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
		var activityBefore = unit.activity;
		Assert.isNull(activityBefore);
		unit.activityStart(activityDefns.SettlersStartCity, world);

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

		var directions = Direction.Instances();
		var east = directions.East;
		var north = directions.North;
		var south = directions.South;
		var west = directions.West;

		// Move the settler one cell, irrigate, and verify.
		unit.moveInDirection(east, world);
		world.turnAdvance();
		var activityDefns = UnitActivityDefn.Instances();
		this.waitNTurnsForUnitInWorldToCompleteActivity
		(
			this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildIrrigation
		);
		var cell = map.cellAtPosInCells(unit.pos);
		var cellHasIrrigation = cell.hasIrrigation();
		Assert.isTrue(cellHasIrrigation);

		// Build some roads, and verify they appeared.
		this.waitNTurnsForUnitInWorldToCompleteActivity
		(
			this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildRoads
		);
		cell = map.cellAtPosInCells(unit.pos);
		var cellHasRoads = cell.hasRoads();
		Assert.isTrue(cellHasRoads);

		// Re-optimize the base's labor.
		var resourcesBeforeOptimize = base.resourcesProducedThisTurn(world).clone();
		base.laborOptimize(world);
		var resourcesAfterOptimize =
			base.resourcesProducedThisTurn(world);
		Assert.isFalse(resourcesAfterOptimize.equals(resourcesBeforeOptimize) );

		world.turnAdvance(); // hack - Should this be necessary?

		// Move the settlers back into the city and out again,
		// then make sure a third of a move remains.
		unit.moveInDirection(west, world);
		unit.moveInDirection(east, world);
		Assert.isTrue(unit.hasMovesThisTurn());
		Assert.areEqual(1, unit.moveThirdsThisTurn);

		// Try to move the unit off the road,
		// but it can't, because it only has 1/3 move left. 
		var unitPosBeforeMoveAttempt = unit.pos.clone();
		unit.moveInDirection(east, world);
		Assert.isTrue(unit.pos.equals(unitPosBeforeMoveAttempt) );

		// End the turn and try again, it should work now.
		world.turnAdvance();
		unitPosBeforeMoveAttempt = unit.pos.clone();
		unit.moveInDirection(east, world);
		Assert.isFalse(unit.pos.equals(unitPosBeforeMoveAttempt) );

		// Improve some more land (to make enough to make later tests feasible).
		var directionsToMove =
		[
			north, north, west, west, west, south
		];
		directionsToMove.forEach(direction =>
		{
			unit.moveInDirection(direction, world);
			world.turnAdvance();
			Assert.isFalse(map.cellAtPosInCells(unit.pos).hasIrrigation());
			Assert.isFalse(map.cellAtPosInCells(unit.pos).hasRoads());
			this.waitNTurnsForUnitInWorldToCompleteActivity
			(
				this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildIrrigation 
			);
			this.waitNTurnsForUnitInWorldToCompleteActivity
			(
				this.turnsToWaitMax, unit, world, activityDefns.SettlersBuildRoads
			);
			world.turnAdvance();
		});
	}

	playFromStart_7_BaseUnrest()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];
		var difficultyLevel = world.difficultyLevel();

		// Verify that the city is not experiencing unrest yet.
		Assert.isFalse(base.isExperiencingUnrest(world) );

		// Wait for the population to grow until new citizens are unhappy.
		while (base.population() <= difficultyLevel.basePopulationBeforeUnhappiness)
		{
			this.waitNTurnsForPopulationOfBaseInWorldToGrowByOne
			(
				this.turnsToWaitMax, base, world, true // isBaseExpectedToActuallyGrow
			);
		}

		// Verify that the city is now experiencing unrest.
		Assert.isTrue(base.isExperiencingUnrest(world) );

		// Verify that production is halted due to unrest.
		Assert.isTrue(base.industryThisTurnNet(world) <= 0);

		// Reassign a worker as an entertainer and verify that they add happiness.
		Assert.areEqual(0, base.luxuriesThisTurn(world) );
		base.workerWorstReassignAsEntertainer(world);
		Assert.areEqual(2, base.luxuriesThisTurn(world) );

		// Build a military unit and verify that martial law mitigates unhappiness.
		var unitDefns = UnitDefn.Instances();
		this.waitNTurnsForBaseInWorldToBuildUnitDefn
		(
			this.turnsToWaitMax, base, world, unitDefns.Warriors
		);
	}

	playFromStart_8_Research()
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
		Assert.isTrue(base.foodStockpiled >= (foodNeededToGrow / 2) );
	}

	playFromStart_9_BaseGrowthLimiters()
	{
		var world = this.world;
		var owner = world.ownerCurrent();
		var base = owner.bases[0];

		// Build some more military units to enforce martial law.

		var unitDefns = UnitDefn.Instances();
		for (var i = 0; i < 3; i++)
		{
			this.waitNTurnsForBaseInWorldToBuildUnitDefn
			(
				this.turnsToWaitMax, base, world, unitDefns.Warriors
			);
		}

		// Do some more research and build a temple (with mysticism)
		// and colosseum to prevent population growth leading to unrest.

		var technologies = Technology.Instances();
		this.waitNTurnsForOwnerInWorldToResearchTechs
		(
			this.turnsToWaitMax, owner, world,
			[
				technologies.CeremonialBurial,
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
				technologies.Alphabet,
				technologies.CodeOfLaws,
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

	playFromStart_10_ResearchAllAndBuildStarship()
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

		// Build a starship, launch it, and wait for it to reach destination.
		this.waitNTurnsForBaseInWorldToBuildStarshipParts
		(
			this.turnsToWaitMax, base, world
		);
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
			foodNeededToGrow - base.foodStockpiled;
		var foodPerTurn = base.foodThisTurnNet(world);
		var turnsToWait = Math.ceil(foodAdditionalNeededToGrow / foodPerTurn);
		Assert.isTrue(turnsToWait < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWait);
		var basePopulationAfter = base.population();
		var didBaseActuallyGrow = (basePopulationAfter == basePopulationBefore + 1);
		Assert.areEqual(isBaseExpectedToActuallyGrow, didBaseActuallyGrow);
	}

	waitNTurnsForUnitInWorldToCompleteActivity
	(
		turnsToWaitMax, unit, world, activityDefn
	)
	{
		unit.activityStart(activityDefn, world);
		var unitDefn = unit.defn(world);
		var turnsToWaitExpected =
			activityDefn.movesToComplete / unitDefn.movesPerTurn();
		Assert.isTrue(turnsToWaitExpected < turnsToWaitMax);
		world.turnAdvanceMultiple(turnsToWaitExpected);
	}
}
