
class DisplayText
{
	constructor(domElementId)
	{
		this.domElementId = domElementId;
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
		this.writeString("<br />");
	}

	writeString(stringToWrite, colorName)
	{
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
