
class Universe
{
	constructor(display, inputHelper, outputLog, world)
	{
		this.display = display;
		this.inputHelper = inputHelper;
		this.outputLog = outputLog;
		this.world = world;
	}

	initialize()
	{
		this.inputHelper.initialize(this);
		this.display.initialize(this);
		this.world.initialize(this);
	}
}
