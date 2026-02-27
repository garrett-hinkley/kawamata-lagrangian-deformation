import { allPoints, Segment } from "./surgery.js";
import { compareArrays } from "./utils.js";

export class Bigon {
    constructor(deg0, deg1, sign) {
        // this.surgery = surgery;
        this.deg0 = deg0;
        this.deg1 = deg1;
        this.sign = sign;
    }

    equals(other) {
        // return this.deg0.equals(other.deg0) && this.deg1.equals(other.deg1) && this.sign === other.sign;
        return this.deg0 === other.deg0 && this.deg1 === other.deg1 && this.sign === other.sign;
    }

    comparisonKey() {
        // return [this.deg0.index, this.deg1.index, this.sign];
        return [this.deg0, this.deg1, this.sign];
    }

    compare(other) {
        return compareArrays(this.comparisonKey(), other.comparisonKey());
    }
}

// delete this?
class Path {
    constructor(segs) {
        this.segs = segs;
    }

    startPoint() {
        return this.segs[0].point;
    }

    endPoint() {
        return this.segs.at(-1).point;
    }

    extend() {
        return new Path([...this.segs, this.segs.at(-1).nextSegment()]);
    }

    // ignore first segment
    segments() {
        // const segs = [];
        // let cur = this.start;
        // while (!cur.equals(this.end)) {
        //     cur = cur.nextSegment();
        //     segs.push(cur);
        // }
        // return segs;
        return this.segs.slice(1);
    }

    deltaX() {
        return this.segments().filter(seg => !seg.isVertical).length;
    }

    deltaY() {
        return this.segments().filter(seg => seg.isVertical).length;
    }

    homotopyClass() {
        return this.segments().reduce((_class, seg) => _class + seg.homotopyClass(), '');
    }
}

function findOtherBigonCorner(point) {
    let path1 = new Path([(new Segment(point, false))]);
    let path2 = new Path([(new Segment(point, true))]);
    path1 = path1.extend();
    while (!path1.segs[0].equals(path1.segs.at(-1))) {
        const diff1 = path1.deltaX() - path2.deltaX();
        const diff2 = path1.deltaY() - path2.deltaY();
        if (diff1 < 0 || diff2 < 0 || path1.endPoint().isTurningPoint()) {
            path1 = path1.extend();
            continue;
        }
        if (diff1 > 0 || diff2 > 0 || path2.endPoint().isTurningPoint()) {
            path2 = path2.extend();
            continue;
        }
        // paths now intersect
        if (path1.homotopyClass() !== path2.homotopyClass()) return null;
        else return path1.endPoint();
    }
    return null;
}

// ensures that concatenation of findBigons(pt) over all pts in surgery is every bigon
// i.e. every contribution is counted exactly once
function findBigons(point) {
    if (point.isTurningPoint()) {
        return [
            new Bigon(point.index, point.turningPointAbove().index, 1),
            new Bigon(point.index, point.turningPointRight().index, -1),
        ];
    }
    else {
        const point2 = findOtherBigonCorner(point);
        if (point2 === null) return [];
        return [
            new Bigon(point.index, point2.index, -1),
            new Bigon(point2.index, point.index, 1),
        ];
    }
}

// guaranteed to be sorted
export function findAllBigons(surgery) {
    const bigons = [];
    for (const point of allPoints(surgery)) {
        bigons.push(...findBigons(point));
    }
    bigons.sort((a, b) => a.compare(b));
    return bigons;
}
