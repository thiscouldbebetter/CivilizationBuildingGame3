
class Government
{
	constructor
	(
		name,
		taxRateMax,
		unhappyPopulationMitigatedByMartialLaw,
		corruptionPerUnitDistanceFromCapital,
		industryConsumedByUnitsSupportedByBase,
	)
	{
		this.name = name;
		this.taxRateMax = taxRateMax;
		this.unhappyPopulationMitigatedByMartialLaw =
			unhappyPopulationMitigatedByMartialLaw;
		this.corruptionPerUnitDistanceFromCapital =
			corruptionPerUnitDistanceFromCapital;
		this.industryConsumedByUnitsSupportedByBase =
			industryConsumedByUnitsSupportedByBase;
	}

	static Instances()
	{
		if (Government._instances == null)
		{
			Government._instances = new Government_Instances();
		}
		return Government._instances;
	}

	static byName(name)
	{
		return Government.Instances().byName(name);
	}
}

class Government_Instances
{
	constructor()
	{
		var cpudfcTodo = 0; // corruptionPerUnitDistanceFromCapital
		var supportTodo = (base, world) => 0;
		var supportPastBaseSize = (industryPerUnitSupportedPastBaseSize) =>
		{
			var returnMethod = (base) => 
			{
				var unitsToSupportCount =
					base.unitsSupportedCount() - base.population;
				if (unitsToSupportCount < 0)
				{
					unitsToSupportCount = 0;
				}
				var industryToSupportUnits =
					industryPerUnitSupportedPastBaseSize
					* unitsToSupportCount;
				return industryToSupportUnits;
			};
			
			return returnMethod;
		};

		var supportPastUnitCount =
			(industryPerUnitSupportedPastFreeCount, unitsSupportedForFreeCount) =>
			{
				var returnMethod = (base) => 
				{
					var unitsToSupportCount =
						base.unitsSupportedCount() - unitsSupportedForFreeCount;
					if (unitsToSupportCount < 0)
					{
						unitsToSupportCount = 0;
					}
					var industryToSupportUnits =
						industryPerUnitSupportedPastFreeCount
						* unitsToSupportCount;
					return industryToSupportUnits;
				};
				
				return returnMethod;
			};

		var unhappyPopulationMitigatedByMartialLaw = 3;

		// 									 name				tax 	martial law,	corruption		support
		this.Anarchy 		= new Government("Anarchy", 		.6, 	0,				cpudfcTodo, 	supportPastBaseSize(1) )
		this.Communism 		= new Government("Communism",		.8, 	3,				cpudfcTodo, 	supportPastUnitCount(3, 1) );
		this.Democracy 		= new Government("Democracy", 		1, 		0,				cpudfcTodo, 	supportPastUnitCount(0, 1) );
		this.Despotism 		= new Government("Despotism", 		.6, 	2,				cpudfcTodo, 	supportPastBaseSize(1) );
		this.Fundamentalism = new Government("Fundamentalism", 	.8, 	3,				cpudfcTodo, 	supportPastUnitCount(10, 1) );
		this.Monarchy 		= new Government("Monarchy", 		.7, 	3,				cpudfcTodo, 	supportPastUnitCount(3, 1) );
		this.Republic 		= new Government("Republic", 		.8, 	1,				cpudfcTodo, 	supportPastUnitCount(0, 1) );

		this._All =
		[
			this.Anarchy,
			this.Communism,
			this.Democracy,
			this.Despotism,
			this.Fundamentalism,
			this.Monarchy,
			this.Republic
		];

		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name)
	{
		return this._AllByName.get(name);
	}
}
