
class Command
{
	opcode: CommandOpcode;
	operands: string[];

	constructor(opcode: CommandOpcode, operands: string[])
	{
		this.opcode = opcode;
		this.operands = operands;
	}

	static fromKeyboardKey(key: string): Command
	{
		var command = null;

		var opcode = CommandOpcode.fromKeyboardKey(key);

		if (opcode != null)
		{
			command = new Command(opcode, null);
		}

		return command;
	}

	static fromText(commandText: string): Command
	{
		var commandParsed = null;

		var opcode = CommandOpcode.fromCommandText(commandText);

		if (opcode != null)
		{
			var commandTextMinusOpcode =
				commandText.substr(opcode.text.length);
			var operands =
				commandTextMinusOpcode.split(" ").filter( (x: string) => x != "");

			commandParsed = new Command(opcode, operands);
		}

		return commandParsed;
	}

	execute(universe: Universe, world: World): void
	{
		this.opcode.execute(universe, world, this);
	}
}

class CommandOpcode
{
	text: string;
	keyboardKeys: string[];
	_execute: (u: Universe, w: World, c: Command) => void;

	constructor
	(
		text: string,
		keyboardKeys: string[],
		execute: (u: Universe, w: World, c: Command) => void
	)
	{
		this.text = text;
		this.keyboardKeys = keyboardKeys;
		this._execute = execute;
	}

	static _instances: CommandOpcode_Instances;
	static Instances(): CommandOpcode_Instances
	{
		if (CommandOpcode._instances == null)
		{
			CommandOpcode._instances = new CommandOpcode_Instances();
		}
		return CommandOpcode._instances;
	}

	static fromCommandText(commandText: string): CommandOpcode
	{
		var opcode = CommandOpcode.Instances().byCommandText(commandText);
		return opcode;
	}

	static fromKeyboardKey(key: string): CommandOpcode
	{
		var opcode = CommandOpcode.Instances().byKeyboardKey(key);
		return opcode;
	}

	execute(universe: Universe, world: World, command: Command): void
	{
		this._execute(universe, world, command);
	}

}

class CommandOpcode_Instances
{
	CityList: CommandOpcode;
	CitySelect: CommandOpcode;
	CityUseLandAtOffset: CommandOpcode;

	CivList: CommandOpcode;
	CivSelect: CommandOpcode;
	CivShow: CommandOpcode;

	CivOfferAccept: CommandOpcode;
	CivOfferDecline: CommandOpcode;
	CivOfferAlliance: CommandOpcode;
	CivOfferList: CommandOpcode;
	CivOfferPeace: CommandOpcode;
	CivOfferTrade: CommandOpcode;
	CivOfferWar: CommandOpcode;

	Help: CommandOpcode;

	SelectionShow: CommandOpcode;

	TechShow: CommandOpcode;
	TechList: CommandOpcode;
	TechResearch: CommandOpcode;
	TurnEnd: CommandOpcode;

	UnitActionStart: CommandOpcode;
	UnitActionsShow: CommandOpcode;
	UnitList: CommandOpcode;
	UnitMove: CommandOpcode;
	UnitSelect: CommandOpcode;

	UnitMoveE: CommandOpcode;
	UnitMoveN: CommandOpcode;
	UnitMoveNE: CommandOpcode;
	UnitMoveNW: CommandOpcode;
	UnitMoveS: CommandOpcode;
	UnitMoveSE: CommandOpcode;
	UnitMoveSW: CommandOpcode;
	UnitMoveW: CommandOpcode;

	WorldShow: CommandOpcode;

	_All: CommandOpcode[];

