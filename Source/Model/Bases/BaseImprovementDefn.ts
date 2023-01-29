
class BaseImprovementDefn
{
	name: string;
	industryToBuild: number;
	costPerTurn: number;
	isWonder: boolean;

	constructor
	(
		name: string,
		industryToBuild: number,
		costPerTurn: number,
		isWonder: boolean
	)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
		this.costPerTurn = costPerTurn;
		this.isWonder = isWonder;
	}

	static _instances: BaseImprovementDefn_Instances;
	static Instances(): BaseImprovementDefn_Instances
	{
		if (BaseImprovementDefn._instances == null)
		{
			BaseImprovementDefn._instances = new BaseImprovementDefn_Instances();
		}
		return BaseImprovementDefn._instances;
	}

	static byName(name: string): BaseImprovementDefn
	{
		return BaseImprovementDefn.Instances().byName(name);
	}

	build(world: World, base: Base): void
	{
		base.improvementAdd(this);
	}

	discontentPopulationMitigated(owner: Owner): number
	{
		var returnValue = 0;

		var improvements = BaseImprovementDefn.Instances();
		var techs = Technology.Instances();

		if (this == improvements.Temple)
		{
			returnValue += 1;

			if (owner.technologyIsKnown(techs.Mysticism))
			{
				returnValue += 1;
			}
		}
		else if (this == improvements.Colosseum)
		{
			returnValue += 3;

			if (owner.technologyIsKnown(techs.Electronics))
			{
				returnValue += 1;
			}
		}
		else if (this == improvements.Cathedral)
		{
			returnValue += 3;

			if (owner.technologyIsKnown(techs.Theology))
			{
				returnValue += 1;
			}
			
			if (owner.technologyIsKnown(techs.Communism))
			{
				returnValue -= 1;
			}
		}

		return returnValue;
	}
}

class BaseImprovementDefn_Instances
{
	Airport: BaseImprovementDefn;
	Aqueduct: BaseImprovementDefn;
	Bank: BaseImprovementDefn;
	Barracks: BaseImprovementDefn;
	Capitalization: BaseImprovementDefn;
	Cathedral: BaseImprovementDefn;
	CityWalls: BaseImprovementDefn;
	CoastalFortress: BaseImprovementDefn;
	Colosseum: BaseImprovementDefn;
	Courthouse: BaseImprovementDefn;
	Factory: BaseImprovementDefn;
	Granary: BaseImprovementDefn;
	Harbor: BaseImprovementDefn;
	HydroPlant: BaseImprovementDefn;
	Library: BaseImprovementDefn;
	ManufacturingPlant: BaseImprovementDefn;
	Marketplace: BaseImprovementDefn;
	MassTransit: BaseImprovementDefn;
	NuclearPlant: BaseImprovementDefn;
	OffshorePlatform: BaseImprovementDefn;
	Palace: BaseImprovementDefn;
	PoliceStation: BaseImprovementDefn;
	PortFacility: BaseImprovementDefn;
	PowerPlant: BaseImprovementDefn;
	RecyclingCenter: BaseImprovementDefn;
	ResearchLab: BaseImprovementDefn;
	SamMissileBattery: BaseImprovementDefn;
	SdiDefense: BaseImprovementDefn;
	SewerSystem: BaseImprovementDefn;
	SolarPlant: BaseImprovementDefn;
	StockExchange: BaseImprovementDefn;
	Superhighways: BaseImprovementDefn;
	Supermarkets: BaseImprovementDefn;
	Temple: BaseImprovementDefn;
	University: BaseImprovementDefn;
	
