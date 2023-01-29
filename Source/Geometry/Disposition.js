"use strict";
class Disposition {
    constructor(pos, ori) {
        this.pos = pos;
        this.ori = ori;
    }
    static fromPos(pos) {
        return new Disposition(pos, Orientation.default());
    }
}
