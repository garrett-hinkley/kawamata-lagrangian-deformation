import { gcd, mod, invmod } from "./utils.js";

// vertical means halfway above, horizontal means halfway to the left
function makeSegment(index, isVertical) {
    return { index: index, isVertical: isVertical };
}

function segmentsEqual(seg1, seg2) {
    return seg1.index == seg2.index && seg1.isVertical == seg2.isVertical;
}

function nextSegment(r, b, isTurningPoint, segment) {
    const newIsVertical = (segment.isVertical != isTurningPoint[segment.index]);
    const delta = newIsVertical ? -1 : -b;
    const newIndex = mod(segment.index + delta, r);
    return makeSegment(newIndex, newIsVertical);
}

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

    toggleTurningPoint(index) {
        if (index === 0) return this;
        else return new Surgery(this.r, this.a, this.isTurningPoint.with(index, !this.isTurningPoint[index]))
    }

    findLagrangians() {
        const lagrangians = [];
        for (let i = 0; i < this.r; i++) {
            const firstSegment = makeSegment(i, true);
            if (lagrangians.some(l => l.some(seg => segmentsEqual(seg, firstSegment))))
                continue;
            const segments = [];
            let curSegment = firstSegment;
            while (true) {
                segments.push(curSegment);
                curSegment = nextSegment(this.r, this.b, this.isTurningPoint, curSegment);
                if (segmentsEqual(curSegment, firstSegment))
                    break;
            }
            lagrangians.push(segments);
        }
        return lagrangians;
    }
}
