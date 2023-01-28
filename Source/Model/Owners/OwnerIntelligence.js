
class OwnerIntelligence
{
	constructor(name, commandChoose)
	{
		this.name = name;
		this._commandChoose = commandChoose;
	}

	static human()
	{
		return new OwnerIntelligence("Human", () => {});
	}

	static machine()
	{
		return new OwnerIntelligence("Machine", () => {});
	}

	commandChoose()
	{
		this._commandChoose();
	}
}