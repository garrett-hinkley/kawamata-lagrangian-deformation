import { mod } from "./utils.js";

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

export function findLagrangians(r, b, isTurningPoint) {
    const lagrangians = [];
    for (let i = 0; i < r; i++) {
        const firstSegment = makeSegment(i, true);
        if (lagrangians.some(l => l.some(seg => segmentsEqual(seg, firstSegment))))
            continue;
        const segments = [];
        let curSegment = firstSegment;
        while (true) {
            segments.push(curSegment);
            curSegment = nextSegment(r, b, isTurningPoint, curSegment);
            if (segmentsEqual(curSegment, firstSegment))
                break;
        }
        lagrangians.push(segments);
    }
    return lagrangians;
}