	AdamSmithsTradingCo: BaseImprovementDefn;
	ApolloProgram: BaseImprovementDefn;
	Colossus: BaseImprovementDefn;
	CopernicusObservatory: BaseImprovementDefn;
	CureForCancer: BaseImprovementDefn;
	DarwinsVoyage: BaseImprovementDefn;
	EiffelTower: BaseImprovementDefn;
	GreatLibrary: BaseImprovementDefn;
	GreatWall: BaseImprovementDefn;
	HangingGardens: BaseImprovementDefn;
	HooverDam: BaseImprovementDefn;
	IsaacNewtonsCollege: BaseImprovementDefn;
	JsBachsCathedral: BaseImprovementDefn;
	KingRichardsCrusade: BaseImprovementDefn;
	LeonardosWorkshop: BaseImprovementDefn;
	Lighthouse: BaseImprovementDefn;
	MagellansExpedition: BaseImprovementDefn;
	ManhattanProject: BaseImprovementDefn;
	MarcoPolosEmbassy: BaseImprovementDefn;
	MichelangelosChapel: BaseImprovementDefn;
	Oracle: BaseImprovementDefn;
	Pyramids: BaseImprovementDefn;
	SetiProgram: BaseImprovementDefn;
	ShakespearesTheatre: BaseImprovementDefn;
	StatueOfLiberty: BaseImprovementDefn;
	SunTzusWarAcademy: BaseImprovementDefn;
	UnitedNations: BaseImprovementDefn;
	WomensSuffrage: BaseImprovementDefn;

	_All: BaseImprovementDefn[];
	_AllByName: Map<string, BaseImprovementDefn>;

