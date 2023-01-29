
class OwnerIntelligence
{
	name: string;
	_commandChoose: () => Command;

	constructor(name: string, commandChoose: any)
	{
		this.name = name;
		this._commandChoose = commandChoose;
	}

	static human(): OwnerIntelligence
	{
		return new OwnerIntelligence("Human", () => {});
	}

	static machine(): OwnerIntelligence
	{
		return new OwnerIntelligence("Machine", () => {});
	}

	commandChoose(): Command
	{
		return this._commandChoose();
	}
}
