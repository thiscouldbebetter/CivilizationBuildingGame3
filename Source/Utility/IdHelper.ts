
class IdHelper
{
	static _idNext: number = 0;

	static idNext()
	{
		var id = this._idNext;
		this._idNext++;
		return id;
	}
}
