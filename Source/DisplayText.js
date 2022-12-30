
class DisplayText
{
	constructor(domElementId)
	{
		this.domElementId = domElementId;
		this.newline = "<br />";
	}

	clear()
	{
		var d = document;
		var textareaDisplay = d.getElementById(this.domElementId);
		textareaDisplay.innerHTML = "";
	}

	clearAndWriteLine(lineToWrite)
	{
		this.clear();
		this.writeLine(lineToWrite);
	}

	writeLine(lineToWrite)
	{
		this.writeString(lineToWrite);
		this.writeNewline();
	}

	writeNewline()
	{
		this.writeString(this.newline);
	}

	writeString(stringToWrite, colorName)
	{
		stringToWrite = stringToWrite.split("\n").join(this.newline);
		var d = document;
		var textareaDisplay = d.getElementById(this.domElementId);
		if (colorName != null)
		{
			stringToWrite =
				"<mark style='background-color:" + colorName + "'>"
				+ stringToWrite
				+ "</mark>";
		}
		textareaDisplay.innerHTML += stringToWrite;
	}
}
