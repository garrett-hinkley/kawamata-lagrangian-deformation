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

export class Segment {
    // vertical means halfway above, horizontal means halfway to the left
    constructor(surgery, index, isVertical) {
        this.surgery = surgery;
        this.index = index;
        this.isVertical = isVertical;
    }

    equals(other) {
        return this.surgery.equals(other.surgery) && this.index === other.index && this.isVertical === other.isVertical;
    }

    nextSegment() {
        const newIsVertical = (this.isVertical !== this.surgery.isTurningPoint[this.index]);
        const delta = newIsVertical ? -1 : -this.surgery.b;
        const newIndex = mod(this.index + delta, this.surgery.r);
        return new Segment(this.surgery, newIndex, newIsVertical);
    }
}

export function findLagrangians(surgery) {
    const lagrangians = [];
    for (let i = 0; i < surgery.r; i++) {
        const firstSegment = new Segment(surgery, i, true);
        if (lagrangians.some(segs => segs.some(seg => seg.equals(firstSegment))))
            continue;
        const segments = [];
        let curSegment = firstSegment;
        while (true) {
            segments.push(curSegment);
            curSegment = curSegment.nextSegment();
            if (curSegment.equals(firstSegment))
                break;
        }
        lagrangians.push(segments);
    }
    return lagrangians;
}

// function bigon(start, end, sign) {
//     return { start: start, end: end, sign: sign };
// }

// function getTurningPointAbove(r, b, isTurningPoint, point) {
//     point = mod(point + 1, r);
//     while (!isTurningPoint[point]) {
//         point = mod(point + 1, r);
//     }
//     return point;
// }

// function getTurningPointRight(r, b, isTurningPoint, point) {
//     point = mod(point - b, r);
//     while (!isTurningPoint[point]) {
//         point = mod(point - b, r);
//     }
//     return point;
// }

// function findBigonsTurningPoint(r, b, isTurningPoint, point) {
//     return [
//         bigon(point, getTurningPointAbove(r, b, isTurningPoint, point), 1),
//         bigon(point, getTurningPointRight(r, b, isTurningPoint, point), -1),
//     ];
// }

// function findBigonsIntersectionPoint(r, b, isTurningPoint, point) {
//     return [];
// }

// function calculateRank(r, b, isTurningPoint) {
//     const matrix = [];
//     for (let i = 0; i < r; i++) {
//         matrix.push(Array(r).fill(0));
//     }
//     for (let point = 0; point < r; point++) {
//         const bigons = isTurningPoint[point] ? findBigonsTurningPoint(r, b, isTurningPoint, point)
//                                                 : findBigonsIntersectionPoint(r, b, point);
//         for (const bigon of bigons) {
//             // use cols instead of rows?
//             matrix[bigon.start][bigon.end] += sign;
//         }
//     }
//     // TODO calculate nullity
//     return matrix;
// }
