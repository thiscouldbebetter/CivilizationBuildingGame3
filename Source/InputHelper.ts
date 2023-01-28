
class InputHelper
{
	initialize(universe: any): InputHelper
	{
		var d = document;

		var body = d.body;
		body.onkeydown = this.keyDown.bind(this, universe);

		var inputCommand = d.getElementById("inputCommand");
		inputCommand.focus();

		return this;
	}

	keyDown(universe: any, event: any): void
	{
		var outputLog = universe.outputLog;
		var world = universe.world;

		event.preventDefault();

		var key = event.key;

		var d = document;
		var inputCommand: any = d.getElementById("inputCommand");

		if (key == "Enter")
		{
			var commandText : any = inputCommand.value;

			inputCommand.value = "";
			inputCommand.focus();

			var command = Command.fromText(commandText);
			if (command == null)
			{
				outputLog.clearAndWriteLine
				(
					"Unrecognized command: " + commandText
				);
			}
			else
			{
				command.execute(universe, world);
				world.draw(universe);
			}
		}
		else if (key == "Backspace")
		{
			inputCommand.value = inputCommand.value.substr
			(
				0, inputCommand.value.length - 1
			);
		}
		else if
		(
			key.startsWith("F")
			&& key.length > 1
			&& key.length < 4
		)
		{
			var functionKeyNumberAsString = key.substring(1);
			var functionKeyNumber: number = parseInt(functionKeyNumberAsString);
			if
			(
				functionKeyNumber < 1
				|| functionKeyNumber > 12
			)
			{
				outputLog.writeLine
				(
					"Unrecognized function key number: " + functionKeyNumber + "."
				);
			}
			else
			{
				var actionToPerformNumber: string = "" + functionKeyNumber;
				var command = new Command
				(
					CommandOpcode.Instances().UnitActionStart,
					[
						actionToPerformNumber
					]
				);
				command.execute(universe, world);
				world.draw(universe);
			}
		}
		else
		{
			var keyAsInt = parseInt(key);
			if (isNaN(keyAsInt) == false)
			{
				if (inputCommand.value.length == 0)
				{
					var command = Command.fromKeyboardKey(key);
					if (command != null)
					{
						command.execute(universe, world);
						world.draw(universe);
					}
				}
				else
				{
					inputCommand.value += key;
				}
			}
			else
			{
				var command = Command.fromKeyboardKey(key);
				if (command == null)
				{
					if (key.length == 1)
					{
						inputCommand.value += key;
					}
				}
				else
				{
					command.execute(universe, world);
					world.draw(universe);
				}
			}
		}
	}
}
