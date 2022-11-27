
class Command
{
	constructor(opcode, operands)
	{
		this.opcode = opcode;
		this.operands = operands;
	}

	static fromKeyboardKey(key)
	{
		var command = null;

		var opcode = CommandOpcode.fromKeyboardKey(key);

		if (opcode != null)
		{
			command = new Command(opcode, null);
		}

		return command;
	}

	static fromText(commandText)
	{
		var commandParsed = null;

		var opcode = CommandOpcode.fromCommandText(commandText);

		if (opcode != null)
		{
			var commandTextMinusOpcode = commandText.substr(opcode.text.length);
			var operands = commandTextMinusOpcode.split(" ").filter(x => x != "");

			commandParsed = new Command(opcode, operands);
		}

		return commandParsed;
	}

	execute(universe, world)
	{
		this.opcode.execute(universe, world, this);
	}
}

class CommandOpcode
{
	constructor(text, keyboardKey, execute)
	{
		this.text = text;
		this.keyboardKey = keyboardKey;
		this.execute = execute;
	}

	static Instances()
	{
		if (CommandOpcode._instances == null)
		{
			CommandOpcode._instances = new CommandOpcode_Instances();
		}
		return CommandOpcode._instances;
	}

	static fromCommandText(commandText)
	{
		var opcode = CommandOpcode.Instances().byCommandText(commandText);
		return opcode;
	}

	static fromKeyboardKey(key)
	{
		var opcode = CommandOpcode.Instances().byKeyboardKey(key);
		return opcode;
	}
}

class CommandOpcode_Instances
{
	constructor()
	{
		var co = (text, keyboardKey, execute) =>
			new CommandOpcode(text, keyboardKey, execute);

		var keyNone = null;
		var executeTodo = (u, w, c) => { alert("todo") };

		this.CityBuild = co("build", keyNone, executeTodo);
		this.CityList = co("list cities", keyNone, this.cityList);
		this.CitySelect = co("select city", keyNone, executeTodo);
		this.CityShow = co("show city", keyNone, executeTodo);
		this.CityUseLandAtOffset = co("use offset", keyNone, executeTodo);

		this.CivList = co("list civilizations", keyNone, executeTodo);
		this.CivSelect = co("select civilzation", keyNone, executeTodo);
		this.CivShow = co("show civilization", keyNone, executeTodo);

		this.CivOfferAccept = co("accept offer", keyNone, executeTodo);
		this.CivOfferDecline = co("decline offer", keyNone, executeTodo);
		this.CivOfferAlliance = co("alliance", keyNone, executeTodo);
		this.CivOfferList = co("list offers", keyNone, executeTodo);
		this.CivOfferPeace = co("peace", keyNone, executeTodo);
		this.CivOfferTrade = co("trade", keyNone, executeTodo);
		this.CivOfferWar = co("war", keyNone, executeTodo);

		this.Help = co("help", keyNone, this.help);

		// Tech.

		this.TechShow = co("show research", keyNone, this.techShow);
		this.TechList = co("list techs", keyNone, this.techList);
		this.TechResearch = co("research", keyNone, executeTodo);
		this.TurnEnd = co("end turn", "Insert", this.turnEnd);

		// Units.

		this.UnitActionsShow = co("list actions", "?", this.unitActionsShow);
		this.UnitDisband = co("disband", keyNone, executeTodo);
		this.UnitFortify = co("fortify", keyNone, executeTodo);
		this.UnitList = co("list units", keyNone, this.unitList);
		this.UnitMove = co("move", keyNone, this.unitMove.bind(this) );
		this.UnitPass = co("pass", keyNone, executeTodo);
		this.UnitSelect = co("select unit", keyNone, this.unitSelect);
		this.UnitShow = co("show unit", keyNone, this.unitShow);
		this.UnitSleep = co("sleep", keyNone, executeTodo);
		this.UnitSupport = co("support", keyNone, executeTodo);

		this.UnitMoveE = co("move_e", "ArrowRight", this.unitMoveE);
		this.UnitMoveN = co("move_n", "ArrowUp", this.unitMoveN);
		this.UnitMoveNE = co("move_ne", "PageUp", this.unitMoveNE);
		this.UnitMoveNW = co("move_nw", "Home", this.unitMoveNW);
		this.UnitMoveS = co("move_s", "ArrowDown", this.unitMoveS);
		this.UnitMoveSE = co("move_se", "PageDown", this.unitMoveSE);
		this.UnitMoveSW = co("move_sw", "End", this.unitMoveSW);
		this.UnitMoveW = co("move_w", "ArrowLeft", this.unitMoveW);

		this.UnitSettlerIrrigate = co("irrigate", keyNone, executeTodo);
		this.UnitSettlerMine = co("mine", keyNone, executeTodo);
		this.UnitSettlerRoad = co("road", keyNone, executeTodo); 
		this.UnitSettlerSettle = co("settle", keyNone, executeTodo);

		this.WorldShow = co("show world", keyNone, this.worldShow);

		this._All =
		[
			this.CityBuild,
			this.CityList,
			this.CitySelect,
			this.CityShow,
			this.CityUseLandAtOffset,

			this.CivOfferAccept,
			this.CivOfferDecline,
			this.CivOfferAlliance,
			this.CivOfferList,
			this.CivOfferPeace,
			this.CivOfferTrade,
			this.CivOfferWar,

			this.Help,

			this.TechShow,
			this.TechList,
			this.TechResearch,

			this.TurnEnd,

			this.UnitActionsShow,
			this.UnitList,
			this.UnitMove,
			this.UnitPass,
			this.UnitSelect,
			this.UnitShow,

			this.UnitMoveE,
			this.UnitMoveN,
			this.UnitMoveNE,
			this.UnitMoveNW,
			this.UnitMoveS,
			this.UnitMoveSE,
			this.UnitMoveSW,
			this.UnitMoveW,

			this.UnitSettlerIrrigate,
			this.UnitSettlerMine,
			this.UnitSettlerRoad,
			this.UnitSettlerSettle,

			this.WorldShow,
		];
	}

