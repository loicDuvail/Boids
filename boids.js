const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 1;
canvas.height = window.innerHeight - 6;

const c = canvas.getContext("2d");

const { PI } = Math;

// params (all ranging from 1 to 100)

const SETTINGS = {
    minSpeed: 3,
    maxSpeed: 6,
    alignement: 85,
    alignementViewRange: 100,
    avoidOtherBoids: 25,
    boidsViewRange: 50,
    avoidWalls: 70,
    wallsViewRange: 100,
    DRAW_TRAIL: false,
    DRAW_BOID: false,
};

function drawBoid(ctx, boid) {
    let { x, y, dx, dy, length_px } = boid;

    let theta = Math.atan2(dy, dx);

    y = canvas.height - y;

    ctx.beginPath();
    ctx.moveTo(x, y);
    const [bottomRight, tip, bottomLeft] = getPointsFromPolarCoords(
        x,
        y,
        [theta - (3 / 4) * PI, theta, theta + (3 / 4) * PI],
        [length_px / 3, length_px, length_px / 3]
    );
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(x, y);
    c.fillStyle = "white";
    ctx.fill();
}

function getPointFromPolarCoords(xStart, yStart, theta, r) {
    let x = xStart + Math.cos(theta) * r;
    //substract from canvas.height because canvas y axes in inverted
    //when working with canvas
    let y = yStart - Math.sin(theta) * r;
    return {
        x,
        y,
    };
}

function getPointsFromPolarCoords(xStart, yStart, thetas = [], radiuses = []) {
    let coords = [];
    for (let i = 0; i < thetas.length && i < radiuses.length; i++) {
        try {
            let theta = thetas[i];
            let r = radiuses[i];
            coords.push(getPointFromPolarCoords(xStart, yStart, theta, r));
        } catch (e) {}
    }
    return coords;
}

function distance(boid1, boid2) {
    return Math.sqrt((boid1.x - boid2.x) ** 2 + (boid1.y - boid2.y) ** 2);
}

function getCloseBoids(boid, boids, maxDistance) {
    let closeBoids = [];
    for (const otherBoid of boids)
        if (otherBoid != boid)
            if (distance(boid, otherBoid) < maxDistance)
                closeBoids.push(otherBoid);

    return closeBoids;
}

function drawTrail(memory) {
    c.beginPath();
    c.moveTo(memory[0][0], canvas.height - memory[0][1]);

    for (let i = 1; i < memory.length; i++) {
        c.lineTo(memory[i][0], canvas.height - memory[i][1]);
    }

    c.strokeStyle = "lightgrey";
    c.stroke();
}

class Boid {
    constructor(x, y, dx, dy, length_px) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.length_px = length_px;
        this.memory = [];
    }

    draw = () => {
        if (SETTINGS.DRAW_BOID) drawBoid(c, this);

        if (!SETTINGS.DRAW_TRAIL || !this.memory[1]) return;

        drawTrail(this.memory);
    };

    avoidWalls = () => {
        const avoidenceCoef = SETTINGS.avoidWalls / 200;
        if (this.x > canvas.width - SETTINGS.wallsViewRange)
            this.dx -= avoidenceCoef;
        if (this.x < SETTINGS.wallsViewRange) this.dx += avoidenceCoef;
        if (this.y > canvas.height - SETTINGS.wallsViewRange)
            this.dy -= avoidenceCoef;
        if (this.y < SETTINGS.wallsViewRange) this.dy += avoidenceCoef;
    };

    setCloseBoids = () => {
        this.closeBoids = getCloseBoids(
            this,
            boids,
            SETTINGS.alignementViewRange
        );
    };

    updatePos = () => {
        if (Math.sqrt(this.dx ** 2 + this.dy ** 2) < SETTINGS.minSpeed) {
            let angle = Math.atan2(this.dy, this.dx);
            this.dx = Math.cos(angle) * SETTINGS.maxSpeed;
            this.dy = Math.sin(angle) * SETTINGS.maxSpeed;
        }
        if (Math.sqrt(this.dx ** 2 + this.dy ** 2) > SETTINGS.maxSpeed) {
            let angle = Math.atan2(this.dy, this.dx);
            this.dx = Math.cos(angle) * SETTINGS.maxSpeed;
            this.dy = Math.sin(angle) * SETTINGS.maxSpeed;
        }
        this.x += this.dx;
        this.y += this.dy;
    };

    align = () => {
        const { closeBoids } = this;

        if (!closeBoids[0]) return;

        let alignCoef = 100 - SETTINGS.alignement;

        let dxSum = 0,
            dySum = 0;

        for (const closeBoid of closeBoids) {
            dxSum += closeBoid.dx;
            dySum += closeBoid.dy;
        }

        let averageDx = dxSum / closeBoids.length;
        let averageDy = dySum / closeBoids.length;

        this.dx = (this.dx * alignCoef + averageDx) / (alignCoef + 1);
        this.dy = (this.dy * alignCoef + averageDy) / (alignCoef + 1);
    };

    avoidOtherBoids = () => {
        const veryCloseBoids = getCloseBoids(
            this,
            boids,
            SETTINGS.boidsViewRange
        );
        if (!veryCloseBoids[0]) return;

        const avoidCoef = SETTINGS.avoidOtherBoids / 5000;

        for (const veryCloseBoid of veryCloseBoids) {
            this.dx += (this.x - veryCloseBoid.x) * avoidCoef;
            this.dy += (this.y - veryCloseBoid.y) * avoidCoef;
        }
    };

    group = () => {
        const { closeBoids } = this;
        if (!closeBoids[0]) return;

        let xSum = 0,
            ySum = 0;

        for (const closeBoid of closeBoids) {
            xSum += closeBoid.x;
            ySum += closeBoid.y;
        }

        let averageX = xSum / closeBoids.length;
        let averageY = ySum / closeBoids.length;

        this.dx += (this.x - averageX) * 0.0001;
        this.dy += (this.y - averageY) * 0.0001;
    };

    store = () => {
        this.memory.push([this.x, this.y]);
        if (this.memory.length > 50) {
            this.memory.shift();
        }
    };

    update = () => {
        this.setCloseBoids();
        this.align();
        this.avoidOtherBoids();
        // this.group();
        this.updatePos();
        this.avoidWalls();
        this.store();
        this.draw();
    };
}

function generateRandoms(nbOfRandoms) {
    let randoms = [];
    for (let i = 0; i < nbOfRandoms; i++) randoms.push(Math.random());
    return randoms;
}

function generateBoids(numOfBoids) {
    let boids = [];

    for (let i = 0; i < numOfBoids; i++) {
        let [x, y, dx, dy, length_px] = generateRandoms(5);
        x *= canvas.width;
        y *= canvas.height;
        dx = dx * 12 - 6;
        dy = dy * 12 - 6;
        length_px = 20 + 10 * length_px;
        boids.push(new Boid(x, y, dx, dy, length_px));
    }

    return boids;
}

const boids = generateBoids(220);

function frame() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    for (const boid of boids) {
        boid.update();
    }
}

setInterval(frame, 13);
