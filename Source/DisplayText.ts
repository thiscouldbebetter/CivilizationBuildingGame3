
class DisplayText
{
	domElementId: string;
	newline: string;

	constructor(domElementId: string)
	{
		this.domElementId = domElementId;
		this.newline = "<br />";
	}

	clear(): void
	{
		var d = document;
		var textareaDisplay = d.getElementById(this.domElementId);
		textareaDisplay.innerHTML = "";
	}

	clearAndWriteLine(lineToWrite: string): void
	{
		this.clear();
		this.writeLine(lineToWrite);
	}

	writeLine(lineToWrite: string): void
	{
		this.writeString(lineToWrite, null);
		this.writeNewline();
	}

	writeNewline(): void
	{
		this.writeString(this.newline, null);
	}

	writeString(stringToWrite: string, colorName: string): void
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