	byCommandText(commandText)
	{
		var opcodeFound =
			this._All.find(x => commandText.startsWith(x.text));
		return opcodeFound;
	}

	byKeyboardKey(key)
	{
		var opcodeFound =
			this._All.find(x => x.keyboardKey == key);
		return opcodeFound;
	}

	// Commands.

	cityList(u, w, c)
	{
		var owner = w.ownerCurrent();
		var bases = owner.bases;

		var outputLog = u.outputLog;
		outputLog.clear();
		bases.forEach(x => outputLog.writeLine( x.toStringForList() ) );
	}

	help(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		outputLog.writeLine("Commands Available:");
		CommandOpcode.Instances()._All.forEach
		(
			x => u.outputLog.writeLine(x.text)
		);
	}

	techList(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		outputLog.writeLine("Technologies Available for Research:");
		var technologiesAvailable = [];
		technologiesAvailable.forEach
		(
			x => u.outputLog.writeLine(x.text)
		);
	}

	techShow(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		var owner = w.ownerCurrent();
		outputLog.writeLine(owner.name + " Research:");
		var ownerResearch = owner.research;
		var ownerResearchAsString = ownerResearch.toString();
		outputLog.writeLine(ownerResearchAsString);
	}

	turnEnd(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		w.turnAdvance(u);
		outputLog.writeLine("Next turn:" + w.turnsSoFar);
	}

	unitActionsShow(u, w, c)
	{
		var owner = w.ownerCurrent();
		var unit = owner.unitSelected();
		var unitDefn = unit.defn(w);

		var outputLog = u.outputLog;
		outputLog.clear();
		outputLog.writeLine("Actions available:");
		var actionsAvailableNames = unitDefn.actionsAvailableNames;
		actionsAvailableNames.forEach
		(
			(x, i) => outputLog.writeLine(i + ": " + x)
		);
	}

	unitList(u, w, c)
	{
		var owner = w.ownerCurrent();
		var units = owner.units;

		var outputLog = u.outputLog;
		outputLog.clear();
		units.forEach(x => outputLog.writeLine( x.toStringForList() ) );
	}