	constructor()
	{
		var co =
		(
			text: string,
			keyboardKeys: string[],
			execute: (u: Universe, w: World, c: Command) => void
		) =>
			new CommandOpcode(text, keyboardKeys, execute);

		var keysNone = new Array<string>();
		var executeTodo = (u: Universe, w: World, c: Command) => { alert("todo") };

		this.CityList = co("list cities", keysNone, this.cityList);
		this.CitySelect = co("select city", keysNone, executeTodo);
		this.CityUseLandAtOffset = co("use", keysNone, executeTodo);

		this.CivList = co("list civilizations", keysNone, executeTodo);
		this.CivSelect = co("select civilzation", keysNone, executeTodo);
		this.CivShow = co("show civilization", keysNone, executeTodo);

		this.CivOfferAccept = co("accept offer", keysNone, executeTodo);
		this.CivOfferDecline = co("decline offer", keysNone, executeTodo);
		this.CivOfferAlliance = co("alliance", keysNone, executeTodo);
		this.CivOfferList = co("list offers", keysNone, executeTodo);
		this.CivOfferPeace = co("peace", keysNone, executeTodo);
		this.CivOfferTrade = co("trade", keysNone, executeTodo);
		this.CivOfferWar = co("war", keysNone, executeTodo);

		this.Help = co("help", keysNone, this.help);

		this.SelectionShow = co("show selected", [ "?" ], this.selectionShow);

		// Tech.

		this.TechShow = co("show research", keysNone, this.techShow);
		this.TechList = co("list techs", keysNone, this.techList);
		this.TechResearch = co("research", keysNone, executeTodo);
		this.TurnEnd = co("end turn", [ "Insert", "0" ], this.turnEnd);

		// Units.

		this.UnitActionStart = co("do", keysNone, this.unitActionStart);
		this.UnitActionsShow = co("list actions", [ "`" ], this.unitActionsShow);
		this.UnitList = co("list units", keysNone, this.unitList);
		this.UnitMove = co("move", keysNone, this.unitMove.bind(this) );
		this.UnitSelect = co("select unit", keysNone, this.unitSelect);

		this.UnitMoveE = co("move_e", [ "ArrowRight", "6" ], this.unitMoveE);
		this.UnitMoveN = co("move_n", [ "ArrowUp", "8" ], this.unitMoveN);
		this.UnitMoveNE = co("move_ne", [ "PageUp", "9" ], this.unitMoveNE);
		this.UnitMoveNW = co("move_nw", [ "Home", "7" ], this.unitMoveNW);
		this.UnitMoveS = co("move_s", [ "ArrowDown", "2" ], this.unitMoveS);
		this.UnitMoveSE = co("move_se", [ "PageDown", "3" ], this.unitMoveSE);
		this.UnitMoveSW = co("move_sw", [ "End", "1" ], this.unitMoveSW);
		this.UnitMoveW = co("move_w", [ "ArrowLeft", "4" ], this.unitMoveW);

		this.WorldShow = co("show world", keysNone, this.worldShow);

		this._All =
		[
			this.CityList,
			this.CitySelect,
			this.CityUseLandAtOffset,

			this.CivOfferAccept,
			this.CivOfferDecline,
			this.CivOfferAlliance,
			this.CivOfferList,
			this.CivOfferPeace,
			this.CivOfferTrade,
			this.CivOfferWar,

			this.Help,

			this.SelectionShow,

			this.TechShow,
			this.TechList,
			this.TechResearch,

			this.TurnEnd,

			this.UnitActionStart,
			this.UnitActionsShow,
			this.UnitList,
			this.UnitMove,
			this.UnitSelect,

			this.UnitMoveE,
			this.UnitMoveN,
			this.UnitMoveNE,
			this.UnitMoveNW,
			this.UnitMoveS,
			this.UnitMoveSE,
			this.UnitMoveSW,
			this.UnitMoveW,

			this.WorldShow,
		];
	}

	byCommandText(commandText: string): CommandOpcode
	{
		var opcodeFound =
			this._All.find((x: CommandOpcode) => commandText.startsWith(x.text));
		return opcodeFound;
	}

	byKeyboardKey(key: string): CommandOpcode
	{
		var opcodeFound =
			this._All.find((x: CommandOpcode) => x.keyboardKeys.indexOf(key) >= 0);
		return opcodeFound;
	}

	// Commands.

	cityList(u: Universe, w: World, c: Command): void
	{56
		var owner = w.ownerCurrent();
		var bases = owner.bases;

		var outputLog = u.outputLog;
		outputLog.clear();
		bases.forEach( (x : any) => outputLog.writeLine( x.toStringForList() ) );
	}

	help(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		outputLog.writeLine("Commands Available:");
		CommandOpcode.Instances()._All.forEach
		(
			x => u.outputLog.writeLine(x.text)
		);
	}

	selectionShow(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();

		var owner = w.ownerCurrent();
		outputLog.writeLine("Owner: " + owner.name);

		var selectableSelected = owner.selectableSelected();
		if (selectableSelected == null)
		{
			outputLog.writeLine("Nothing selected!");
		}
		else
		{
			var category = selectableSelected.category(w);
			outputLog.writeLine("Category: " + category.name); 
			var selectableDetails = selectableSelected.toStringDetails(w);
			outputLog.writeLine(selectableDetails);
		}
	}

