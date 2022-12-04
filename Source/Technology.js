
class Technology
{
	constructor
	(
		name,
		researchToLearn,
		prerequisiteNames,
		buildablesAllowedNames
	)
	{
		this.name = name;
		this.researchToLearn = researchToLearn;
		this.prerequisiteNames = prerequisiteNames;
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
}

class Technology_Instances
{
	constructor()
	{
		var t = (n, rtl, pn, ba) => { return new Technology(n, rtl, pn, ba.map(x => x.name) ); };
		var costTodo = 10;
		var prereqsNone = [];
		var buildablesNone = [];
		var bids = BaseImprovementDefn.Instances();
		var uds = UnitDefn.Instances();

		//							name					cost		prereqs		 buildables
		this._Default			= t("_Default", 			0, 			prereqsNone, [ uds.Settlers ] );

		this.AdvancedFlight		= t("Advanced Flight", 		costTodo, 	prereqsNone, [ uds.Bomber, uds.Carrier ] );
		this.Alphabet			= t("Alphabet", 			costTodo, 	prereqsNone, buildablesNone);
		this.AmphibiousWarfare	= t("Amphibious Warfare", 	costTodo, 	prereqsNone, [ uds.Marines, bids.PortFacility ] );
		this.Astronomy			= t("Astronomy", 			costTodo, 	prereqsNone, [ bids.CopernicusObservatory ] );
		this.AtomicTheory		= t("Atomic Theory", 		costTodo, 	prereqsNone, buildablesNone);
		this.Automobile			= t("Automobile", 			costTodo, 	prereqsNone, [ uds.Battleship, bids.Superhighways ] );
		this.Banking			= t("Banking", 				costTodo, 	prereqsNone, [ bids.Bank ] );
		this.BridgeBuilding		= t("BridgeBuilding", 		costTodo, 	prereqsNone, buildablesNone);
		this.BronzeWorking 		= t("Bronze Working", 		costTodo, 	prereqsNone, [ uds.Phalanx ] );
		this.CeremonialBurial	= t("Ceremonial Burial",	costTodo, 	prereqsNone, [ bids.Temple ] );
		this.Chemistry			= t("Chemistry", 			costTodo, 	prereqsNone, buildablesNone);
		this.Chivalry			= t("Chivalry", 			costTodo, 	prereqsNone, [ uds.Knights ] );
		this.CodeOfLaws			= t("Code of Laws", 		costTodo, 	prereqsNone, [ bids.Courthouse ] );
		this.CombinedArms		= t("Combined Arms", 		costTodo, 	prereqsNone, [ uds.Paratrooper, uds.Helicopter ] );
		this.Combustion			= t("Combustion", 			costTodo, 	prereqsNone, [ uds.Submarine ] );
		this.Communism			= t("Communism", 			costTodo, 	prereqsNone, [ bids.PoliceStation, bids.UnitedNations ] );
		this.Computers			= t("Computers", 			costTodo, 	prereqsNone, [ bids.ResearchLab, bids.SetiProgram ] );
		this.Conscription		= t("Conscription", 		costTodo, 	prereqsNone, [ uds.Riflemen ] );
		this.Construction		= t("Construction", 		costTodo, 	prereqsNone, [ bids.Aqueduct, bids.Colosseum ] );
		this.Corporation		= t("Corporation", 			costTodo, 	prereqsNone, [ uds.Freight, bids.Capitalization ] );
		this.Currency 			= t("Currency", 			costTodo, 	prereqsNone, [ bids.Marketplace ] );
		this.Democracy			= t("Democracy", 			costTodo, 	prereqsNone, [ bids.StatueOfLiberty ] );
		this.Economics			= t("Economics", 			costTodo, 	prereqsNone, [ bids.StockExchange, bids.AdamSmithsTradingCo ] );
		this.Electricity		= t("Electricity", 			costTodo, 	prereqsNone, [ uds.Destroyer ] );
		this.Electronics		= t("Electronics", 			costTodo, 	prereqsNone, [ bids.HydroPlant, bids.HooverDam ] );
		this.Engineering		= t("Engineering", 			costTodo, 	prereqsNone, [ bids.KingRichardsCrusade ] );
		this.Environmentalism	= t("Environmentalism", 	costTodo, 	prereqsNone, [ bids.SolarPlant ] );
		this.Espionage			= t("Espionage", 			costTodo, 	prereqsNone, [ uds.Spy ] );
		this.Explosives			= t("Explosives", 			costTodo, 	prereqsNone, [ uds.Engineers ] );
		this.Feudalism			= t("Feudalism", 			costTodo, 	prereqsNone, [ uds.Pikemen ] );
		this.Flight				= t("Flight", 				costTodo, 	prereqsNone, [ uds.Fighter ] );
		this.Fundamentalism		= t("Fundamentalism", 		costTodo, 	prereqsNone, [ uds.Fanatics ] );
		this.FusionPower		= t("Fusion Power", 		costTodo, 	prereqsNone, buildablesNone);
		this.GeneticEngineering	= t("Genetic Engineering", 	costTodo, 	prereqsNone, [ bids.CureForCancer ] );
		this.GuerrillaWarfare	= t("Guerrilla Warfare", 	costTodo, 	prereqsNone, [ uds.Partisans ] );
		this.Gunpowder 			= t("Gunpowder", 			costTodo, 	prereqsNone, [ uds.Musketeers ] );
		this.HorsebackRiding 	= t("Horseback Riding", 	costTodo, 	prereqsNone, [ uds.Horsemen ] );
		this.Industrialization	= t("Industrialization", 	costTodo, 	prereqsNone, [ bids.Factory, bids.WomensSuffrage ] );
		this.Invention			= t("Invention", 			costTodo, 	prereqsNone, [ bids.LeonardosWorkshop ] );
		this.IronWorking		= t("IronWorking", 			costTodo, 	prereqsNone, [ uds.Legion ] );
		this.LaborUnion			= t("Labor Union", 			costTodo, 	prereqsNone, [ uds.MechanizedInfantry ] );
		this.Laser				= t("Laser", 				costTodo, 	prereqsNone, [ bids.SdiDefense ]);
		this.Leadership			= t("Leadership", 			costTodo, 	prereqsNone, [ uds.Dragoons ] );
		this.Literacy			= t("Literacy", 			costTodo, 	prereqsNone, [ bids.GreatLibrary ] );
		this.MachineTools		= t("Machine Tools", 		costTodo, 	prereqsNone, [ uds.Artillery ] );
		this.Magnetism			= t("Magnetism", 			costTodo, 	prereqsNone, [ uds.Galleon, uds.Frigate ] );
		this.MapMaking			= t("Map Making", 			costTodo, 	prereqsNone, [ uds.Trireme ] );
		this.Masonry			= t("Masonry", 				costTodo, 	prereqsNone, [ bids.Palace, bids.CityWalls, bids.Pyramids, bids.GreatWall ] );
		this.MassProduction		= t("Mass Production", 		costTodo, 	prereqsNone, [ bids.MassTransit ] );
		this.Mathematics		= t("Mathematics", 			costTodo, 	prereqsNone, [ uds.Catapult ] );
		this.Medicine			= t("Medicine", 			costTodo, 	prereqsNone, [ bids.ShakespearesTheatre ] );
		this.Metallurgy			= t("Metallurgy", 			costTodo, 	prereqsNone, [ uds.Cannon, bids.CoastalFortress ] );
		this.Miniaturization	= t("Miniaturization", 		costTodo, 	prereqsNone, [ bids.OffshorePlatform ] );
		this.MobileWarfare		= t("Mobile Warfare", 		costTodo, 	prereqsNone, [ uds.Armor ] );
		this.Monarchy			= t("Monarchy", 			costTodo, 	prereqsNone, buildablesNone);
		this.Monotheism			= t("Monotheism", 			costTodo, 	prereqsNone, [ uds.Crusaders, bids.Cathedral, bids.MichelangelosChapel ] );
		this.Mysticism			= t("Mysticism", 			costTodo, 	prereqsNone, [ bids.Oracle ] );
		this.Navigation			= t("Navigation", 			costTodo, 	prereqsNone, [ uds.Caravel, bids.MagellansExpedition ] );
		this.NuclearFission		= t("Nuclear Fission", 		costTodo, 	prereqsNone, [ bids.ManhattanProject ] );
		this.NuclearPower		= t("Nuclear Power", 		costTodo, 	prereqsNone, [ bids.NuclearPlant ] );
		this.Philosophy			= t("Philosophy", 			costTodo, 	prereqsNone, buildablesNone);
		this.Physics			= t("Physics", 				costTodo, 	prereqsNone, buildablesNone);
		this.Plastics			= t("Plastics", 			costTodo, 	prereqsNone, [ bids.SsComponent ] );
		this.Polytheism			= t("Polytheism", 			costTodo, 	prereqsNone, [ uds.Elephant ] );
		this.Pottery			= t("Pottery", 				costTodo, 	prereqsNone, [ bids.Granary, bids.HangingGardens ] );
		this.Radio				= t("Radio", 				costTodo, 	prereqsNone, [ bids.Airport ] );
		this.Railroad			= t("Railroad", 			costTodo, 	prereqsNone, [ bids.DarwinsVoyage ] );
		this.Recycling			= t("Recycling", 			costTodo, 	prereqsNone, [ bids.RecyclingCenter ] );
		this.Refining			= t("Refining", 			costTodo, 	prereqsNone, [ bids.PowerPlant ] );
		this.Refrigeration		= t("Refrigeration", 		costTodo, 	prereqsNone, [ bids.Supermarket ] );
		this.Republic			= t("Republic", 			costTodo, 	prereqsNone, buildablesNone);
		this.Robotics			= t("Robotics", 			costTodo, 	prereqsNone, [ uds.Howitzer, bids.ManufacturingPlant ] );
		this.Rocketry			= t("Rocketry", 			costTodo, 	prereqsNone, [ uds.AegisCruiser, uds.CruiseMissile, uds.NuclearMissile, bids.SamMissileBattery] );
		this.Sanitation			= t("Sanitation", 			costTodo, 	prereqsNone, [ bids.SewerSystem ] );
		this.Seafaring			= t("Seafaring", 			costTodo, 	prereqsNone, [ uds.Explorer, bids.Harbor ] );
		this.SpaceFlight		= t("Space Flight", 		costTodo, 	prereqsNone, [ bids.SsStructural, bids.ApolloProgram ] );
		this.Stealth			= t("Stealth", 				costTodo, 	prereqsNone, [ uds.StealthFighter, uds.StealthBomber ] );
		this.SteamEngine		= t("Steam Engine", 		costTodo, 	prereqsNone, [ uds.Ironclad, bids.EiffelTower ]);
		this.Steel				= t("Steel", 				costTodo, 	prereqsNone, [ uds.Cruiser ] );
		this.Superconductor 	= t("Superconductor", 		costTodo, 	prereqsNone, [ bids.SsModule ] );
		this.Tactics			= t("Tactics", 				costTodo, 	prereqsNone, [ uds.AlpineTroops, uds.Cavalry ] );
		this.Theology			= t("Theology", 			costTodo, 	prereqsNone, [ bids.JsBachsCathedral ] );
		this.TheoryOfGravity	= t("TheoryOfGravity", 		costTodo, 	prereqsNone, [ bids.IsaacNewtonsCollege ] );
		this.Trade				= t("Trade", 				costTodo, 	prereqsNone, [ uds.Caravan ] );
		this.University			= t("University", 			costTodo, 	prereqsNone, [ bids.University ] );
		this.WarriorCode		= t("Warrior Code", 		costTodo, 	prereqsNone, [ uds.Archers ] );
		this.Wheel				= t("The Wheel", 			costTodo, 	prereqsNone, [ uds.Chariot ]);
		this.Writing			= t("Writing", 				costTodo, 	prereqsNone, [ uds.Diplomat, bids.Library ] );

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
		prereqsSet(this.Masonry, 			[ this.Construction, this.Mathematics ] );
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
			this._Default,

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
