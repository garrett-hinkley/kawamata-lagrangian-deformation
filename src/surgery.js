import { gcd, mod, invmod, arraysEqual } from "./utils.js";

export class Surgery {
    constructor(r0, a0, isTurningPoint = null) {
        this.r0 = r0;
        this.a0 = a0;
        const g = gcd(r0, a0);
        this.r = r0 / g;
        this.a = (a0 / g) % this.r;
        this.b = invmod(this.a, this.r);
        if (isTurningPoint !== null && isTurningPoint.length === this.r && isTurningPoint[0]) {
            this.isTurningPoint = isTurningPoint;
        }
        else {
            this.isTurningPoint = Array(this.r).fill(false).with(0, true);
        }
    }

    equals(other) {
        return this.r0 === other.r0 && this.a0 === other.a0 && arraysEqual(this.isTurningPoint, other.isTurningPoint);
    }

    toggleTurningPoint(index) {
        if (index === 0) return this;
        else return new Surgery(this.r, this.a, this.isTurningPoint.with(index, !this.isTurningPoint[index]))
    }
}

export class Point {
    constructor(surgery, index) {
        this.surgery = surgery;
        this.index = mod(index, surgery.r);
    }

    equals(other) {
        return this.surgery.equals(other.surgery) && this.index === other.index;
    }

    isTurningPoint() {
        return this.surgery.isTurningPoint[this.index];
    }

    move(delta) {
        return new Point(this.surgery, this.index + delta);
    }

    moveUp() {
        return this.move(1);
    }

    moveDown() {
        return this.move(-1);
    }

    moveLeft() {
        return this.move(this.surgery.b);
    }

    moveRight() {
        return this.move(-this.surgery.b);
    }

    turningPointAbove() {
        let cur = this.moveUp();
        while (!cur.isTurningPoint()) {
            cur = cur.moveUp();
        }
        return cur;
    }

    turningPointRight() {
        let cur = this.moveRight();
        while (!cur.isTurningPoint()) {
            cur = cur.moveRight();
        }
        return cur;
    }
}

export function allPoints(surgery) {
    const points = [];
    for (let i = 0; i < surgery.r; i++) {
        points.push(new Point(surgery, i));
    }
    return points;
}

// change segments to start at point and end right before next point?
// [n, n+1)
export class Segment {
    // segments start .5 before the point and end .5 after it
    // vertical segments start .5 above, horizontal ones start .5 to the left
    constructor(point, isVertical) {
        this.point = point;
        this.isVertical = isVertical;
    }

    equals(other) {
        return this.point.equals(other.point) && this.isVertical === other.isVertical;
    }

    nextSegment() {
        const newIsVertical = (this.isVertical !== this.point.isTurningPoint());
        const newPoint = newIsVertical ? this.point.moveDown() : this.point.moveRight();
        return new Segment(newPoint, newIsVertical);
    }

    findLagrangian() {
        const segments = [];
        let cur = this;
        while (true) {
            segments.push(cur);
            cur = cur.nextSegment();
            if (cur.equals(this)) break;
        }
        return segments;
    }

    // both walls start and end at the orange puncture
    // wall 1 moves right by 1 then down by r - b, shaped almost like upside-down L
    // wall 2 is vertical and shifted epsilon to the left of the orange dot
    homotopyClass() {
        const crossesWall1 = !this.isVertical && 1 <= this.point.index && this.point.index < this.point.surgery.r - this.point.surgery.b;
        const crossesWall2 = !this.isVertical;
        return (crossesWall1 ? '1' : '') + (crossesWall2 ? '2' : '');
    }
}

export function findLagrangians(surgery) {
    const lagrangians = [];
    for (const point of allPoints(surgery)) {
        const first = new Segment(point, true);
        if (lagrangians.some(segs => segs.some(seg => seg.equals(first))))
            continue;
        lagrangians.push(first.findLagrangian());
    }
    return lagrangians;
}
