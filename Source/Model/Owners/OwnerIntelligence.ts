
class OwnerIntelligence
{
	name: string;
	_commandChoose: () => Command;

	constructor(name: string, commandChoose: () => Command)
	{
		this.name = name;
		this._commandChoose = commandChoose;
	}

	static human(): OwnerIntelligence
	{
		return new OwnerIntelligence("Human", () => null);
	}

	static machine(): OwnerIntelligence
	{
		return new OwnerIntelligence("Machine", () => null);
	}

	commandChoose(): Command
	{
		return this._commandChoose();
	}
}
