
class Government
{
	constructor
	(
		name,
		taxRateMax,
		corruptionPerUnitDistanceFromCapital,
		industryConsumedByUnitCount
	)
	{
		this.name = name;
		this.taxRateMax = taxRateMax;
		this.corruptionPerUnitDistanceFromCapital = corruptionPerUnitDistanceFromCapital;
		this.industryConsumedByUnitCount = industryConsumedByUnitCount;
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
		var cpudfcTodo = 0;
		var icbucTodo = (unitCount) => 0;

		// 									 name				tax 	corruption		icbuc
		this.Anarchy 		= new Government("Anarchy", 		.6, 	cpudfcTodo, 	icbucTodo);
		this.Communism 		= new Government("Communism",		.8, 	cpudfcTodo, 	icbucTodo);
		this.Democracy 		= new Government("Democracy", 		1, 		cpudfcTodo, 	icbucTodo);
		this.Despotism 		= new Government("Despotism", 		.6, 	cpudfcTodo, 	icbucTodo);
		this.Fundamentalism = new Government("Fundamentalism", 	.8, 	cpudfcTodo, 	icbucTodo);
		this.Monarchy 		= new Government("Monarchy", 		.7, 	cpudfcTodo, 	icbucTodo);
		this.Republic 		= new Government("Republic", 		.8, 	cpudfcTodo, 	icbucTodo);

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