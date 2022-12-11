
class Technology
{
	constructor
	(
		name,
		researchToLearn,
		prerequisiteNames,
		governmentAllowedName,
		buildablesAllowedNames
	)
	{
		this.name = name;
		this.researchToLearn = researchToLearn;
		this.prerequisiteNames = prerequisiteNames;
		this.governmentAllowedName = governmentAllowedName;
		this.buildablesAllowedNames = buildablesAllowedNames;
	}

	static Instances()
	{
		if (Technology._instances == null)
		{
			Technology._instances = new Technology_Instances();
		}
		return Technology._instances;
	}

	static byName(name)
	{
		return Technology.Instances().byName(name);
	}

	prerequisitesAreSatisfiedByTechnologies(technologiesKnown)
	{
		var areAnyPrereqsMissing = this.prerequisiteNames.some
		(
			prereqName =>
				technologiesKnown.some
				(
					tech => tech.name == prereqName
				) == false
		);
		var areAllPrereqsSatisfied = !areAnyPrereqsMissing;
		return areAllPrereqsSatisfied;
	}
}

class Technology_Instances
{
	constructor()
	{
		var t = (n, rtl, pn, ga, ba) =>
			new Technology(n, rtl, pn, (ga == null ? null : ga.name), ba.map(x => x.name) );
		var costTodo = 10;
		var prereqsNone = [];
		var buildablesNone = [];
		var govNone = null;
		var govs = Government.Instances();
		var bids = BaseImprovementDefn.Instances();
		var uds = UnitDefn.Instances();

		//							name					cost		prereqs		 governmt 				buildables
		this._Basic				= t("_Basic", 				0, 			prereqsNone, govs.Despotism, 		[ uds.Settlers ], );

		this.AdvancedFlight		= t("Advanced Flight", 		costTodo, 	prereqsNone, govNone, 				[ uds.Bomber, uds.Carrier ] );
		this.Alphabet			= t("Alphabet", 			costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.AmphibiousWarfare	= t("Amphibious Warfare", 	costTodo, 	prereqsNone, govNone, 				[ uds.Marines, bids.PortFacility ] );
		this.Astronomy			= t("Astronomy", 			costTodo, 	prereqsNone, govNone, 				[ bids.CopernicusObservatory ] );
		this.AtomicTheory		= t("Atomic Theory", 		costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.Automobile			= t("Automobile", 			costTodo, 	prereqsNone, govNone, 				[ uds.Battleship, bids.Superhighways ] );
		this.Banking			= t("Banking", 				costTodo, 	prereqsNone, govNone, 				[ bids.Bank ] );
		this.BridgeBuilding		= t("BridgeBuilding", 		costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.BronzeWorking 		= t("Bronze Working", 		costTodo, 	prereqsNone, govNone, 				[ uds.Phalanx ] );
		this.CeremonialBurial	= t("Ceremonial Burial",	costTodo, 	prereqsNone, govNone, 				[ bids.Temple ] );
		this.Chemistry			= t("Chemistry", 			costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.Chivalry			= t("Chivalry", 			costTodo, 	prereqsNone, govNone, 				[ uds.Knights ] );
		this.CodeOfLaws			= t("Code of Laws", 		costTodo, 	prereqsNone, govNone, 				[ bids.Courthouse ] );
		this.CombinedArms		= t("Combined Arms", 		costTodo, 	prereqsNone, govNone, 				[ uds.Paratroopers, uds.Helicopter ] );
		this.Combustion			= t("Combustion", 			costTodo, 	prereqsNone, govNone, 				[ uds.Submarine ] );
		this.Communism			= t("Communism", 			costTodo, 	prereqsNone, govs.Communism,		[ bids.PoliceStation, bids.UnitedNations ] );
		this.Computers			= t("Computers", 			costTodo, 	prereqsNone, govNone, 				[ bids.ResearchLab, bids.SetiProgram ] );
		this.Conscription		= t("Conscription", 		costTodo, 	prereqsNone, govNone, 				[ uds.Riflemen ] );
		this.Construction		= t("Construction", 		costTodo, 	prereqsNone, govNone, 				[ bids.Aqueduct, bids.Colosseum ] );
		this.Corporation		= t("Corporation", 			costTodo, 	prereqsNone, govNone, 				[ uds.Freight, bids.Capitalization ] );
		this.Currency 			= t("Currency", 			costTodo, 	prereqsNone, govNone, 				[ bids.Marketplace ] );
		this.Democracy			= t("Democracy", 			costTodo, 	prereqsNone, govs.Democracy, 		[ bids.StatueOfLiberty ] );
		this.Economics			= t("Economics", 			costTodo, 	prereqsNone, govNone, 				[ bids.StockExchange, bids.AdamSmithsTradingCo ] );
		this.Electricity		= t("Electricity", 			costTodo, 	prereqsNone, govNone, 				[ uds.Destroyer ] );
		this.Electronics		= t("Electronics", 			costTodo, 	prereqsNone, govNone, 				[ bids.HydroPlant, bids.HooverDam ] );
		this.Engineering		= t("Engineering", 			costTodo, 	prereqsNone, govNone, 				[ bids.KingRichardsCrusade ] );
		this.Environmentalism	= t("Environmentalism", 	costTodo, 	prereqsNone, govNone, 				[ bids.SolarPlant ] );
		this.Espionage			= t("Espionage", 			costTodo, 	prereqsNone, govNone, 				[ uds.Spy ] );
		this.Explosives			= t("Explosives", 			costTodo, 	prereqsNone, govNone, 				[ uds.Engineers ] );
		this.Feudalism			= t("Feudalism", 			costTodo, 	prereqsNone, govNone, 				[ uds.Pikemen ] );
		this.Flight				= t("Flight", 				costTodo, 	prereqsNone, govNone, 				[ uds.Fighter ] );
		this.Fundamentalism		= t("Fundamentalism", 		costTodo, 	prereqsNone, govs.Fundamentalism, 	[ uds.Fanatics ] );
		this.FusionPower		= t("Fusion Power", 		costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.GeneticEngineering	= t("Genetic Engineering", 	costTodo, 	prereqsNone, govNone, 				[ bids.CureForCancer ] );
		this.GuerrillaWarfare	= t("Guerrilla Warfare", 	costTodo, 	prereqsNone, govNone, 				[ uds.Partisans ] );
		this.Gunpowder 			= t("Gunpowder", 			costTodo, 	prereqsNone, govNone, 				[ uds.Musketeers ] );
		this.HorsebackRiding 	= t("Horseback Riding", 	costTodo, 	prereqsNone, govNone, 				[ uds.Horsemen ] );
		this.Industrialization	= t("Industrialization", 	costTodo, 	prereqsNone, govNone, 				[ bids.Factory, bids.WomensSuffrage ] );
		this.Invention			= t("Invention", 			costTodo, 	prereqsNone, govNone, 				[ bids.LeonardosWorkshop ] );
		this.IronWorking		= t("IronWorking", 			costTodo, 	prereqsNone, govNone, 				[ uds.Legion ] );
		this.LaborUnion			= t("Labor Union", 			costTodo, 	prereqsNone, govNone, 				[ uds.MechanizedInfantry ] );
		this.Laser				= t("Laser", 				costTodo, 	prereqsNone, govNone, 				[ bids.SdiDefense ]);
		this.Leadership			= t("Leadership", 			costTodo, 	prereqsNone, govNone, 				[ uds.Dragoons ] );
		this.Literacy			= t("Literacy", 			costTodo, 	prereqsNone, govNone, 				[ bids.GreatLibrary ] );
		this.MachineTools		= t("Machine Tools", 		costTodo, 	prereqsNone, govNone, 				[ uds.Artillery ] );
		this.Magnetism			= t("Magnetism", 			costTodo, 	prereqsNone, govNone, 				[ uds.Galleon, uds.Frigate ] );
		this.MapMaking			= t("Map Making", 			costTodo, 	prereqsNone, govNone, 				[ uds.Trireme ] );
		this.Masonry			= t("Masonry", 				costTodo, 	prereqsNone, govNone, 				[ bids.Palace, bids.CityWalls, bids.Pyramids, bids.GreatWall ] );
		this.MassProduction		= t("Mass Production", 		costTodo, 	prereqsNone, govNone, 				[ bids.MassTransit ] );
		this.Mathematics		= t("Mathematics", 			costTodo, 	prereqsNone, govNone, 				[ uds.Catapult ] );
		this.Medicine			= t("Medicine", 			costTodo, 	prereqsNone, govNone, 				[ bids.ShakespearesTheatre ] );
		this.Metallurgy			= t("Metallurgy", 			costTodo, 	prereqsNone, govNone, 				[ uds.Cannon, bids.CoastalFortress ] );
		this.Miniaturization	= t("Miniaturization", 		costTodo, 	prereqsNone, govNone, 				[ bids.OffshorePlatform ] );
		this.MobileWarfare		= t("Mobile Warfare", 		costTodo, 	prereqsNone, govNone, 				[ uds.Armor ] );
		this.Monarchy			= t("Monarchy", 			costTodo, 	prereqsNone, govs.Monarchy, 		buildablesNone);
		this.Monotheism			= t("Monotheism", 			costTodo, 	prereqsNone, govNone, 				[ uds.Crusaders, bids.Cathedral, bids.MichelangelosChapel ] );
		this.Mysticism			= t("Mysticism", 			costTodo, 	prereqsNone, govNone, 				[ bids.Oracle ] );
		this.Navigation			= t("Navigation", 			costTodo, 	prereqsNone, govNone, 				[ uds.Caravel, bids.MagellansExpedition ] );
		this.NuclearFission		= t("Nuclear Fission", 		costTodo, 	prereqsNone, govNone, 				[ bids.ManhattanProject ] );
		this.NuclearPower		= t("Nuclear Power", 		costTodo, 	prereqsNone, govNone, 				[ bids.NuclearPlant ] );
		this.Philosophy			= t("Philosophy", 			costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.Physics			= t("Physics", 				costTodo, 	prereqsNone, govNone, 				buildablesNone);
		this.Plastics			= t("Plastics", 			costTodo, 	prereqsNone, govNone, 				[ bids.SsComponent ] );
		this.Polytheism			= t("Polytheism", 			costTodo, 	prereqsNone, govNone, 				[ uds.Elephants ] );
		this.Pottery			= t("Pottery", 				costTodo, 	prereqsNone, govNone, 				[ bids.Granary, bids.HangingGardens ] );
		this.Radio				= t("Radio", 				costTodo, 	prereqsNone, govNone, 				[ bids.Airport ] );
		this.Railroad			= t("Railroad", 			costTodo, 	prereqsNone, govNone, 				[ bids.DarwinsVoyage ] );
		this.Recycling			= t("Recycling", 			costTodo, 	prereqsNone, govNone, 				[ bids.RecyclingCenter ] );
		this.Refining			= t("Refining", 			costTodo, 	prereqsNone, govNone, 				[ bids.PowerPlant ] );
		this.Refrigeration		= t("Refrigeration", 		costTodo, 	prereqsNone, govNone, 				[ bids.Supermarkets ] );
		this.Republic			= t("Republic", 			costTodo, 	prereqsNone, govs.Republic, 		buildablesNone);
		this.Robotics			= t("Robotics", 			costTodo, 	prereqsNone, govNone, 				[ uds.Howitzer, bids.ManufacturingPlant ] );
		this.Rocketry			= t("Rocketry", 			costTodo, 	prereqsNone, govNone, 				[ uds.AegisCruiser, uds.CruiseMissile, uds.NuclearMissile, bids.SamMissileBattery] );
		this.Sanitation			= t("Sanitation", 			costTodo, 	prereqsNone, govNone, 				[ bids.SewerSystem ] );
		this.Seafaring			= t("Seafaring", 			costTodo, 	prereqsNone, govNone, 				[ uds.Explorer, bids.Harbor ] );
		this.SpaceFlight		= t("Space Flight", 		costTodo, 	prereqsNone, govNone, 				[ bids.SsStructural, bids.ApolloProgram ] );
		this.Stealth			= t("Stealth", 				costTodo, 	prereqsNone, govNone, 				[ uds.StealthFighter, uds.StealthBomber ] );
		this.SteamEngine		= t("Steam Engine", 		costTodo, 	prereqsNone, govNone, 				[ uds.Ironclad, bids.EiffelTower ]);
		this.Steel				= t("Steel", 				costTodo, 	prereqsNone, govNone, 				[ uds.Cruiser ] );
		this.Superconductor 	= t("Superconductor", 		costTodo, 	prereqsNone, govNone, 				[ bids.SsModule ] );
		this.Tactics			= t("Tactics", 				costTodo, 	prereqsNone, govNone, 				[ uds.AlpineTroops, uds.Cavalry ] );
		this.Theology			= t("Theology", 			costTodo, 	prereqsNone, govNone, 				[ bids.JsBachsCathedral ] );
		this.TheoryOfGravity	= t("TheoryOfGravity", 		costTodo, 	prereqsNone, govNone, 				[ bids.IsaacNewtonsCollege ] );
		this.Trade				= t("Trade", 				costTodo, 	prereqsNone, govNone, 				[ uds.Caravan ] );
		this.University			= t("University", 			costTodo, 	prereqsNone, govNone, 				[ bids.University ] );
		this.WarriorCode		= t("Warrior Code", 		costTodo, 	prereqsNone, govNone, 				[ uds.Archers ] );
		this.Wheel				= t("The Wheel", 			costTodo, 	prereqsNone, govNone, 				[ uds.Chariot ]);
		this.Writing			= t("Writing", 				costTodo, 	prereqsNone, govNone, 				[ uds.Diplomat, bids.Library ] );

		var prereqsSet = (tech, prereqs) => { tech.prerequisiteNames = prereqs.map(x => x.name); };

		prereqsSet(this.AdvancedFlight, 	[ this.MachineTools, this.Radio ] );
		prereqsSet(this.Alphabet, 			[] );
		prereqsSet(this.AmphibiousWarfare, 	[ this.Navigation, this.Tactics ] );
		prereqsSet(this.Astronomy, 			[ this.Mathematics, this.Mysticism ] );
		prereqsSet(this.AtomicTheory, 		[ this.Physics, this.TheoryOfGravity ] );
		prereqsSet(this.Automobile, 		[ this.Combustion, this.Steel ] );
		prereqsSet(this.Banking, 			[ this.Republic, this.Trade ] );
		prereqsSet(this.BridgeBuilding, 	[ this.Construction, this.IronWorking ] );
		prereqsSet(this.BronzeWorking, 		[] );
		prereqsSet(this.CeremonialBurial, 	[] );
		prereqsSet(this.Chemistry, 			[ this.Medicine, this.University ] );
		prereqsSet(this.Chivalry, 			[ this.Feudalism, this.HorsebackRiding ] );
		prereqsSet(this.CodeOfLaws, 		[ this.Alphabet ] );
		prereqsSet(this.CombinedArms, 		[ this.AdvancedFlight, this.MobileWarfare ] );
		prereqsSet(this.Combustion, 		[ this.Explosives, this.Refining ] );
		prereqsSet(this.Communism, 			[ this.Industrialization, this.Philosophy ] );
		prereqsSet(this.Computers, 			[ this.MassProduction, this.Miniaturization ] );
		prereqsSet(this.Conscription, 		[ this.Democracy, this.Metallurgy ] );
		prereqsSet(this.Construction, 		[ this.Currency, this.Masonry ] );
		prereqsSet(this.Corporation, 		[ this.Economics, this.Industrialization ] );
		prereqsSet(this.Currency, 			[ this.BronzeWorking ] );
		prereqsSet(this.Democracy, 			[ this.Banking, this.Invention ] );
		prereqsSet(this.Economics, 			[ this.Banking, this.University, ] );
		prereqsSet(this.Electricity, 		[ this.Magnetism, this.Metallurgy ] );
		prereqsSet(this.Electronics, 		[ this.Corporation, this.Electricity ] );
		prereqsSet(this.Engineering, 		[ this.Construction, this.Wheel ] );
		prereqsSet(this.Environmentalism, 	[ this.Recycling, this.SpaceFlight ] );
		prereqsSet(this.Espionage, 			[ this.Communism, this.Democracy ] );
		prereqsSet(this.Explosives, 		[ this.Chemistry, this.Gunpowder ] );
		prereqsSet(this.Feudalism, 			[ this.Monarchy, this.WarriorCode ] );
		prereqsSet(this.Flight, 			[ this.Combustion, this.TheoryOfGravity ] );
		prereqsSet(this.Fundamentalism, 	[ this.Conscription, this.Monotheism ] );
		prereqsSet(this.FusionPower, 		[ this.NuclearPower, this.Superconductor ] );
		prereqsSet(this.GeneticEngineering, [ this.Corporation, this.Medicine ] );
		prereqsSet(this.GuerrillaWarfare, 	[ this.Communism, this.Tactics ] );
		prereqsSet(this.Gunpowder, 			[ this.Invention, this.IronWorking ] );
		prereqsSet(this.HorsebackRiding, 	[] );
		prereqsSet(this.Industrialization, 	[ this.Banking, this.Railroad ] );
		prereqsSet(this.Invention, 			[ this.Engineering, this.Literacy ] );
		prereqsSet(this.IronWorking, 		[ this.BronzeWorking, this.WarriorCode ] );
		prereqsSet(this.LaborUnion, 		[ this.GuerrillaWarfare, this.MassProduction ] );
		prereqsSet(this.Laser, 				[ this.MassProduction, this.NuclearPower ] );
		prereqsSet(this.Leadership, 		[ this.Chivalry, this.Gunpowder ] );
		prereqsSet(this.Literacy, 			[ this.CodeOfLaws, this.Writing ] );
		prereqsSet(this.MachineTools, 		[ this.Steel, this.Tactics ] );
		prereqsSet(this.Magnetism, 			[ this.IronWorking, this.Physics ] );
		prereqsSet(this.MapMaking, 			[ this.Alphabet ] );
		prereqsSet(this.Masonry, 			[] );
		prereqsSet(this.MassProduction, 	[ this.Automobile, this.Corporation ] );
		prereqsSet(this.Mathematics, 		[ this.Alphabet, this.Masonry ] );
		prereqsSet(this.Medicine, 			[ this.Philosophy, this.Trade ] );
		prereqsSet(this.Metallurgy, 		[ this.Gunpowder, this.University ] );
		prereqsSet(this.Miniaturization, 	[ this.Electronics, this.MachineTools ] );
		prereqsSet(this.MobileWarfare, 		[ this.Automobile, this.Tactics ] );
		prereqsSet(this.Monarchy, 			[ this.CeremonialBurial, this.CodeOfLaws ] );
		prereqsSet(this.Monotheism, 		[ this.Philosophy, this.Polytheism ] );
		prereqsSet(this.Mysticism, 			[ this.CeremonialBurial ] );
		prereqsSet(this.Navigation, 		[ this.Astronomy, this.Seafaring ] );
		prereqsSet(this.NuclearFission, 	[ this.AtomicTheory, this.MassProduction ] );
		prereqsSet(this.NuclearPower, 		[ this.Electronics, this.NuclearFission ] );
		prereqsSet(this.Philosophy, 		[ this.Literacy, this.Mysticism ] );
		prereqsSet(this.Physics, 			[ this.Literacy, this.Navigation ] );
		prereqsSet(this.Plastics, 			[ this.Refining, this.SpaceFlight ] );
		prereqsSet(this.Polytheism, 		[ this.CeremonialBurial, this.HorsebackRiding ] );
		prereqsSet(this.Pottery, 			[] );
		prereqsSet(this.Radio, 				[ this.Electricity, this.Flight ] );
		prereqsSet(this.Railroad, 			[ this.BridgeBuilding, this.SteamEngine ] );
		prereqsSet(this.Recycling, 			[ this.Democracy, this.MassProduction ] );
		prereqsSet(this.Refining, 			[ this.Chemistry, this.Corporation ] );
		prereqsSet(this.Refrigeration, 		[ this.Electricity, this.Sanitation] );
		prereqsSet(this.Republic, 			[ this.CodeOfLaws, this.Literacy ] );
		prereqsSet(this.Robotics, 			[ this.Computers, this.MobileWarfare ] );
		prereqsSet(this.Rocketry, 			[ this.AdvancedFlight, this.Electronics ] );
		prereqsSet(this.Sanitation, 		[ this.Engineering, this.Medicine ] );
		prereqsSet(this.Seafaring, 			[ this.MapMaking, this.Pottery ] );
		prereqsSet(this.SpaceFlight, 		[ this.Computers, this.Rocketry ] );
		prereqsSet(this.Stealth, 			[ this.Robotics, this.Superconductor ] );
		prereqsSet(this.SteamEngine, 		[ this.Invention, this.Physics ] );
		prereqsSet(this.Steel, 				[ this.Electricity, this.Industrialization ] );
		prereqsSet(this.Superconductor, 	[ this.Laser, this.Plastics ] );
		prereqsSet(this.Tactics, 			[ this.Conscription, this.Leadership ] );
		prereqsSet(this.Theology, 			[ this.Feudalism, this.Monotheism] );
		prereqsSet(this.TheoryOfGravity, 	[ this.Astronomy, this.University ] );
		prereqsSet(this.Trade, 				[ this.CodeOfLaws, this.Currency ] );
		prereqsSet(this.University, 		[ this.Mathematics, this.Philosophy] );
		prereqsSet(this.WarriorCode, 		[] );
		prereqsSet(this.Wheel, 				[ this.HorsebackRiding ] );
		prereqsSet(this.Writing, 			[ this.Alphabet ] );

		this._All =
		[
			this._Basic,

			this.AdvancedFlight,
			this.Alphabet,
			this.AmphibiousWarfare,
			this.Astronomy,
			this.AtomicTheory,
			this.Automobile,
			this.Banking,
			this.BridgeBuilding,
			this.BronzeWorking,
			this.CeremonialBurial,
			this.Chemistry,
			this.Chivalry,
			this.CodeOfLaws,
			this.CombinedArms,
			this.Combustion,
			this.Communism,
			this.Computers,
			this.Conscription,
			this.Construction,
			this.Corporation,
			this.Currency,
			this.Democracy,
			this.Economics,
			this.Electricity,
			this.Electronics,
			this.Engineering,
			this.Environmentalism,
			this.Espionage,
			this.Explosives,
			this.Feudalism,
			this.Flight,
			this.Fundamentalism,
			this.FusionPower,
			this.GeneticEngineering,
			this.GuerrillaWarfare,
			this.Gunpowder,
			this.HorsebackRiding,
			this.Industrialization,
			this.Invention,
			this.IronWorking,
			this.LaborUnion,
			this.Laser,
			this.Leadership,
			this.Literacy,
			this.MachineTools,
			this.Magnetism,
			this.MapMaking,
			this.Masonry,
			this.MassProduction,
			this.Mathematics,
			this.Medicine,
			this.Metallurgy,
			this.Miniaturization,
			this.MobileWarfare,
			this.Monarchy,
			this.Monotheism,
			this.Mysticism,
			this.Navigation,
			this.NuclearFission,
			this.NuclearPower,
			this.Philosophy,
			this.Physics,
			this.Plastics,
			this.Polytheism,
			this.Pottery,
			this.Radio,
			this.Railroad,
			this.Recycling,
			this.Refining,
			this.Refrigeration,
			this.Republic,
			this.Robotics,
			this.Rocketry,
			this.Sanitation,
			this.Seafaring,
			this.SpaceFlight,
			this.Stealth,
			this.SteamEngine,
			this.Steel,
			this.Superconductor,
			this.Tactics,
			this.Theology,
			this.TheoryOfGravity,
			this.Trade,
			this.University,
			this.WarriorCode,
			this.Wheel,
			this.Writing
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
	}
}
