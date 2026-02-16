const GRID_SIZE = 50;

let slider1, slider2;
let isTurningPoint = [true, false, false, false, false];

// assumes inputs are non-negative
function gcd(x, y) {
    if (x < y) {
        [x, y] = [y, x];
    }
    while (y != 0) {
        [x, y] = [y, x % y];
    }
    return x;
}

// like % but non-negative
function mod(x, y) {
    const ans = x % y;
    return ans < 0 ? ans + y : ans;
}

// inefficient for large y, but good enough
function invmod(x, y) {
    for (let z = 0; z < y; z++) {
        if (mod(z*x - 1, y) == 0) return z;
    }
}

function calcRB() {
    const r0 = slider1.value();
    const a0 = slider2.value();
    g = gcd(r0, a0);
    const r = r0 / g;
    const a = (a0 / g) % r;
    const b = invmod(a, r);
    return [r, b];
}

function setup() {
    noLoop();

    slider1 = select('#slider1');
    slider2 = select('#slider2');

    // setSlider overwrites is-turning-point in local storage, so we must read is-turning-point first
    const sliderStored1 = getItem('slider1');
    const sliderStored2 = getItem('slider2');
    const isTurningPointStored = getItem('is-turning-point');

    if (sliderStored1) setSlider1(sliderStored1);
    if (sliderStored2) setSlider2(sliderStored2);
    if (isTurningPointStored) setIsTurningPoint(isTurningPointStored);

    slider1.input(handleSliderUpdate);
    slider2.input(handleSliderUpdate);

    const canvas = createCanvas(windowWidth, windowHeight);
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
    select('#label1').html(`r = ${r0}`);
    select('#label2').html(`a = ${a0}`);
    storeItem('slider1', slider1.value());
    storeItem('slider2', slider2.value());
    const [r, b] = calcRB();
    setIsTurningPoint(Array(r).fill(false).with(0, true));
    redraw();
}

function setIsTurningPoint(arr) {
    isTurningPoint = arr;
    storeItem('is-turning-point', arr);
}

function mouseMoved() {
    redraw();
}

function handleClick() {
    const i = round(mouseX / GRID_SIZE);
    const j = round(mouseY / GRID_SIZE);
    const [r, b] = calcRB();
    const index = mod(-b*i - j, r);
    if (index == 0) return;
    setIsTurningPoint(isTurningPoint.with(index, !isTurningPoint[index]));
    redraw();
}

function draw() {
    const [r, b] = calcRB();

    background(255);
    scale(GRID_SIZE);
    strokeWeight(.05)
    drawMouseIndicator(r, b);
    repeat(r, b, () => {
        drawOrangeDot();
        drawLagrangians(r, b);
    });

    // TODO recalculate rank less often
    // console.log(calculateRank(r, b, isTurningPoint));
}

function drawMouseIndicator(r, b) {
    const i = round(mouseX / GRID_SIZE);
    const j = round(mouseY / GRID_SIZE);
    const index = mod(-b*i - j, r);
    if (index == 0) return;
    noStroke();
    fill(200);
    circle(i, j, .25);
}

function repeat(r, b, f) {
    const maxI = width / GRID_SIZE;
    const maxJ = height / GRID_SIZE;
    for (let i = 0; i < maxI + 1; i++) {
        // -bi - j = 0 mod r
        for (let j = mod(-b*i, r); j < maxJ + r; j += r) {
            push();
            translate(i, j);
            f();
            pop();
        }
    }
}

function drawOrangeDot() {
    fill('orange');
    noStroke();
    circle(0, 0, .2);
}

// vertical means halfway above, horizontal means halfway to the left
function makeSegment(index, isVertical) {
    return { index: index, isVertical: isVertical };
}

function segmentsEqual(seg1, seg2) {
    return seg1.index == seg2.index && seg1.isVertical == seg2.isVertical;
}

function nextSegment(r, b, segment) {
    const newIsVertical = (segment.isVertical != isTurningPoint[segment.index]);
    const delta = newIsVertical ? -1 : -b;
    newIndex = mod(segment.index + delta, r);
    return makeSegment(newIndex, newIsVertical);
}

function findLagrangians(r, b) {
    const lagrangians = [];
    for (let i = 0; i < r; i++) {
        const firstSegment = makeSegment(i, true);
        if (lagrangians.some(l => l.some(seg => segmentsEqual(seg, firstSegment))))
            continue;
        const segments = [];
        let curSegment = firstSegment;
        while (true) {
            segments.push(curSegment);
            curSegment = nextSegment(r, b, curSegment);
            if (segmentsEqual(curSegment, firstSegment))
                break;
        }
        lagrangians.push(segments);
    }
    return lagrangians;
}

function drawSegment(x, y, isVert1, isVert2) {
    noFill();
    if (isVert1 && isVert2)
        line(x, y - .5, x, y + .5);
    else if (!isVert1 && !isVert2)
        line(x - .5, y, x + .5, y);
    else if (isVert1 && !isVert2)
        arc(x + .5, y - .5, 1, 1, HALF_PI, PI);
    else if (!isVert1 && isVert2)
        arc(x - .5, y + .5, 1, 1, -HALF_PI, 0);
}

function drawLagrangian(segments) {
    for (let i = 0; i < segments.length; i++) {
        const seg1 = segments[i];
        const seg2 = i == segments.length - 1 ? segments[0] : segments[i+1];
        drawSegment(0, - seg1.index, seg1.isVertical, seg2.isVertical);
    }
}

function drawLagrangians(r, b) {
    const lagrangians = findLagrangians(r, b);
    const COLORS = ['red', 'blue', 'green', 'gold', 'black', 'magenta', 'cyan', 'lightgreen'];
    for (let i = 0; i < lagrangians.length; i++) {
        const segments = lagrangians[i];
        const color = COLORS[i % COLORS.length];
        stroke(color);
        drawLagrangian(segments);
    }
}

// move this to new file?
function bigon(start, end, sign) {
    return { start: start, end: end, sign: sign };
}

// make surgery struct / class with r, a, b, isTurningPoint? (and rank?)
function getTurningPointAbove(r, b, isTurningPoint, point) {
    point = mod(point + 1, r);
    while (!isTurningPoint[point]) {
        point = mod(point + 1, r);
    }
    return point;
}

function getTurningPointRight(r, b, isTurningPoint, point) {
    point = mod(point - b, r);
    while (!isTurningPoint[point]) {
        point = mod(point - b, r);
    }
    return point;
}

function findBigonsTurningPoint(r, b, isTurningPoint, point) {
    return [
        bigon(point, getTurningPointAbove(r, b, isTurningPoint, point), 1),
        bigon(point, getTurningPointRight(r, b, isTurningPoint, point), -1),
    ];
}

function findBigonsIntersectionPoint(r, b, isTurningPoint, point) {
    return [];
}

function calculateRank(r, b, isTurningPoint) {
    const matrix = [];
    for (let i = 0; i < r; i++) {
        matrix.push(Array(r).fill(0));
    }
    for (let point = 0; point < r; point++) {
        const bigons = isTurningPoint[point] ? findBigonsTurningPoint(r, b, isTurningPoint, point)
                                                : findBigonsIntersectionPoint(r, b, point);
        for (const bigon of bigons) {
            // use cols instead of rows?
            matrix[bigon.start][bigon.end] += sign;
        }
    }
    // TODO calculate nullity
    return matrix;
}
