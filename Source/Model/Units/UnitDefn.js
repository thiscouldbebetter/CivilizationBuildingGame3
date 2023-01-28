
class UnitDefn
{
	constructor
	(
		name,
		industryToBuild,
		movement,
		combat,
		actionsAvailableNames,
		symbol,
		passengersMax
	)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
		this.movement = movement;
		this.combat = combat;
		this.actionsAvailableNames = actionsAvailableNames;
		this.symbol = symbol;
		this.passengersMax = passengersMax || 0;
	}

	static byName(name)
	{
		return UnitDefn.Instances().byName(name);
	}

	static Instances()
	{
		if (UnitDefn._instances == null)
		{
			UnitDefn._instances = new UnitDefn_Instances();
		}
		return UnitDefn._instances;
	}

	actionsAvailable()
	{
		return this.actionsAvailableNames.map(x => UnitActivityDefn.byName(x));
	}

	build(world, base)
	{
		var unitPos = base.pos.clone();
		var baseOwner = base.owner(world);
		var unit = new Unit(baseOwner.name, this.name, unitPos);
		unit.baseSupportingSet(base);
		unit.pos = base.pos.clone();
		world.unitAdd(unit);
	}

	isGround(world, unit)
	{
		return this.movement.isGround(world, unit);
	}

	isMilitary()
	{
		return (this.combat.attack > 0);
	}

	movesPerTurn()
	{
		return this.movement.movesPerTurn();
	}
}

