
class OwnerDiplomacyPosture
{
	name: string;

	constructor(name: string)
	{
		this.name = name;
	}

	static _instances: OwnerDiplomacyPosture_Instances;
	static Instances(): OwnerDiplomacyPosture_Instances
	{
		if (OwnerDiplomacyPosture._instances == null)
		{
			OwnerDiplomacyPosture._instances =
				new OwnerDiplomacyPosture_Instances();
		}
		return OwnerDiplomacyPosture._instances;
	}

	static byName(name: string): OwnerDiplomacyPosture
	{
		return OwnerDiplomacyPosture.Instances().byName(name);
	}

	isAttackable(): boolean
	{
		return this.isUnknown() || this.isUncontacted() || this.isWar();
	}

	// Convenience methods.

	isAlliance(): boolean
	{
		return (this == OwnerDiplomacyPosture.Instances().Alliance);
	}

	isPeace(): boolean
	{
		return (this == OwnerDiplomacyPosture.Instances().Peace);
	}

	isUncontacted(): boolean
	{
		return (this == OwnerDiplomacyPosture.Instances().Uncontacted);
	}

	isUnknown(): boolean
	{
		return (this == OwnerDiplomacyPosture.Instances().Unknown);
	}

	isWar(): boolean
	{
		return (this == OwnerDiplomacyPosture.Instances().War);
	}
}

class OwnerDiplomacyPosture_Instances
{
	Alliance: OwnerDiplomacyPosture;
	Peace: OwnerDiplomacyPosture;
	Uncontacted: OwnerDiplomacyPosture;
	Unknown: OwnerDiplomacyPosture;
	War: OwnerDiplomacyPosture;

	_All: OwnerDiplomacyPosture[];
	_AllByName: Map<string, OwnerDiplomacyPosture>;

	constructor()
	{
		this.Alliance = new OwnerDiplomacyPosture("Alliance");
		this.Peace = new OwnerDiplomacyPosture("Peace");
		this.Uncontacted = new OwnerDiplomacyPosture("Uncontacted");
		this.Unknown = new OwnerDiplomacyPosture("Unknown");
		this.War = new OwnerDiplomacyPosture("War");

		this._All =
		[
			this.Alliance,
			this.Peace,
			this.Uncontacted,
			this.Unknown,
			this.War
		];
		this._AllByName = new Map(this._All.map(x => [x.name, x] ) );
	}

	byName(name: string): OwnerDiplomacyPosture
	{
		return this._AllByName.get(name);
	}
}

