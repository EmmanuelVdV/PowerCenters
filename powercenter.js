class Powercenter {

    constructor(x, y, w, h, s, d, o) {
        this.x = x; // left upper corner x
        this.y = y; // left upper corner y
        this.width = w; // width of PowerCenter
        this.height = h; // height of PowerCenter
        this.subdivision = s; // number of divides
        this.orientation = o; // divide vertically 0 or horizontally 1
        this.depth = d; // current depth of division

        let e = Math.floor(easings.length * random()); // hatching type
        this.easing = easings[e];
        // this.easing = easeInCirc;

        this.angle = Math.floor(random(4)) * Math.PI / 8; // angle of hatching

        // Size and max number of hatch linked to distance of canvas center
        let a = this.x + this.width / 2; // calculate center of the PC
        let b = this.y + this.height / 2;
        let centerPC = createVector(a, b);
        let distPC = centerPC.dist(centerCanvas);

        this.maxH = maxHatch * (1 - distPC / (1.5 * distCenterCanvas));
        // this.cellSize = maxCellSize * (1 - distPC / distCenterCanvas);

        if (this.depth < maxDepthPowercenters) { // stop if max depth reached
            for (let i = 0; i < this.subdivision; i++) {
                this.divide(i);
            }
        } else { // max depth reached so add this Powercenter to the list
            powercenters.push(this);
        }
    }

    divide(n) {
        let a, b, c, d;
        if (this.orientation) { // divide horizontally
            console.log("divide horizontally"+this.subdivision);
            c = this.width;
            d = this.height / this.subdivision;
            a = this.x;
            b = this.y + n * d;
        } else { // else divide vertically
            console.log("divide vertically"+this.subdivision);
            c = this.width / this.subdivision;
            d = this.height;
            a = this.x + n * c;
            b = this.y;
        }

        let s = Math.floor(Math.random() * 4 + 1);
        // let o = Math.round(Math.random());
        let o = 0;
        if (c < d) {o = 1;} // divide in the largest of width or height

        new Powercenter(a, b, c, d, s, this.depth + 1, o);
    }

    show() {
        console.log("show pc");
        stroke('#00FF00');
        rectMode(CORNER);
        // strokeWeight(2);
        rect(this.x, this.y, this.width, this.height);
    }
}