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

class Point {
    constructor(surgery, index) {
        this.surgery = surgery;
        this.index = index;
    }

    equals(other) {
        return this.surgery.equals(other.surgery) && this.index === other.index;
    }

    isTurningPoint() {
        return this.surgery.isTurningPoint[this.index];
    }

    move(delta) {
        return new Point(this.surgery, mod(this.index + delta, this.surgery.r));
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
        let cur = this.moveUp();
        while (!cur.isTurningPoint()) {
            cur = cur.moveRight();
        }
        return cur;
    }
}

function allPoints(surgery) {
    const points = [];
    for (let i = 0; i < surgery.r; i++) {
        points.push(new Point(surgery, i));
    }
    return points;
}

export class Segment {
    // vertical means halfway above, horizontal means halfway to the left
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
}

export function findLagrangians(surgery) {
    const lagrangians = [];
    for (const point of allPoints(surgery)) {
        const first = new Segment(point, true);
        if (lagrangians.some(segs => segs.some(seg => seg.equals(first))))
            continue;
        const segments = [];
        let cur = first;
        while (true) {
            segments.push(cur);
            cur = cur.nextSegment();
            if (cur.equals(first))
                break;
        }
        lagrangians.push(segments);
    }
    return lagrangians;
}

class Bigon {
    constructor(surgery, start, end, sign) {
        this.surgery = surgery;
        this.start = start;
        this.end = end;
        this.sign = sign;
    }
}

function findBigons(point) {
    if (point.isTurningPoint()) {
        return [
            new Bigon(point.surgery, point, point.turningPointAbove(), 1),
            new Bigon(point.surgery, point, point.turningPointRight(), -1),
        ];
    }
    else {
        // TODO
        return [];
    }
}

function calculateRank(surgery) {
    const matrix = [];
    for (let i = 0; i < surgery.r; i++) {
        matrix.push(Array(surgery.r).fill(0));
    }
    for (const point of allPoints(surgery)) {
        for (const bigon of findBigons(point)) {
            // use cols instead of rows?
            matrix[bigon.start.index][bigon.end.index] += sign;
        }
    }
    // TODO calculate nullity
    return matrix;
}
