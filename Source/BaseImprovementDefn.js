
class BaseImprovementDefn
{
	constructor(name, industryToBuild, costPerTurn)
	{
		this.name = name;
		this.industryToBuild = industryToBuild;
		this.costPerTurn = costPerTurn;
	}

	static Instances()
	{
		if (BaseImprovementDefn._instances == null)
		{
			BaseImprovementDefn._instances = new BaseImprovementDefn_Instances();
		}
		return BaseImprovementDefn._instances;
	}

	static byName(name)
	{
		return BaseImprovementDefn.Instances().byName(name);
	}

	build(world, base)
	{
		base.improvementAdd(this);
	}

	discontentPopulationMitigated(owner)
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
	constructor()
	{
		var bid = (n, i, c) => new BaseImprovementDefn(n, i, c);

		this.Airport 				= bid("Airport", 				160, 	3);
		this.Aqueduct 				= bid("Aqueduct", 				80, 	2);
		this.Bank 					= bid("Bank", 					120, 	3);
		this.Barracks 				= bid("Barracks", 				40, 	1);
		this.Capitalization 		= bid("Capitalization", 		null, 	null);
		this.Cathedral 				= bid("Cathedral", 				120, 	3);
		this.CityWalls 				= bid("City Walls", 			80, 	0);
		this.CoastalFortress 		= bid("Coastal Fortress", 		80, 	1);
		this.Colosseum				= bid("Colosseum", 				100, 	4);
		this.Courthouse 			= bid("Courthouse", 			80, 	1);
		this.Factory 				= bid("Factory", 				200, 	4);
		this.Granary 				= bid("Granary", 				60, 	1);
		this.Harbor 				= bid("Harbor",					60, 	1);
		this.HydroPlant 			= bid("Hydro Plant", 			240, 	4);
		this.Library 				= bid("Library", 				80, 	1);
		this.ManufacturingPlant 	= bid("Manufacturing Plant", 	320, 	6);
		this.Marketplace			= bid("Marketplace", 			80, 	1);
		this.MassTransit			= bid("Mass Transit", 			160, 	4);
		this.NuclearPlant			= bid("Nuclear Plant", 			160, 	2);
		this.OffshorePlatform 		= bid("Offshore Platform", 		160, 	3);
		this.Palace 				= bid("Palace", 				10, 	0);
		this.PoliceStation 			= bid("Police Station", 		60, 	2);
		this.PortFacility 			= bid("Port Facility", 			80, 	3);
		this.PowerPlant 			= bid("Power Plant", 			160, 	4);
		this.RecyclingCenter		= bid("Recycling Center", 		200, 	2);
		this.ResearchLab			= bid("Research Lab", 			160, 	3);
		this.SamMissileBattery 		= bid("SAM Missile Battery", 	100, 	2);
		this.SdiDefense 			= bid("SDI Defense", 			200, 	4);
		this.SewerSystem 			= bid("Sewer System", 			120, 	2);
		this.SolarPlant				= bid("Solar Plant", 			320, 	4);
		this.StockExchange 			= bid("Stock Exchange", 		160, 	4);
		this.Superhighways			= bid("Superhighways",			200, 	5);
		this.Supermarkets			= bid("Supermarkets",			80, 	3);
		this.Temple 				= bid("Temple", 				40, 	1);
		this.University 			= bid("University",				160, 	3);

		this.AdamSmithsTradingCo 	= bid("Adam Smith's Trading Co",400, 	0);
		this.ApolloProgram 			= bid("Apollo Program",			600, 	0);
		this.Colossus 				= bid("Colossus",				200, 	0);
		this.CopernicusObservatory 	= bid("Copernicus' Observatory",300, 	0);
		this.CureForCancer 			= bid("Cure for Cancer",		600, 	0);
		this.DarwinsVoyage 			= bid("Darwin's Voyage",		400, 	0);
		this.EiffelTower 			= bid("Eiffel Tower",			300, 	0);
		this.GreatLibrary 			= bid("Great Library",			300, 	0);
		this.GreatWall 				= bid("GreatWall",				300, 	0);
		this.HangingGardens 		= bid("HangingGardens",			200, 	0);
		this.HooverDam 				= bid("Hoover Dam",				600, 	0);
		this.IsaacNewtonsCollege 	= bid("Isaac Newton's College",	400, 	0);
		this.JsBachsCathedral		= bid("J.S. Bach's Cathedral",	400, 	0);
		this.KingRichardsCrusade 	= bid("King Richard's Crusade",	300, 	0);
		this.LeonardosWorkshop 		= bid("Leonardo's Workshop",	400, 	0);
		this.Lighthouse 			= bid("Lighthouse",				200, 	0);
		this.MagellansExpedition 	= bid("Magellan's Expedition",	400, 	0);
		this.ManhattanProject 		= bid("Manhattan Project",		600, 	0);
		this.MarcoPolosEmbassy 		= bid("Marco's Polo's Embassy", 200, 	0);
		this.MichelangelosChapel 	= bid("Michelangelo's Chapel", 	400, 	0);
		this.Oracle					= bid("Oracle",					300, 	0);
		this.Pyramids 				= bid("Pyramids",				200, 	0);
		this.SetiProgram 			= bid("SETI Program",			600, 	0);
		this.ShakespearesTheatre 	= bid("Shakespeare's Theatre",	300, 	0);
		this.StatueOfLiberty 		= bid("Statue of Liberty",		400, 	0);
		this.SunTzusWarAcademy 		= bid("Sun Tzu's War Academy", 	300, 	0);
		this.UnitedNations 			= bid("United Nations",			600, 	0);
		this.WomensSuffrage 		= bid("Women's Suffrage",		600, 	0);

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

	byName(name)
	{
		return this._AllByName.get(name);
	}
}

