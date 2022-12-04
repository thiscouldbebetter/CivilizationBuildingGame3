
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
		var t = (n, rtl, pn, ban) => { return new Technology(n, rtl, pn, ban); };
		var costTodo = 10;
		var prereqsNone = [];
		var buildablesNone = [];
		var bids = BaseImprovementDefn.Instances();
		var uds = UnitDefn.Instances();

		//							name					cost		prereqs		 buildables
		this._Default			= t("_Default", 			0, 			prereqsNone, [ uds.Settlers.name ]);

		this.AdvancedFlight		= t("Advanced Flight", 		costTodo, 	prereqsNone, [ uds.Bomber.name, uds.Carrier.name ] );
		this.Alphabet			= t("Alphabet", 			costTodo, 	prereqsNone, buildablesNone);
		this.AmphibiousWarfare	= t("Amphibious Warfare", 	costTodo, 	prereqsNone, buildablesNone);
		this.Astronomy			= t("Astronomy", 			costTodo, 	prereqsNone, buildablesNone);
		this.AtomicTheory		= t("Atomic Theory", 		costTodo, 	prereqsNone, buildablesNone);
		this.Automobile			= t("Automobile", 			costTodo, 	prereqsNone, buildablesNone);
		this.Banking			= t("Banking", 				costTodo, 	prereqsNone, buildablesNone);
		this.BridgeBuilding		= t("BridgeBuilding", 		costTodo, 	prereqsNone, buildablesNone);
		this.BronzeWorking 		= t("Bronze Working", 		costTodo, 	prereqsNone, [ uds.Phalanx.name ] );
		this.CeremonialBurial	= t("Ceremonial Burial",	costTodo, 	prereqsNone, [ bids.Temple.name ] );
		this.Chemistry			= t("Chemistry", 			costTodo, 	prereqsNone, buildablesNone);
		this.Chivalry			= t("Chivalry", 			costTodo, 	prereqsNone, buildablesNone);
		this.CodeOfLaws			= t("Code of Laws", 		costTodo, 	prereqsNone, buildablesNone);
		this.CombinedArms		= t("Combined Arms", 		costTodo, 	prereqsNone, buildablesNone);
		this.Combustion			= t("Combustion", 			costTodo, 	prereqsNone, buildablesNone);
		this.Communism			= t("Communism", 			costTodo, 	prereqsNone, buildablesNone);
		this.Computers			= t("Computers", 			costTodo, 	prereqsNone, buildablesNone);
		this.Conscription		= t("Conscription", 		costTodo, 	prereqsNone, buildablesNone);
		this.Construction		= t("Construction", 		costTodo, 	prereqsNone, buildablesNone);
		this.Corporation		= t("Corporation", 			costTodo, 	prereqsNone, buildablesNone);
		this.Currency 			= t("Currency", 			costTodo, 	prereqsNone, buildablesNone);
		this.Democracy			= t("Democracy", 			costTodo, 	prereqsNone, buildablesNone);
		this.Economics			= t("Economics", 			costTodo, 	prereqsNone, buildablesNone);
		this.Electricity		= t("Electricity", 			costTodo, 	prereqsNone, buildablesNone);
		this.Electronics		= t("Electronics", 			costTodo, 	prereqsNone, buildablesNone);
		this.Engineering		= t("Engineering", 			costTodo, 	prereqsNone, buildablesNone);
		this.Environmentalism	= t("Environmentalism", 	costTodo, 	prereqsNone, buildablesNone);
		this.Espionage			= t("Espionage", 			costTodo, 	prereqsNone, buildablesNone);
		this.Explosives			= t("Explosives", 			costTodo, 	prereqsNone, buildablesNone);
		this.Feudalism			= t("Feudalism", 			costTodo, 	prereqsNone, buildablesNone);
		this.Flight				= t("Flight", 				costTodo, 	prereqsNone, buildablesNone);
		this.Fundamentalism		= t("Fundamentalism", 		costTodo, 	prereqsNone, buildablesNone);
		this.FusionPower		= t("Fusion Power", 		costTodo, 	prereqsNone, buildablesNone);
		this.GeneticEngineering	= t("Genetic Engineering", 	costTodo, 	prereqsNone, buildablesNone);
		this.GuerrillaWarfare	= t("Guerrilla Warfare", 	costTodo, 	prereqsNone, buildablesNone);
		this.Gunpowder 			= t("Gunpowder", 			costTodo, 	prereqsNone, buildablesNone);
		this.HorsebackRiding 	= t("Horseback Riding", 	costTodo, 	prereqsNone, buildablesNone);
		this.Industrialization	= t("Industrialization", 	costTodo, 	prereqsNone, buildablesNone);
		this.Invention			= t("Invention", 			costTodo, 	prereqsNone, buildablesNone);
		this.IronWorking		= t("IronWorking", 			costTodo, 	prereqsNone, buildablesNone);
		this.LaborUnion			= t("Labor Union", 			costTodo, 	prereqsNone, buildablesNone);
		this.Laser				= t("Laser", 				costTodo, 	prereqsNone, buildablesNone);
		this.Leadership			= t("Leadership", 			costTodo, 	prereqsNone, buildablesNone);
		this.Literacy			= t("Literacy", 			costTodo, 	prereqsNone, buildablesNone);
		this.MachineTools		= t("Machine Tools", 		costTodo, 	prereqsNone, buildablesNone);
		this.Magnetism			= t("Magnetism", 			costTodo, 	prereqsNone, buildablesNone);
		this.MapMaking			= t("Map Making", 			costTodo, 	prereqsNone, buildablesNone);
		this.Masonry			= t("Masonry", 				costTodo, 	prereqsNone, buildablesNone);
		this.MassProduction		= t("Mass Production", 		costTodo, 	prereqsNone, buildablesNone);
		this.Mathematics		= t("Mathematics", 			costTodo, 	prereqsNone, buildablesNone);
		this.Medicine			= t("Medicine", 			costTodo, 	prereqsNone, buildablesNone);
		this.Metallurgy			= t("Metallurgy", 			costTodo, 	prereqsNone, buildablesNone);
		this.Miniaturization	= t("Miniaturization", 		costTodo, 	prereqsNone, buildablesNone);
		this.MobileWarfare		= t("Mobile Warfare", 		costTodo, 	prereqsNone, buildablesNone);
		this.Monarchy			= t("Monarchy", 			costTodo, 	prereqsNone, buildablesNone);
		this.Monotheism			= t("Monotheism", 			costTodo, 	prereqsNone, buildablesNone);
		this.Mysticism			= t("Mysticism", 			costTodo, 	prereqsNone, buildablesNone);
		this.Navigation			= t("Navigation", 			costTodo, 	prereqsNone, buildablesNone);
		this.NuclearFission		= t("Nuclear Fission", 		costTodo, 	prereqsNone, buildablesNone);
		this.NuclearPower		= t("Nuclear Power", 		costTodo, 	prereqsNone, buildablesNone);
		this.Philosophy			= t("Philosophy", 			costTodo, 	prereqsNone, buildablesNone);
		this.Physics			= t("Physics", 				costTodo, 	prereqsNone, buildablesNone);
		this.Plastics			= t("Plastics", 			costTodo, 	prereqsNone, buildablesNone);
		this.Polytheism			= t("Polytheism", 			costTodo, 	prereqsNone, buildablesNone);
		this.Pottery			= t("Pottery", 				costTodo, 	prereqsNone, buildablesNone);
		this.Radio				= t("Radio", 				costTodo, 	prereqsNone, buildablesNone);
		this.Railroad			= t("Railroad", 			costTodo, 	prereqsNone, buildablesNone);
		this.Recycling			= t("Recycling", 			costTodo, 	prereqsNone, buildablesNone);
		this.Refining			= t("Refining", 			costTodo, 	prereqsNone, buildablesNone);
		this.Refrigeration		= t("Refrigeration", 		costTodo, 	prereqsNone, buildablesNone);
		this.Republic			= t("Republic", 			costTodo, 	prereqsNone, buildablesNone);
		this.Robotics			= t("Robotics", 			costTodo, 	prereqsNone, buildablesNone);
		this.Rocketry			= t("Rocketry", 			costTodo, 	prereqsNone, buildablesNone);
		this.Sanitation			= t("Sanitation", 			costTodo, 	prereqsNone, buildablesNone);
		this.Seafaring			= t("Seafaring", 			costTodo, 	prereqsNone, buildablesNone);
		this.SpaceFlight		= t("Space Flight", 		costTodo, 	prereqsNone, buildablesNone);
		this.Stealth			= t("Stealth", 				costTodo, 	prereqsNone, buildablesNone);
		this.SteamEngine		= t("Steam Engine", 		costTodo, 	prereqsNone, buildablesNone);
		this.Steel				= t("Steel", 				costTodo, 	prereqsNone, buildablesNone);
		this.Superconductor 	= t("Superconductor", 		costTodo, 	prereqsNone, buildablesNone);
		this.Tactics			= t("Tactics", 				costTodo, 	prereqsNone, buildablesNone);
		this.Theology			= t("Theology", 			costTodo, 	prereqsNone, buildablesNone);
		this.TheoryOfGravity	= t("TheoryOfGravity", 		costTodo, 	prereqsNone, buildablesNone);
		this.Trade				= t("Trade", 				costTodo, 	prereqsNone, buildablesNone);
		this.University			= t("University", 			costTodo, 	prereqsNone, buildablesNone);
		this.WarriorCode		= t("Warrior Code", 		costTodo, 	prereqsNone, buildablesNone);
		this.Wheel				= t("The Wheel", 			costTodo, 	prereqsNone, buildablesNone);
		this.Writing			= t("Writing", 				costTodo, 	prereqsNone, [ uds.Diplomat.name, bids.Library.name ] );

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
