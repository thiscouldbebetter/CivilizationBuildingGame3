
class OwnerSelection
{
	baseSelectedIndex: number;
	unitSelectedIndex: number;
	selectableSelectedCategoryIndex: number;

	constructor()
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;

		this.selectableSelectedCategoryIndex =
			SelectableCategory.Instances().Units.index;
	}

	baseSelectNextIdle(owner: Owner): void
	{
		var bases = owner.bases;

		var areThereAnyBasesIdle =
			bases.some(x => x.isIdle());

		if (areThereAnyBasesIdle == false)
		{
			this.baseSelectedIndex = null;
		}
		else
		{
			if (this.baseSelectedIndex == null)
			{
				this.baseSelectedIndex = -1;
			}

			while (true)
			{
				this.baseSelectedIndex++;
				if (this.baseSelectedIndex >= bases.length)
				{
					this.baseSelectedIndex = 0;
				}

				var baseSelected = this.baseSelected(owner);
				if (baseSelected.isIdle())
				{
					break;
				}
			}
		}
	}

	baseSelected(owner: Owner): Base
	{
		var bases = owner.bases;

		var base =
		(
			this.baseSelectedIndex == null
			? null
			: bases[this.baseSelectedIndex]
		);

		return base;
	}

	selectableSelectNextIdle(owner: Owner): any
	{
		var returnValue = null;

		var categories = SelectableCategory.Instances();

		if (this.selectableSelectedCategoryIndex == categories.Bases.index)
		{
			returnValue = this.baseSelectNextIdle(owner);
		}
		else if (this.selectableSelectedCategoryIndex == categories.Units.index)
		{
			returnValue = this.unitSelectNextIdle(owner);
		}

		return returnValue;
	}

	selectableSelected(owner: Owner): any
	{
		var returnValue = null;

		var categories = SelectableCategory.Instances();

		if (this.selectableSelectedCategoryIndex == categories.Bases.index)
		{
			returnValue = this.baseSelected(owner);
		}
		else if (this.selectableSelectedCategoryIndex == categories.Units.index)
		{
			returnValue = this.unitSelected(owner);
		}

		return returnValue;
	}

	clear(): OwnerSelection
	{
		this.baseSelectedIndex = null;
		this.unitSelectedIndex = null;

		return this;
	}

	unitSelect(owner: Owner, unitToSelect: Unit): void
	{
		this.unitSelectById(owner, unitToSelect.id);
	}

	unitSelectById(owner: Owner, idToSelect: number): void
	{
		var units = owner.units;
		var unitToSelect = units.find(x => x.id == idToSelect);
		if (unitToSelect == null)
		{
			throw new Error("No unit found with ID: " + idToSelect);
		}
		else
		{
			var unitToSelectIndex = units.indexOf(unitToSelect);
			this.unitSelectedIndex = unitToSelectIndex;
		}
	}

	unitSelectNextIdle(owner: Owner): void
	{
		var units = owner.units;

		var areThereAnyUnitsIdle =
			units.some(x => x.isIdle());

		if (areThereAnyUnitsIdle == false)
		{
			this.unitSelectedIndex = null;
		}
		else
		{
			if (this.unitSelectedIndex == null)
			{
				this.unitSelectedIndex = -1;
			}

			while (true)
			{
				this.unitSelectedIndex++;
				if (this.unitSelectedIndex >= units.length)
				{
					this.unitSelectedIndex = 0;
				}

				var unitSelected = this.unitSelected(owner);
				if (unitSelected.hasMovesThisTurn())
				{
					break;
				}
			}
		}
	}

	unitSelected(owner: Owner): Unit
	{
		var units = owner.units;

		var unit =
		(
			this.unitSelectedIndex == null
			? null
			: units[this.unitSelectedIndex]
		);

		return unit;
	}

}
