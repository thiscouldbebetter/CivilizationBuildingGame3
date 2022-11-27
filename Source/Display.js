
class DisplayCanvas
{
	constructor(domElementParentId, sizeInPixels)
	{
		this.domElementParentId = domElementParentId;
		this.sizeInPixels = sizeInPixels;

		this.fontHeightInPixels = 10;
		this.fontHeightInPixelsHalf = this.fontHeightInPixels / 2;
		this.font = this.fontHeightInPixels + "px sans-serif";

		this._zeroes = Coords.zeroes();

		this.colorForegroundName = "Blue";
		this.colorBackgroundName = "Black";
	}

	clear()
	{
		this.graphics.clearRect(this.sizeInPixels);
	}

	initialize(universe)
	{
		var d = document;
		var canvas = d.createElement("canvas");
		canvas.width = this.sizeInPixels.x;
		canvas.height = this.sizeInPixels.y;

		var domElementParent = d.getElementById(this.domElementParentId);
		domElementParent.appendChild(canvas);

		this.graphics = canvas.getContext("2d");

		var divParent
	}

	// Draw.

	drawBackground(colorName)
	{
		this.drawRectangle
		(
			this._zeroes, this.sizeInPixels, colorName, null
		);
	}

	drawCircle(center, radius, colorFillName, colorBorderName)
	{
		this.graphics.beginPath();
		this.graphics.arc(center.x, center.y, radius, 0, Math.PI * 2);

		if (colorFillName != null)
		{
			this.graphics.fillStyle = colorFillName;
			this.graphics.fill();
		}

		if (colorBorderName != null)
		{
			this.graphics.strokeStyle = colorBorderName;
			this.graphics.stroke();
		}
	}

	drawRectangle(pos, size, colorFillName, colorBorderName)
	{
		if (colorFillName != null)
		{
			this.graphics.fillStyle = colorFillName;
			this.graphics.fillRect(pos.x, pos.y, size.x, size.y);
		}

		if (colorBorderName != null)
		{
			this.graphics.strokeStyle = colorBorderName;
			this.graphics.strokeRect(pos.x, pos.y, size.x, size.y);
		}
	}

	drawText(textToDraw, pos, colorName)
	{
		var textWidth = this.graphics.measureText(textToDraw).width;
		this.graphics.fillStyle = colorName;
		this.graphics.fillText
		(
			textToDraw,
			pos.x - textWidth / 2,
			pos.y + this.fontHeightInPixelsHalf
		);
	}

}

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
