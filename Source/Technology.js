
class Technology
{
	constructor
	(
		name,
		researchToLearn,
		prerequisiteNames,
		buildablesAllowedNames,
	)
	{
		this.name = name;
		this.researchToLearn = researchToLearn;
		this.prerequisiteNames = prerequisiteNames;
		this.buildablesAllowedNames = buildablesAllowedNames;
	}
}

class Technology_Instances
{
	constructor()
	{
		var t = (n, r, p, u) => { return new Technology(n, r, p, u); };

		this.AdvancedFlight		= t("Advanced Flight");
		this.Alphabet			= t("Alphabet");
		this.AmphibiousWarfare	= t("Amphibious Warfare");
		this.Astronomy			= t("Astronomy");
		this.AtomicTheory		= t("Atomic Theory");
		this.Automobile			= t("Automobile");
		this.Banking			= t("Banking");
		this.BridgeBuilding		= t("BridgeBuilding");
		this.BronzeWorking 		= t("Bronze Working");
		this.CeremonialBurial	= t("Ceremonial Burial");
		this.Chemistry			= t("Chemistry");
		this.Chivalry			= t("Chivalry");
		this.CodeOfLaws			= t("Code of Laws");
		this.CombinedArms		= t("Combined Arms");
		this.Combustion			= t("Combustion");
		this.Communism			= t("Communism");
		this.Computers			= t("Computers");
		this.Conscription		= t("Conscription");
		this.Construction		= t("Construction");
		this.Corporation		= t("Corporation");
		this.Currency 			= t("Currency");
		this.Democracy			= t("Democracy");
		this.Economics			= t("Economics");
		this.Electricity		= t("Electricity");
		this.Electronics		= t("Electronics");
		this.Engineering		= t("Engineering");
		this.Environmentalism	= t("Environmentalism");
		this.Espionage			= t("Espionage");
		this.Explosives			= t("Explosives");
		this.Feudalism			= t("Feudalism");
		this.Flight				= t("Flight");
		this.Fundamentalism		= t("Fundamentalism");
		this.FusionPower		= t("Fusion Power");
		this.GeneticEngineering	= t("Genetic Engineering");
		this.GuerrillaWarfare	= t("Guerrilla Warfare");
		this.Gunpowder 			= t("Gunpowder");
		this.HorsebackRiding 	= t("Horseback Riding");
		this.Industrialization	= t("Industrialization");
		this.Invention			= t("Invention");
		this.IronWorking		= t("IronWorking");
		this.LaborUnion			= t("Labor Union");
		this.Laser				= t("Laser");
		this.Leadership			= t("Leadership");
		this.Literacy			= t("Literacy");
		this.MachineTools		= t("Machine Tools");
		this.Magnetism			= t("Magnetism");
		this.MapMaking			= t("Map Making");
		this.Masonry			= t("Masonry");
		this.MassProduction		= t("Mass Production");
		this.Mathematics		= t("Mathematics");
		this.Medicine			= t("Medicine");
		this.Metallurgy			= t("Metallurgy");
		this.Miniaturization	= t("Miniaturization");
		this.MobileWarfare		= t("Mobile Warfare");
		this.Monarchy			= t("Monarchy");
		this.Monotheism			= t("Monotheism");
		this.Mysticism			= t("Mysticism");
		this.Navigation			= t("Navigation");
		this.NuclearFission		= t("Nuclear Fission");
		this.NuclearPower		= t("Nuclear Power");
		this.Philosophy			= t("Philosophy");
		this.Physics			= t("Physics");
		this.Plastics			= t("Plastics");
		this.Polytheism			= t("Polytheism");
		this.Pottery			= t("Pottery");
		this.Radio				= t("Radio");
		this.Railroad			= t("Railroad");
		this.Recycling			= t("Recycling");
		this.Refining			= t("Refining");
		this.Refrigeration		= t("Refrigeration");
		this.Republic			= t("Republic");
		this.Robotics			= t("Robotics");
		this.Rocketry			= t("Rocketry");
		this.Sanitization		= t("Sanitization");
		this.Seafaring			= t("Seafaring");
		this.Spaceflight		= t("Spaceflight");
		this.Stealth			= t("Stealth");
		this.SteamEngine		= t("Steam Engine");
		this.Steel				= t("Steel");
		this.Superconductors	= t("Superconductors");
		this.Tactics			= t("Tactics");
		this.Theology			= t("Theology");
		this.TheoryOfGravity	= t("TheoryOfGravity");
		this.Trade				= t("Trade");
		this.University			= t("University");
		this.WarriorCode		= t("Warrior Code");
		this.Wheels				= t("Wheels");
		this.Writing			= t("Writing");

		this._All =
		[
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
			this.Sanitization,
			this.Seafaring,
			this.Spaceflight,
			this.Stealth,
			this.SteamEngine,
			this.Steel,
			this.Superconductors,
			this.Tactics,
			this.Theology,
			this.TheoryOfGravity,
			this.Trade,
			this.University,
			this.WarriorCode,
			this.Wheels,
			this.Writing
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}
}
