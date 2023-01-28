
class Universe
{
	display: DisplayCanvas;
	inputHelper: InputHelper;
	outputLog: DisplayText;
	world: any;

	constructor
	(
		display: DisplayCanvas,
		inputHelper: InputHelper,
		outputLog: DisplayText,
		world: any
	)
	{
		this.display = display;
		this.inputHelper = inputHelper;
		this.outputLog = outputLog;
		this.world = world;
	}

	initialize(): void
	{
		this.inputHelper.initialize(this);
		this.display.initialize(this);
		this.world.initialize(this);
	}
}
