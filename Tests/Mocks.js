
class DisplayMock
{
	clear() {}

	initialize(universe) {}

	// Draw.

	drawBackground(colorName) {}

	drawCircle(center, radius, colorFillName, colorBorderName) {}

	drawRectangle(pos, size, colorFillName, colorBorderName) {}

	drawText(textToDraw, pos, colorName) {}
}

class InputHelperMock
{
	initialize(universe) {}
}

class OutputLogMock
{
	clear() {}

	clearAndWriteLine(lineToWrite) {}

	writeLine(lineToWrite) {}

	writeNewline() {}

	writeString(stringToWrite, colorName) {}
}
