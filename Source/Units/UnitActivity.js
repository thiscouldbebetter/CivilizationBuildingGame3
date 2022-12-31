
class UnitActivity
{
	constructor(defnName, variableValuesByName)
	{
		this.defnName = defnName;

		this.variableValuesByName = variableValuesByName || new Map();
	}

	defn()
	{
		return UnitActivityDefn.byName(this.defnName);
	}

	perform(universe, world, owner, unit)
	{
		var defn = this.defn();
		defn.perform(universe, world, owner, unit);
	}

	variableSetByNameAndValue(name, value)
	{
		this.variableValuesByName.set(name, value);
	}

	variableValueByName(name)
	{
		return this.variableValuesByName.get(name);
	}

	// Variable convenience accessors.

	targetPos()
	{
		return this.variableValueByName(UnitActivityVariableNames.TargetPos() );
	}
}
