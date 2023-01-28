"use strict";
class Orientation {
    constructor(forward, down) {
        this.forward = forward;
        this.down = down;
        this.right = this.down.clone().crossProduct(this.forward);
    }
    static default() {
        return Orientation.forwardXDownZ();
    }
    static forwardXDownZ() {
        return new Orientation(new Coords(1, 0, 0), // forward
        new Coords(0, 0, 1));
    }
    static forwardZDownY() {
        return new Orientation(new Coords(0, 0, 1), // forward
        new Coords(0, 1, 0) // down
        );
    }
    axesOrthogonalizeAndNormalize() {
        this.right.overwriteWith(this.down).crossProduct(this.forward);
        this.down.overwriteWith(this.forward).crossProduct(this.right);
        this.forward.normalize();
        this.down.normalize();
        this.right.normalize();
        return this;
    }
}
