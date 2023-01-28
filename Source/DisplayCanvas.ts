
class DisplayCanvas
{
	domElementParentId: string;
	sizeInPixels: Coords;

	colorForegroundName: string;
	colorBackgroundName: string;
	fontHeightInPixels: number;
	fontHeightInPixelsHalf: number;
	font: any;
	graphics: any;
	_zeroes: Coords;


	constructor
	(
		domElementParentId: string,
		sizeInPixels: Coords
	)
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

	clear(): void
	{
		this.graphics.clearRect(this.sizeInPixels);
	}

	initialize(universe: any) : void
	{
		var d = document;
		var canvas = d.createElement("canvas");
		canvas.width = this.sizeInPixels.x;
		canvas.height = this.sizeInPixels.y;

		var domElementParent = d.getElementById(this.domElementParentId);
		domElementParent.appendChild(canvas);

		this.graphics = canvas.getContext("2d");
	}

	// Draw.

	drawBackground(colorName: string): void
	{
		this.drawRectangle
		(
			this._zeroes, this.sizeInPixels, colorName, null
		);
	}

	drawCircle
	(
		center: Coords,
		radius: number,
		colorFillName: string,
		colorBorderName: string
	): void
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

	drawRectangle(pos: Coords, size: Coords, colorFillName: string, colorBorderName: string): void
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

	drawText(textToDraw: string, pos: Coords, colorName: string): void
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