	unitMove(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();

		var ownerCurrent = w.ownerCurrent();
		var unitSelected = ownerCurrent.unitSelected();
		if (unitSelected == null)
		{
			outputLog.writeLine("No unit selected!");
		}
		else if (unitSelected.hasMovesThisTurn() == false)
		{
			outputLog.writeLine
			(
				"Unit " + unitSelected.id + " has no moves left!"
			);
		}
		else
		{
			this.unitMove_Move(u, w, c);
		}
	}

	unitMove_Move(u, w, c)
	{
		var outputLog = u.outputLog;
		var ownerCurrent = w.ownerCurrent();
		var unitSelected = ownerCurrent.unitSelected();

		var directionToMoveCode = c.operands[0];
		var directionToMove = Direction.byCode(directionToMoveCode);
		var message = null;
		if (directionToMove == null)
		{
			message = "Invalid direction: " + directionToMoveCode;
		}
		else
		{
			var canMove =
				unitSelected.canMoveInDirection(directionToMove, w);

			if (canMove)
			{
				unitSelected.moveInDirection(directionToMove, w);
				message =
					"Unit " + unitSelected.id + " moved "
					+ directionToMove.name.toLowerCase() + ".";
				outputLog.writeLine(message);

				if (unitSelected.hasMovesThisTurn() == false)
				{
					message =
						"Unit " + unitSelected.id + " out of moves this turn.";
					outputLog.writeLine(message);

					ownerCurrent.unitSelectNextWithMoves();
					unitSelected = ownerCurrent.unitSelected();

					if (unitSelected == null)
					{
						message =
							"No more units with moves this turn."
							+ "  Enter 'end turn' to end the turn.";
						outputLog.writeLine(message);
					}
					else
					{
						message = "Selected next unit with moves: " + unitSelected.id + "."
						outputLog.writeLine(message);
					}
				}
			}
			else
			{
				message =
					"Unit " + unitSelected.id + " cannot move "
					+ directionToMove.name.toLowerCase() + ".";
				outputLog.writeLine(message);
			}
		}
	}

	unitMoveE(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "e" ];
		c.execute(u, w);
	}

	unitMoveN(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "n" ];
		c.execute(u, w);
	}

	unitMoveNE(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "ne" ];
		c.execute(u, w);
	}

	unitMoveNW(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "nw" ];
		c.execute(u, w);
	}

	unitMoveS(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "s" ];
		c.execute(u, w);
	}

	unitMoveSE(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "se" ];
		c.execute(u, w);
	}

	unitMoveSW(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "sw" ];
		c.execute(u, w);
	}

	unitMoveW(u, w, c)
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "w" ];
		c.execute(u, w);
	}

	unitSelect(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();

		var owner = w.ownerCurrent();
		var operand0 = c.operands[0];
		try
		{
			var idToSelect = null;

			if (operand0 == "next")
			{
				owner.unitSelectNextWithMoves();
				var unitSelected = owner.unitSelected();
				if (unitSelected != null)
				{
					idToSelect = unitSelected.id;
				}
			}
			else
			{
				idToSelect = parseInt(operand0);
				owner.unitSelectById(idToSelect);
			}
			outputLog.writeLine("Selected unit " + idToSelect + ".");
		}
		catch (err)
		{
			outputLog.writeLine(err.message);
		}
	}

	unitShow(u, w, c)
	{
		var outputLog = u.outputLog;
		outputLog.clear();

		var unitSelected = w.ownerCurrent().unitSelected();
		if (unitSelected == null)
		{
			outputLog.writeLine("No unit selected!");
		}
		else
		{
			var unitDetails = unitSelected.toStringDetails(w);
			outputLog.writeLine(unitDetails);
		}
	}

	worldShow(u, w, c)
	{
		w.draw(u, w);
		var outputLog = u.outputLog;
		outputLog.clear();
		var worldDetails = "Turn: " + w.turnsSoFar;
		outputLog.writeLine(worldDetails);
	}
}
