"use strict";
class IdHelper {
    static idNext() {
        var id = this._idNext;
        this._idNext++;
        return id;
    }
}
IdHelper._idNext = 0;
