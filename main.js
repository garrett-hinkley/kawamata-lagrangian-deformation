import { Surgery } from "./surgery.js";
import { mod } from "./utils.js";

const GRID_SIZE = 50;

let surgery;

const sketch = (p) => {
    function setSurgery(newSurgery) {
        surgery = newSurgery;
        p.storeItem('surgery', newSurgery);
    }

    function handleSliderUpdate() {
        const r0 = p.select('#slider1').value();
        const a0 = p.select('#slider2').value();
        p.select('#label1').html(`r = ${r0}`);
        p.select('#label2').html(`a = ${a0}`);
        setSurgery(new Surgery(r0, a0));
        p.redraw();
    }

    function handleClick() {
        const i = p.round(p.mouseX / GRID_SIZE);
        const j = p.round(p.mouseY / GRID_SIZE);
        const index = mod(-surgery.b * i - j, surgery.r);
        setSurgery(surgery.toggleTurningPoint(index));
        p.redraw();
    }

    p.setup = () => {
        p.noLoop();

        const slider1 = p.select('#slider1');
        const slider2 = p.select('#slider2');
        surgery = new Surgery(slider1.value(), slider2.value());

        const stored = p.getItem('surgery');
        if (stored) {
            const r0 = stored.r0;
            const a0 = stored.a0;
            slider1.value(r0);
            slider2.value(a0);
            p.select('#label1').html(`r = ${r0}`);
            p.select('#label2').html(`a = ${a0}`);
            surgery = new Surgery(stored.r0, stored.a0, stored.isTurningPoint);
        }

        slider1.input(handleSliderUpdate);
        slider2.input(handleSliderUpdate);

        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.mouseClicked(handleClick);
    }

    p.mouseMoved = p.redraw;

    function drawMouseIndicator(r, b) {
        const i = p.round(p.mouseX / GRID_SIZE);
        const j = p.round(p.mouseY / GRID_SIZE);
        const index = mod(-b*i - j, r);
        if (index == 0) return;
        p.noStroke();
        p.fill(200);
        p.circle(i, j, .25);
    }

    function repeat(r, b, f) {
        const maxI = p.width / GRID_SIZE;
        const maxJ = p.height / GRID_SIZE;
        for (let i = 0; i < maxI + 1; i++) {
            // -bi - j = 0 mod r
            for (let j = mod(-b*i, r); j < maxJ + r; j += r) {
                p.push();
                p.translate(i, j);
                f();
                p.pop();
            }
        }
    }

    function drawOrangeDot() {
        p.fill('orange');
        p.noStroke();
        p.circle(0, 0, .2);
    }

    function drawSegment(x, y, isVert1, isVert2) {
        p.noFill();
        if (isVert1 && isVert2)
            p.line(x, y - .5, x, y + .5);
        else if (!isVert1 && !isVert2)
            p.line(x - .5, y, x + .5, y);
        else if (isVert1 && !isVert2)
            p.arc(x + .5, y - .5, 1, 1, p.HALF_PI, p.PI);
        else if (!isVert1 && isVert2)
            p.arc(x - .5, y + .5, 1, 1, -p.HALF_PI, 0);
    }

    function drawLagrangian(segments) {
        for (let i = 0; i < segments.length; i++) {
            const seg1 = segments[i];
            const seg2 = i == segments.length - 1 ? segments[0] : segments[i+1];
            drawSegment(0, - seg1.index, seg1.isVertical, seg2.isVertical);
        }
    }

    function drawLagrangians() {
        const lagrangians = surgery.findLagrangians();
        const COLORS = ['red', 'blue', 'green', 'gold', 'black', 'magenta', 'cyan', 'lightgreen'];
        for (let i = 0; i < lagrangians.length; i++) {
            const segments = lagrangians[i];
            const color = COLORS[i % COLORS.length];
            p.stroke(color);
            drawLagrangian(segments);
        }
    }

    p.draw = () => {
        p.background(255);
        p.scale(GRID_SIZE);
        p.strokeWeight(.05)
        drawMouseIndicator(surgery.r, surgery.b);
        repeat(surgery.r, surgery.b, () => {
            drawOrangeDot();
            drawLagrangians();
        });

        // TODO recalculate rank less often
        // console.log(calculateRank(r, b, isTurningPoint));
    }
};

const myp5 = new p5(sketch);

// // move this to new file?
// function bigon(start, end, sign) {
//     return { start: start, end: end, sign: sign };
// }

// // make surgery struct / class with r, a, b, isTurningPoint? (and rank?)
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
