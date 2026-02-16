import { findLagrangians } from "./findLagrangians.js";
import { gcd, mod, invmod } from "./utils.js";

const sketch = (p) => {
    const GRID_SIZE = 50;

    let slider1, slider2;
    let isTurningPoint = [true, false, false, false, false];

    function calcRB() {
        const r0 = slider1.value();
        const a0 = slider2.value();
        const g = gcd(r0, a0);
        const r = r0 / g;
        const a = (a0 / g) % r;
        const b = invmod(a, r);
        return [r, b];
    }

    p.setup = () => {
        p.noLoop();

        slider1 = p.select('#slider1');
        slider2 = p.select('#slider2');

        // setSlider overwrites is-turning-point in local storage, so we must read is-turning-point first
        const sliderStored1 = p.getItem('slider1');
        const sliderStored2 = p.getItem('slider2');
        const isTurningPointStored = p.getItem('is-turning-point');

        if (sliderStored1) setSlider1(sliderStored1);
        if (sliderStored2) setSlider2(sliderStored2);
        if (isTurningPointStored) setIsTurningPoint(isTurningPointStored);

        slider1.input(handleSliderUpdate);
        slider2.input(handleSliderUpdate);

        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.mouseClicked(handleClick);
    }

    function setSlider1(value) {
        slider1.value(value);
        handleSliderUpdate();
    }

    function setSlider2(value) {
        slider2.value(value);
        handleSliderUpdate();
    }

    function handleSliderUpdate() {
        const r0 = slider1.value();
        const a0 = slider2.value();
        p.select('#label1').html(`r = ${r0}`);
        p.select('#label2').html(`a = ${a0}`);
        p.storeItem('slider1', slider1.value());
        p.storeItem('slider2', slider2.value());
        const [r, b] = calcRB();
        setIsTurningPoint(Array(r).fill(false).with(0, true));
        p.redraw();
    }

    function setIsTurningPoint(arr) {
        isTurningPoint = arr;
        p.storeItem('is-turning-point', arr);
    }

    p.mouseMoved = () => {
        p.redraw();
    }

    function handleClick() {
        const i = p.round(p.mouseX / GRID_SIZE);
        const j = p.round(p.mouseY / GRID_SIZE);
        const [r, b] = calcRB();
        const index = mod(-b*i - j, r);
        if (index == 0) return;
        setIsTurningPoint(isTurningPoint.with(index, !isTurningPoint[index]));
        p.redraw();
    }

    p.draw = () => {
        const [r, b] = calcRB();

        p.background(255);
        p.scale(GRID_SIZE);
        p.strokeWeight(.05)
        drawMouseIndicator(r, b);
        repeat(r, b, () => {
            drawOrangeDot();
            drawLagrangians(r, b);
        });

        // TODO recalculate rank less often
        // console.log(calculateRank(r, b, isTurningPoint));
    }

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

    function drawLagrangians(r, b) {
        const lagrangians = findLagrangians(r, b, isTurningPoint);
        const COLORS = ['red', 'blue', 'green', 'gold', 'black', 'magenta', 'cyan', 'lightgreen'];
        for (let i = 0; i < lagrangians.length; i++) {
            const segments = lagrangians[i];
            const color = COLORS[i % COLORS.length];
            p.stroke(color);
            drawLagrangian(segments);
        }
    }

};

// Start the sketch
new p5(sketch);

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