	techList(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		outputLog.writeLine("Technologies Available for Research:");
		var technologiesAvailable = new Array<any>(); // todo
		technologiesAvailable.forEach
		(
			(x: any) => u.outputLog.writeLine(x.text)
		);
	}

	techShow(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		var owner = w.ownerCurrent();
		outputLog.writeLine(owner.name + " Research:");
		var ownerResearch = owner.research;
		var ownerResearchAsString = ownerResearch.toString();
		outputLog.writeLine(ownerResearchAsString);
	}

	turnEnd(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();
		var owner = w.ownerCurrent();
		if (owner.areAnyBasesOrUnitsIdle(w) )
		{
			outputLog.writeLine
			(
				"Cannot end turn while any units or cities are idle!"
			);
		}
		else
		{
			w.ownerCurrentAdvance(u);
		}
	}

	unitActionStart(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();

		var owner = w.ownerCurrent();
		var unit = owner.unitSelected();

		if (unit == null)
		{
			outputLog.writeLine("No unit selected!");
		}
		else
		{
			var unitDefn = unit.defn(w);
			var actionsAvailable = unitDefn.actionsAvailable();

			var actionIndex = parseInt(c.operands[0]) - 1;

			if
			(
				isNaN(actionIndex)
				|| actionIndex < 0
				|| actionIndex >= actionsAvailable.length
			)
			{
				outputLog.writeLine
				(
					"Invalid action number: "
					+ (actionIndex + 1) + "."
				); 
			}
			else
			{
				var actionToPerform = actionsAvailable[actionIndex]; // todo

				outputLog.writeLine
				(
					"Unit " + unit.id + " doing: "
					+ actionToPerform.name + "."
				);
				unit.activityDefnStart
				(
					actionToPerform
				);

				w.draw(u);
			}
		}
	}

	unitActionsShow(u: Universe, w: World, c: Command): void
	{
		var outputLog = u.outputLog;
		outputLog.clear();

		var owner = w.ownerCurrent();
		var unit = owner.unitSelected();
		if (unit == null)
		{
			outputLog.writeLine("No unit selected!");
		}
		else
		{
			var unitDefn = unit.defn(w);

			outputLog.writeLine("Actions available:");
			var actionsAvailableNames = unitDefn.actionsAvailableNames;
			actionsAvailableNames.forEach
			(
				(x: string, i: number) => outputLog.writeLine( (i + 1) + ": " + x)
			);
		}
	}

	unitList(u: Universe, w: World, c: Command): void
	{
		var owner = w.ownerCurrent();
		var units = owner.units;

		var outputLog = u.outputLog;
		outputLog.clear();
		units.forEach( (x: any) => outputLog.writeLine( x.toStringForList() ) );
	}

	unitMove(u: Universe, w: World, c: Command): void
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

	unitMove_Move(u: Universe, w: World, c: Command): void
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
						"Unit " + unitSelected.id
						+ " out of moves this turn.";
					outputLog.writeLine(message);

					ownerCurrent.unitSelectNextIdle();
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
						message =
							"Selected next unit with moves: "
							+ unitSelected.id + "."
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

	unitMoveE(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "e" ];
		c.execute(u, w);
	}

	unitMoveN(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "n" ];
		c.execute(u, w);
	}

	unitMoveNE(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "ne" ];
		c.execute(u, w);
	}

	unitMoveNW(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "nw" ];
		c.execute(u, w);
	}

	unitMoveS(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "s" ];
		c.execute(u, w);
	}

	unitMoveSE(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "se" ];
		c.execute(u, w);
	}

	unitMoveSW(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "sw" ];
		c.execute(u, w);
	}

	unitMoveW(u: Universe, w: World, c: Command): void
	{
		c.opcode = CommandOpcode.Instances().UnitMove;
		c.operands = [ "w" ];
		c.execute(u, w);
	}

	unitSelect(u: Universe, w: World, c: Command): void
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
				owner.unitSelectNextIdle();
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

	worldShow(u: Universe, w: World, c: Command): void
	{
		w.draw(u);
		var outputLog = u.outputLog;
		outputLog.clear();
		var worldDetails = "Turn: " + w.turnsSoFar;
		outputLog.writeLine(worldDetails);
	}
}
