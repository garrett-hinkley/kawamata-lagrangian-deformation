import { findLagrangians, Surgery } from "./surgery.js";
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

    function drawLagrangians() {
        const lagrangians = findLagrangians(surgery);
        const COLORS = ['red', 'blue', 'green', 'gold', 'black', 'magenta', 'cyan', 'lightgreen'];
        for (let i = 0; i < lagrangians.length; i++) {
            const segments = lagrangians[i];
            const color = COLORS[i % COLORS.length];
            p.stroke(color);
            for (const seg1 of segments) {
                const seg2 = seg1.nextSegment();
                const y = -seg1.point.index;
                p.noFill();
                // vertical segment
                if (seg1.isVertical && seg2.isVertical)
                    p.line(0, y - .5, 0, y + .5);
                // horizontal segment
                else if (!seg1.isVertical && !seg2.isVertical)
                    p.line(-.5, y, 0 + .5, y);
                // left turn
                else if (seg1.isVertical && !seg2.isVertical)
                    p.arc(.5, y - .5, 1, 1, p.HALF_PI, p.PI);
                // right turn
                else if (!seg1.isVertical && seg2.isVertical)
                    p.arc(-.5, y + .5, 1, 1, -p.HALF_PI, 0);
            }
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
    }
};

const myp5 = new p5(sketch);
