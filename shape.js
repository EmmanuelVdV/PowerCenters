class Shape {
    constructor(_id, upCol, upRow, isSingularity) {
        this.id = _id;
        this.upperCellCol = upCol;
        this.upperCellRow = upRow;
        grid[upCol][upRow] = this.id; // mark grid cell as "taken"

        this.isSingularity = isSingularity; // is the singularity ?

        this.shWidth = this.shHeight = 1;
        this.canGrow = true;

        this.size = 11; //random(8, 11); // final size between 60% and 95% ==>>> A ajuster entre 9.9 et ??
        // this.size = 9.9; //9.9
        // this.hatchDirection = Math.round(random(1)); // 0: horizontal, 1: vertical ==> not needed anymore

        this.additionalHatch = 0;

        this.updateWidthHeightCenter();
        this.updatePowerCenter(); // shape belongs to a PowerCenter ?

        this.walls = [];
        this.rays = [];

        this.dir = createVector(Math.cos(this.angle) * this.w, Math.sin(this.angle) * this.w);
        this.dir.normalize();
        // this.target = createVector(this.cw+Math.cos(this.angle)*this.w, this.ch+Math.sin(this.angle)*this.w); // target specific to shape
    }

    updateWidthHeightCenter() {
        this.w = this.shWidth * cellSize * this.size / 10; // drawing size (x% of actual size)
        this.h = this.shHeight * cellSize * this.size / 10;

        this.cw = (this.upperCellCol + this.shWidth / 2) * cellSize; // center of shape
        this.ch = (this.upperCellRow + this.shHeight / 2) * cellSize;
    }

    updatePowerCenter() { // update attributes related to Power Center (if shape belongs to any)

        let e = Math.floor((easings.length-1) * random()); // select hatching except "cross"
        this.easing = easings[e]; 
        // console.log(e, easings[e](45));

        this.angle = random(Math.PI);
        if (this.angle < Math.PI / 2) { this.angle = 0; } else { this.angle = Math.PI / 2; }

        for (let i = 0; i < powercenters.length; i++) {
            if (Math.sqrt(Math.pow(this.cw - powercenters[i].x, 2) + Math.pow(this.ch - powercenters[i].y, 2))< powercenters[i].radius) { // if shape belongs to a powercenter
                this.easing = powercenters[i].easing;
                this.angle = powercenters[i].angle;
                this.size = 11.5; // override of the size
                this.additionalHatch = 0; //6; // additional hatches for PowerCenter
            }
        }


    }

    createBBox() {
        this.walls = [];
        let maxWH = Math.max(this.w, this.h) / 2;
        let x1 = this.cw - maxWH; // create Bounding Box with max width or height
        let y1 = this.ch - maxWH;
        let x2 = this.cw + maxWH;
        let y2 = this.ch + maxWH;
        this.walls.push(new Boundary(x1, y1, x2, y1));
        this.walls.push(new Boundary(x2, y1, x2, y2));
        this.walls.push(new Boundary(x2, y2, x1, y2));
        this.walls.push(new Boundary(x1, y2, x1, y1));

        // this.walls.forEach(w => w.show());
    }

    createWalls() {
        this.walls = [];
        let x1 = this.cw - this.w / 2; // create exact walls from width and height
        let y1 = this.ch - this.h / 2;
        let x2 = this.cw + this.w / 2;
        let y2 = this.ch + this.h / 2;
        this.walls.push(new Boundary(x1, y1, x2, y1));
        this.walls.push(new Boundary(x2, y1, x2, y2));
        this.walls.push(new Boundary(x2, y2, x1, y2));
        this.walls.push(new Boundary(x1, y2, x1, y1));

        //this.walls.forEach(w => w.show());
    }

    getTargetDirection() {
        // Simplification : recherche des points de l'axe de direction avec un bounding circle
        this.maxWH = Math.sqrt(Math.pow(this.w / 2, 2) + Math.pow(this.h / 2, 2));
        this.AxisPt1 = createVector(this.cw + Math.cos(this.angle) * this.maxWH, this.ch + Math.sin(this.angle) * this.maxWH);
        this.AxisPt2 = createVector(this.cw + Math.cos(this.angle + Math.PI) * this.maxWH, this.ch + Math.sin(this.angle + Math.PI) * this.maxWH);

        if (this.AxisPt1.x >= this.AxisPt2.x) { // reclassement dans le bon ordre AxisPt1 et 2
            let AxisPt = this.AxisPt2;
            this.AxisPt2 = this.AxisPt1;
            this.AxisPt1 = AxisPt;
        }
    }

    render() {
        this.updateWidthHeightCenter();

        if (this.isSingularity) {
            stroke('#8B0000');
            // this.target.x = this.cw; // update target point (center of Singularity)
            // this.target.y = this.ch;
        } else { stroke(255); }

        if (drawBorders) {
            rect(this.cw, this.ch, this.w, this.h);
        }
    }

    intersect(wall, h) { // determine point of intersection between a wall and a hatch h
        let x1 = wall.a.x;
        let y1 = wall.a.y;
        let x2 = wall.b.x;
        let y2 = wall.b.y;

        let x3 = h.a.x;
        let y3 = h.a.y;
        let x4 = h.b.x;
        let y4 = h.b.y;

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

    generateHatch() {
        this.hatch();
        if (this.easing == cross) { // handle cross hatching
            this.angle += Math.PI/2;
            this.hatch();
        }
    }

    hatch() {
        // if (!this.isSingularity) {
        this.getTargetDirection();

        // Bounding box can include target and axe does not find intersections 
        if (this.AxisPt1 != null && this.AxisPt2 != null) {
            this.createWalls();

            let distAxis = this.AxisPt1.dist(this.AxisPt2);
            let distAxisX = Math.abs(this.AxisPt2.x - this.AxisPt1.x);
            let distAxisY = Math.abs(this.AxisPt2.y - this.AxisPt1.y);

            stroke(255);

            this.dir.rotate(Math.PI / 2); // rotate 90 degrees

            let hatch = Math.floor(distAxis / (10 * cellSize)) * (maxHatch + this.additionalHatch); //round(map(distAxis, cellSize, /* max(this.w, this.h) */ 10 * cellSize, 1, maxHatch));
            // console.log("hatch", hatch);

            for (let i = 1; i <= hatch; i++) {
                let j = map(i, 1, hatch, 0, 1);
                // find point along direction axis and define a perpendicular ray
                let calcX = i * distAxisX / hatch * this.easing(j);
                let calcY = i * distAxisY / hatch * this.easing(j);
                let adjust = 1;
                if (this.AxisPt1.y > this.AxisPt2.y) { adjust = -1; }
                let rayOrigin = createVector(this.AxisPt1.x + calcX, this.AxisPt1.y + adjust * calcY);

                let ray = new Boundary(rayOrigin.x - this.dir.x * this.maxWH, rayOrigin.y - this.dir.y * this.maxWH, rayOrigin.x + this.dir.x * this.maxWH, rayOrigin.y + this.dir.y * this.maxWH);

                // check intersection of ray against each wall
                let intersectPoints = [];
                this.walls.forEach(w => {
                    let iPt = this.intersect(w, ray);
                    if (iPt != null) { intersectPoints.push(iPt); }
                });

                if (intersectPoints.length == 2) {
                    let RayPt1 = createVector(intersectPoints[0].x, intersectPoints[0].y);
                    let RayPt2 = createVector(intersectPoints[1].x, intersectPoints[1].y);
                    this.rays.push([RayPt1, RayPt2]);
                }
            }

            if (this.isSingularity) { stroke('#8B0000'); } else { stroke(255); }

            this.rays.forEach(r => {
                line(r[0].x, r[0].y, r[1].x, r[1].y);
            });

        }

    }

    renderSVG(d, g) {

        this.rays.forEach(r => {
            let line = d.line(r[0].x, r[0].y, r[1].x, r[1].y);
            if (!this.isSingularity) {
                line.stroke({ color: '#FFFFFF' });
                g[1].add(line);
            } else {
                line.stroke({ color: '#8B0000' });
                g[0].add(line);
            }
        })

        // if (!this.isSingularity) {
        //     this.rays.forEach(r => {
        //         let line = d.line(r[0].x, r[0].y, r[1].x, r[1].y);
        //         line.stroke({ color: '#FFFFFF' });
        //         g[1].add(line);
        //     })

        // } else {

        //     if (this.hatchDirection == 0) {
        //         let hatch = round(map(this.h, cellSize, 10 * cellSize, 1, maxHatch));
        //         for (let i = 1; i <= hatch; i++) {
        //             let j = map(i, 1, hatch, 0, 1);
        //             let line = d.line(this.cw - this.w / 2, this.ch - this.h / 2 + i * this.h / hatch * this.easing(j), this.cw + this.w / 2, this.ch - this.h / 2 + i * this.h / hatch * this.easing(j));

        //             line.stroke({ color: '#8B0000' });
        //             g[0].add(line);
        //         }
        //     } else {
        //         let hatch = round(map(this.w, cellSize, 10 * cellSize, 1, maxHatch));
        //         for (let i = 1; i <= hatch; i++) {
        //             let j = map(i, 1, hatch, 0, 1);
        //             let line = d.line(this.cw - this.w / 2 + i * this.w / hatch * this.easing(j), this.ch - this.h / 2, this.cw - this.w / 2 + i * this.w / hatch * this.easing(j), this.ch + this.h / 2);

        //             line.stroke({ color: '#8B0000' });
        //             g[0].add(line);
        //         }
        //     }
        // }
    }

    grow(dir) {
        // direction : 0 = West, 1 = North, 2 = East, 3 = South
        let isOK = true;

        // console.log(dir+" "+this.upperCellCol+" "+this.shWidth+" "+this.upperCellRow+" "+this.shHeight);

        switch (dir) {

            case 0:
                if (this.upperCellCol == 0) return false; // test border
                for (let i = 0; i < this.shHeight; i++) {
                    if (grid[this.upperCellCol - 1][this.upperCellRow + i] != 0) isOK = false; // check if cells are free in "direction"
                }

                if (isOK) {
                    for (let i = 0; i < this.shHeight; i++) {
                        grid[this.upperCellCol - 1][this.upperCellRow + i] = this.id; // occupy the cells
                    }
                    this.upperCellCol -= 1;
                    this.shWidth += 1;

                    return true;
                }
                return false;

            case 1:
                if (this.upperCellRow == 0) return false; // test border
                for (let i = 0; i < this.shWidth; i++) {
                    if (grid[this.upperCellCol + i][this.upperCellRow - 1] != 0) isOK = false; // check if cells are free in "direction"
                }

                if (isOK) {
                    for (let i = 0; i < this.shWidth; i++) {
                        grid[this.upperCellCol + i][this.upperCellRow - 1] = this.id; // occupy the cells
                    }
                    this.upperCellRow -= 1;
                    this.shHeight += 1;
                    return true;
                }
                return false;

            case 2:
                if ((this.upperCellCol + this.shWidth) >= gridCols) return false; // test border
                for (let i = 0; i < this.shHeight; i++) {
                    if (grid[this.upperCellCol + this.shWidth][this.upperCellRow + i] != 0) isOK = false; // check if cells are free in "direction"
                }

                if (isOK) {
                    for (let i = 0; i < this.shHeight; i++) {
                        grid[this.upperCellCol + this.shWidth][this.upperCellRow + i] = this.id; // occupy the cells
                    }
                    this.shWidth += 1;
                    return true;
                }
                return false;

            case 3:
                if ((this.upperCellRow + this.shHeight) >= gridRows) return false; // test boder
                for (let i = 0; i < this.shWidth; i++) {
                    if (grid[this.upperCellCol + i][this.upperCellRow + this.shHeight] != 0) isOK = false; // check if cells are free in "direction"
                }

                if (isOK) {
                    for (let i = 0; i < this.shWidth; i++) {
                        grid[this.upperCellCol + i][this.upperCellRow + this.shHeight] = this.id; // occupy the cells
                    }
                    this.shHeight += 1;
                    return true;
                }
                return false;

            default: // something went wrong
                println("something went wrong");
                return false;
        }
    }
}