	constructor()
	{
		var bid = (n: string, i: number, c: number, w: boolean) => new BaseImprovementDefn(n, i, c, w);

		// 									name, 					ind, 	cost, 	wonder
		this.Airport 				= bid("Airport", 				160, 	3, 		false);
		this.Aqueduct 				= bid("Aqueduct", 				80, 	2, 		false);
		this.Bank 					= bid("Bank", 					120, 	3, 		false);
		this.Barracks 				= bid("Barracks", 				40, 	1, 		false);
		this.Capitalization 		= bid("Capitalization", 		null, 	null, 	false);
		this.Cathedral 				= bid("Cathedral", 				120, 	3, 		false);
		this.CityWalls 				= bid("City Walls", 			80, 	0, 		false);
		this.CoastalFortress 		= bid("Coastal Fortress", 		80, 	1, 		false);
		this.Colosseum				= bid("Colosseum", 				100, 	4, 		false);
		this.Courthouse 			= bid("Courthouse", 			80, 	1, 		false);
		this.Factory 				= bid("Factory", 				200, 	4, 		false);
		this.Granary 				= bid("Granary", 				60, 	1, 		false);
		this.Harbor 				= bid("Harbor",					60, 	1, 		false);
		this.HydroPlant 			= bid("Hydro Plant", 			240, 	4, 		false);
		this.Library 				= bid("Library", 				80, 	1, 		false);
		this.ManufacturingPlant 	= bid("Manufacturing Plant", 	320, 	6, 		false);
		this.Marketplace			= bid("Marketplace", 			80, 	1, 		false);
		this.MassTransit			= bid("Mass Transit", 			160, 	4, 		false);
		this.NuclearPlant			= bid("Nuclear Plant", 			160, 	2, 		false);
		this.OffshorePlatform 		= bid("Offshore Platform", 		160, 	3, 		false);
		this.Palace 				= bid("Palace", 				10, 	0, 		false);
		this.PoliceStation 			= bid("Police Station", 		60, 	2, 		false);
		this.PortFacility 			= bid("Port Facility", 			80, 	3, 		false);
		this.PowerPlant 			= bid("Power Plant", 			160, 	4, 		false);
		this.RecyclingCenter		= bid("Recycling Center", 		200, 	2, 		false);
		this.ResearchLab			= bid("Research Lab", 			160, 	3, 		false);
		this.SamMissileBattery 		= bid("SAM Missile Battery", 	100, 	2, 		false);
		this.SdiDefense 			= bid("SDI Defense", 			200, 	4, 		false);
		this.SewerSystem 			= bid("Sewer System", 			120, 	2, 		false);
		this.SolarPlant				= bid("Solar Plant", 			320, 	4, 		false);
		this.StockExchange 			= bid("Stock Exchange", 		160, 	4, 		false);
		this.Superhighways			= bid("Superhighways",			200, 	5, 		false);
		this.Supermarkets			= bid("Supermarkets",			80, 	3, 		false);
		this.Temple 				= bid("Temple", 				40, 	1, 		false);
		this.University 			= bid("University",				160, 	3, 		false);

		// Wonders.
		this.AdamSmithsTradingCo 	= bid("Adam Smith's Trading Co",400, 	0,		true);
		this.ApolloProgram 			= bid("Apollo Program",			600, 	0,		true);
		this.Colossus 				= bid("Colossus",				200, 	0,		true);
		this.CopernicusObservatory 	= bid("Copernicus' Observatory",300, 	0,		true);
		this.CureForCancer 			= bid("Cure for Cancer",		600, 	0,		true);
		this.DarwinsVoyage 			= bid("Darwin's Voyage",		400, 	0,		true);
		this.EiffelTower 			= bid("Eiffel Tower",			300, 	0,		true);
		this.GreatLibrary 			= bid("Great Library",			300, 	0,		true);
		this.GreatWall 				= bid("GreatWall",				300, 	0,		true);
		this.HangingGardens 		= bid("HangingGardens",			200, 	0,		true);
		this.HooverDam 				= bid("Hoover Dam",				600, 	0,		true);
		this.IsaacNewtonsCollege 	= bid("Isaac Newton's College",	400, 	0,		true);
		this.JsBachsCathedral		= bid("J.S. Bach's Cathedral",	400, 	0,		true);
		this.KingRichardsCrusade 	= bid("King Richard's Crusade",	300, 	0,		true);
		this.LeonardosWorkshop 		= bid("Leonardo's Workshop",	400, 	0,		true);
		this.Lighthouse 			= bid("Lighthouse",				200, 	0,		true);
		this.MagellansExpedition 	= bid("Magellan's Expedition",	400, 	0,		true);
		this.ManhattanProject 		= bid("Manhattan Project",		600, 	0,		true);
		this.MarcoPolosEmbassy 		= bid("Marco's Polo's Embassy", 200, 	0,		true);
		this.MichelangelosChapel 	= bid("Michelangelo's Chapel", 	400, 	0,		true);
		this.Oracle					= bid("Oracle",					300, 	0,		true);
		this.Pyramids 				= bid("Pyramids",				200, 	0,		true);
		this.SetiProgram 			= bid("SETI Program",			600, 	0,		true);
		this.ShakespearesTheatre 	= bid("Shakespeare's Theatre",	300, 	0,		true);
		this.StatueOfLiberty 		= bid("Statue of Liberty",		400, 	0,		true);
		this.SunTzusWarAcademy 		= bid("Sun Tzu's War Academy", 	300, 	0,		true);
		this.UnitedNations 			= bid("United Nations",			600, 	0,		true);
		this.WomensSuffrage 		= bid("Women's Suffrage",		600, 	0,		true);

		this._All =
		[
			// City improvements.

			this.Airport,
			this.Aqueduct,
			this.Bank,
			this.Barracks,
			this.Capitalization,
			this.Cathedral,
			this.CityWalls,
			this.CoastalFortress,
			this.Colosseum,
			this.Courthouse,
			this.Factory,
			this.Granary,
			this.Harbor,
			this.HydroPlant,
			this.Library,
			this.ManufacturingPlant,
			this.Marketplace,
			this.MassTransit,
			this.NuclearPlant,
			this.OffshorePlatform,
			this.Palace,
			this.PoliceStation,
			this.PortFacility,
			this.PowerPlant,
			this.RecyclingCenter,
			this.ResearchLab,
			this.SamMissileBattery,
			this.SdiDefense,
			this.SewerSystem,
			this.SolarPlant,
			this.StockExchange,
			this.Superhighways,
			this.Supermarkets,
			this.Temple,
			this.University,

			// Wonders.

			this.AdamSmithsTradingCo,
			this.ApolloProgram,
			this.Colossus,
			this.CopernicusObservatory,
			this.CureForCancer,
			this.DarwinsVoyage,
			this.EiffelTower,
			this.GreatLibrary,
			this.GreatWall,
			this.HangingGardens,
			this.HooverDam,
			this.IsaacNewtonsCollege,
			this.JsBachsCathedral,
			this.KingRichardsCrusade,
			this.LeonardosWorkshop,
			this.Lighthouse,
			this.MagellansExpedition,
			this.ManhattanProject,
			this.MarcoPolosEmbassy,
			this.MichelangelosChapel,
			this.Oracle,
			this.Pyramids,
			this.SetiProgram,
			this.ShakespearesTheatre,
			this.StatueOfLiberty,
			this.SunTzusWarAcademy,
			this.UnitedNations,
			this.WomensSuffrage,
		];

		this._AllByName = new Map(this._All.map(x => [ x.name, x ] ) );
	}

	byName(name: string): BaseImprovementDefn
	{
		return this._AllByName.get(name);
	}
}

