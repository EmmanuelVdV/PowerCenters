class Ray {
    constructor(_pos, _dir) {
        this.pos = _pos;
        this.dir = _dir;
    }

    cast(wall, direction) {
        let x1 = wall.a.x;
        let y1 = wall.a.y;
        let x2 = wall.b.x;
        let y2 = wall.b.y;

        let x3 = this.pos.x;
        let y3 = this.pos.y;
        let x4 = this.pos.x + direction * this.dir.x;
        let y4 = this.pos.y + direction * this.dir.y;

        let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return null;
        }

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        if (t > 0 && t < 1 && u > 0) {
            let pt = createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
            return pt;
        } else {
            return null;
        }
    }

}