class UnitDefn_Instances
{
	constructor()
	{
		// Movements.
		var ma = (movesPerTurn) => UnitDefnMovement.air(movesPerTurn);
		var mg = (movesPerTurn) => UnitDefnMovement.ground(movesPerTurn);
		var mo = (movesPerTurn) => UnitDefnMovement.ocean(movesPerTurn);

		var mg1 = mg(1);
		var mg2 = mg(2);
		var mg3 = mg(3);
		var mo1 = mo(1);

		var mg1r = mg1; // todo - One move, all ground terrains are roads.

		var ads = UnitActivityDefn.Instances();

		var a0 = [];

		var aCvn =
		[
			ads.Sleep,
			ads.Pass,
			ads.CaravanEstablishTradeRoute,
			ads.CaravanHelpBuildWonder,
			ads.Disband
		];

		var aDip =
		[
			ads.Sleep,
			ads.Pass,
			ads.DiplomatBribeUnit,
			ads.DiplomatEstablishEmbassy,
			ads.DiplomatInciteRevolt,
			ads.DiplomatInvestigateBase,
			ads.DiplomatSabotageProduction,
			ads.DiplomatTechnologySteal,
			ads.Disband
		].map(x => x.name);

		var aFre =
		[
			// todo
		];

		var aSpy =
		[
			ads.Sleep,
			ads.Pass,
			ads.DiplomatBribeUnit,
			ads.DiplomatEstablishEmbassy,
			ads.DiplomatInciteRevolt,
			ads.DiplomatInvestigateBase,
			ads.DiplomatSabotageProduction,
			ads.DiplomatTechnologySteal,
			ads.SpyPlantNuclearDevice,
			ads.SpyPoisonWaterSupply,
			ads.SpySabotageUnit,
			ads.SpySubvertBase,
			ads.Disband
		].map(x => x.name);

		var aSet =
		[
			ads.Sleep,
			ads.Pass,
			ads.SettlersBuildFort,
			ads.SettlersBuildIrrigation,
			ads.SettlersBuildMines,
			ads.SettlersBuildRoads,
			ads.SettlersClearForest,
			ads.SettlersPlantForest,
			ads.SettlersStartCity,
			ads.Disband
		].map(x => x.name);

		var ud = (a, b, c, d, e, f, g) => new UnitDefn(a, b, c, d, e, f, g);
		var c = (a, b, c, d) => new UnitDefnCombat(a, b, c, d); // attack, defense, integrityMaxOver10, damagePerHit
		var udTodo =
			() =>
			{
				return new UnitDefn
				(
					"[todo]", 1000, c(0, 0, 1), UnitDefnMovement.ground(1), null, "?"
				);
			};

		// Taken from https://civilization.fandom.com/wiki/List_of_units_in_Civ2.
		// 						name,						cost,	move, 	combat, 		actns, 	symbol, passengers
		this.AegisCruiser		= ud("AEGIS Cruiser", 		100,	mo(8),	c(8,8,3,2),		a0,		"Aeg");
		this.AlpineTroops		= ud("Alpine Troops",		50,		mg1r,	c(5,5,2,1),		a0,		"Alp");
		this.Archers 			= ud("Archers", 			30, 	mg1,	c(3,2,1,1), 	a0, 	"Arc");
		this.Armor				= ud("Armor",				80, 	mg3,	c(10,5,3,1),	a0,		"Arm");
		this.Artillery			= ud("Artillery",			50,		mg1,	c(10,1,2,2),	a0,		"Art");
		this.Battleship			= ud("Battleship",			160,	mo(4),	c(12,12,4,2),	a0,		"Bat");
		this.Bomber				= ud("Bomber",				120,	ma(8),	c(12,1,2,2),	a0,		"Bom");
		this.Cannon				= ud("Cannon", 				40,		mg1,	c(8,1,2,1),		a0,		"Can");
		this.Caravan			= ud("Caravan",				50,		mg1,	c(0,1,1,1),		aCvn,	"Cvn");
		this.Caravel			= ud("Caravel",				40,		mo(3),	c(2,1,1,1),		a0,		"Cvl", 	3);
		this.Carrier			= ud("Carrier",				160,	mo(5),	c(1,9,4,2),		a0,		"Crr");
		this.Catapult			= ud("Catapult",			40,		mg1,	c(6,1,1,1),		a0,		"Cat");
		this.Cavalry			= ud("Cavalry",				60,		mg2,	c(8,3,2,1),		a0,		"Cav");
		this.Chariot			= ud("Chariot",				30,		mg1,	c(3,1,1,1),		a0, 	"Cha");
		this.CruiseMissile		= ud("Cruise Missile", 		60,		ma(12), c(18,0,1,3),	a0,		"Mis");
		this.Cruiser			= ud("Cruiser",				80,		mo(5),	c(6,6,3,2),		a0,		"Csr");
		this.Crusaders			= ud("Crusaders",			40,		mg2,	c(5,1,1,1),		a0,		"Cdr");
		this.Destroyer			= ud("Destroyer",			60,		mo(6),	c(4,4,3,1),		a0,		"Des");
		this.Diplomat			= ud("Diplomat", 			30,		mg1,	c(0,1,1,1),		aDip,	"Dip");
		this.Dragoons			= ud("Dragoons", 			50,		mg2,	c(5,2,2,1),		a0,		"Dra");
		this.Elephants			= ud("Elephants", 			40,		mg2,	c(4,1,1,1),		a0,		"Ele");
		this.Engineers			= ud("Engineers", 			40,		mg2,	c(0,2,2,1),		a0,		"Eng");
		this.Explorer			= ud("Explorer", 			30, 	mg1r,	c(0,1,1,1),		a0,		"Exp");
		this.Fanatics			= ud("Fanatics", 			20,		mg1,	c(4,4,2,1),		a0,		"Fan");
		this.Fighter			= ud("Fighter", 			60,		ma(10),	c(4,3,2,2),		a0,		"Fig");
		this.Freight			= ud("Freight", 			50,		mg2,	c(0,1,1,1),		aFre,	"Fre");
		this.Frigate			= ud("Frigate", 			50,		mo(4),	c(4,2,2,1),		a0,		"Fri", 	2);
		this.Galleon			= ud("Galleon", 			40,		mo(4),	c(0,2,2,1),		a0,		"Gal", 	4);
		this.Helicopter			= ud("Helicopter", 			100,	ma(6),	c(10,3,2,2),	a0,		"Hel");
		this.Horsemen			= ud("Horsemen", 			20,		mg2,	c(2,1,1,1),		a0,		"Hor");
		this.Howitzer			= ud("Howitzer", 			70,		mg2,	c(12,2,3,2),	a0,		"How");
		this.Ironclad			= ud("Ironclad", 			60,		mo(4),	c(4,4,3,1),		a0,		"Iro");
		this.Knights			= ud("Knights", 			40,		mg2, 	c(2,1,1,1),		a0,		"Kni");
		this.Legion				= ud("Legion", 				40,		mg1,	c(4,2,1,1),		a0,		"Leg");
		this.Marines			= ud("Marines", 			60,		mg1,	c(8,5,2,1),		a0,		"Mar");
		this.MechanizedInfantry = ud("Mechanized Infantry", 50,		mg3,	c(6,6,3,1),		a0,		"Mec");
		this.Musketeers			= ud("Musketeers", 			30,		mg1,	c(3,3,2,1),		a0,		"Mus");
		this.NuclearMissile		= ud("Nuclear Missile", 	160,	ma(16),	c(99,0,1,1),	a0,		"Nuc");
		this.Paratroopers		= ud("Paratroopers", 		60,		mg1,	c(6,4,2,1),		a0,		"Ptp");
		this.Partisans			= ud("Partisans",			50,		mg1,	c(4,4,2,1),		a0,		"Ptn");
		this.Phalanx			= ud("Phalanx",				20,		mg1,	c(1,2,1,1),		a0,		"Pha");
		this.Pikemen			= ud("Pikemen",				20,		mg1,	c(1,2,1,1),		a0,		"Pik");
		this.Riflemen			= ud("Riflemen",			40,		mg1,	c(4,2,1,1),		a0,		"Rif");
		this.Settlers 			= ud("Settlers", 			40, 	mg1, 	c(0,1,2,1),		aSet,	"Set");
		this.Spy				= ud("Spy", 				30,		mg3,	c(0,0,1,1),		aSpy,	"Spy");
		this.StealthBomber		= ud("Stealth Bomber", 		160,	ma(12),	c(14,5,2,2),	a0,		"SBo");
		this.StealthFighter		= ud("Stealth Fighter", 	80,		ma(14),	c(8,4,2,2),		a0,		"SFi");
		this.Submarine			= ud("Submarine", 			60,		mo(3),	c(10,2,3,2),	a0,		"Sub");
		this.Transport			= ud("Transport", 			50,		mo(5),	c(0,3,3,1),		a0,		"Tra", 	8);
		this.Trireme			= ud("Trireme",				40,		mo(3),	c(1,1,1,1),		a0,		"Tri", 	2);
		this.Warriors 			= ud("Warriors", 			10, 	mg1, 	c(1,1,1,1),		a0,		"War");

		this._All =
		[
			this.AegisCruiser,
			this.Battleship,
			this.Bomber,
			this.Cannon,
			this.Caravan,
			this.Caravel,
			this.Carrier,
			this.Catapult,
			this.Cavalry,
			this.Chariot,
			this.CruiseMissile,
			this.Cruiser,
			this.Crusaders,
			this.Destroyer,
			this.Diplomat,
			this.Dragoons,
			this.Elephants,
			this.Engineers,
			this.Explorer,
			this.Fanatics,
			this.Fighter,
			this.Freight,
			this.Frigate,
			this.Galleon,
			this.Helicopter,
			this.Horsemen,
			this.Howitzer,
			this.Ironclad,
			this.Knights,
			this.Legion,
			this.Marines,
			this.MechanizedInfantry,
			this.Musketeers,
			this.NuclearMissile,
			this.Paratroopers,
			this.Partisans,
			this.Phalanx,
			this.Pikemen,
			this.Riflemen,
			this.Settlers,
			this.Spy,
			this.StealthFighter,
			this.Submarine,
			this.Transport,
			this.Trireme,
			this.Warriors
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
	}
}
