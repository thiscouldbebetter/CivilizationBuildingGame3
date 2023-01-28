
class IdHelper
{
	static _idNext = 0;

	static idNext()
	{
		var id = this._idNext;
		this._idNext++;
		return id;
	}
}
