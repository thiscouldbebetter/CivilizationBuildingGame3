
class StringHelper
{
	static copyStringsIntoStringsAtPos
	(
		stringsToCopyFrom: string[], stringsToCopyInto: string[], pos: Coords
	): void
	{
		var sourcePos = Coords.create();
		var targetPos = Coords.create();

		for (var y = 0; y < stringsToCopyFrom.length; y++)
		{
			sourcePos.y = y;

			var stringToCopyFrom = stringsToCopyFrom[y];

			for (var x = 0; x < stringToCopyFrom.length; x++)
			{
				sourcePos.x = x;

				var sourceChar = stringToCopyFrom[x];

				targetPos.overwriteWith(sourcePos).add(pos);

				StringHelper.setCharAtPosInStrings
				(
					sourceChar, targetPos, stringsToCopyInto
				);
			}
		}
	}

	static setCharAtPosInStrings(charToSet: string, pos: Coords, strings: string[]): void
	{
		var row = strings[pos.y];
		if (row == null)
		{
			row = "";
			strings[pos.y] = row;
		}
		if (pos.x >= row.length)
		{
			row = row.padEnd(pos.x, " ");
		}
		row = row.substr(0, pos.x) + charToSet + row.substr(pos.x + 1);
		strings[pos.y] = row;
	}
}
