class Powercenter {

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        // let e = Math.floor(easings.length * random());
        // this.easing = easings[e];
        this.easing = easeInCirc;

        this.angle = random(Math.PI);
    }

    show() {
        stroke('#00FF00');
        strokeWeight(5);
        circle(this.x, this.y, this.radius*2);
    }
}