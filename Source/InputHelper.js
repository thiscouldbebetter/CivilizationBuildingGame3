
class InputHelper
{
	initialize(universe)
	{
		var d = document;

		var body = d.body;
		body.onkeydown = this.keyDown.bind(this, universe);

		var inputCommand = d.getElementById("inputCommand");
		inputCommand.focus();

		return this;
	}

	keyDown(universe, event)
	{
		var world = universe.world;

		event.preventDefault();

		var key = event.key;

		var d = document;
		var inputCommand = d.getElementById("inputCommand");

		if (key == "Enter")
		{
			var commandText = inputCommand.value;

			inputCommand.value = "";
			inputCommand.focus();

			var command = Command.fromText(commandText);
			if (command == null)
			{
				universe.outputLog.clearAndWriteLine
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
