
class UnitActivity
{
	defnName: string;
	variableValuesByName: Map<string, any>;

	constructor
	(
		defnName: string,
		variableValuesByName: Map<string, any>
	)
	{
		this.defnName = defnName;

		this.variableValuesByName = variableValuesByName || new Map();
	}

	defn(): UnitActivityDefn
	{
		return UnitActivityDefn.byName(this.defnName);
	}

	perform
	(
		universe: Universe, world: World, owner: Owner, unit: Unit
	): void
	{
		var defn = this.defn();
		defn.perform(universe, world, owner, unit);
	}

	variableSetByNameAndValue(name: string, value: any): void
	{
		this.variableValuesByName.set(name, value);
	}

	variableValueByName(name: string): any
	{
		return this.variableValuesByName.get(name);
	}

	// Variable convenience accessors.

	direction(): Direction
	{
		var variableNameDirection = UnitActivityVariableNames.Direction();
		return this.variableValueByName(variableNameDirection);
	}

	targetPos(): Coords
	{
		return this.variableValueByName(UnitActivityVariableNames.TargetPos() );
	}
}
