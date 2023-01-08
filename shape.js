class Shape {
    constructor(_id, upCol, upRow, isSingularity) {
        this.id = _id;
        this.upperCellCol = upCol;
        this.upperCellRow = upRow;
        grid[upCol][upRow] = this.id; // mark grid cell as "taken"

        this.isSingularity = isSingularity; // is the singularity ?

        this.shWidth = this.shHeight = 1;
        this.canGrow = true;

        // this.size = random(9, 12); // final size between 60% and 95% ==>>> A ajuster entre 9.9 et ??
        this.size = 9.9;
        this.hatchDirection = Math.round(random(1)); // 0: horizontal, 1: vertical ==> not needed anymore

        let e = Math.floor(easings.length * fxrand());
        this.easing = easings[e];
        // console.log(e, easings[e](45));

        this.updateWidthHeightCenter();

        this.walls = [];
        this.rays = [];
    }

    updateWidthHeightCenter() {
        this.w = this.shWidth * cellSize * this.size / 10; // drawing size (x% of actual size)
        this.h = this.shHeight * cellSize * this.size / 10;

        this.cw = (this.upperCellCol + this.shWidth / 2) * cellSize; // center of shape
        this.ch = (this.upperCellRow + this.shHeight / 2) * cellSize;
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
        this.createBBox(); //create Bounding box

        let dir = createVector(target.x - this.cw, target.y - this.ch);
        dir.normalize();

        let shCenter = createVector(this.cw, this.ch);
        let axe = new Ray(shCenter, dir);

        let record1 = 500000000;
        let record2 = 500000000;
        let closest1 = null;
        let closest2 = null;

        // console.log("walls", this.walls);
        // console.log("shape center", shCenter);
        // console.log("axe", axe);

        this.walls.forEach(w => {
            let pt = axe.cast(w, 1.0);
            if (pt != null) {
                let d = shCenter.dist(pt);
                if (d < record1) {
                    record1 = d;
                    closest1 = pt;
                }
            }
        });

        this.walls.forEach(w => {
            let pt = axe.cast(w, -1.0);
            if (pt != null) {
                let d = shCenter.dist(pt);
                if (d < record2) {
                    record2 = d;
                    closest2 = pt;
                }
            }
        });

        // Bounding box can include target and axe does not find intersections 
        if (closest1 != null && closest2 != null) {
            if (closest1.x <= closest2.x) {
                this.AxisPt1 = createVector(closest1.x, closest1.y);
                this.AxisPt2 = createVector(closest2.x, closest2.y);
            } else {
                this.AxisPt2 = createVector(closest1.x, closest1.y);
                this.AxisPt1 = createVector(closest2.x, closest2.y);
            }
        }
    }

    render() {
        this.updateWidthHeightCenter();

        if (this.isSingularity) {
            stroke('#8B0000');
            target.x = this.cw; // update target point (center of Singularity)
            target.y = this.ch;
        } else { stroke(255); }

        if (drawBorders) {
            rect(this.cw, this.ch, this.w, this.h);
        }
    }

    hatch() {
        if (!this.isSingularity) {
            this.getTargetDirection();

            // Bounding box can include target and axe does not find intersections 
            if (this.AxisPt1 != null && this.AxisPt2 != null) {
                this.createWalls();

                let distAxis = this.AxisPt1.dist(this.AxisPt2);
                let distAxisX = Math.abs(this.AxisPt2.x - this.AxisPt1.x);
                let distAxisY = Math.abs(this.AxisPt2.y - this.AxisPt1.y);

                // stroke('#0000FF');
                // fill('#0000FF');
                // circle(this.AxisPt1.x, this.AxisPt1.y, 10);
                // stroke('#FF0000');
                // fill('#FF0000');
                // circle(this.AxisPt2.x, this.AxisPt2.y, 5);
                // noFill();
                // stroke('#0000FF');
                // line(this.AxisPt1.x, this.AxisPt1.y, this.AxisPt2.x, this.AxisPt2.y);

                stroke(255);
                for (let a = 0; a < maxHatch; a++) {
                    let dir = createVector(target.x - this.cw, target.y - this.ch);
                    dir.rotate(Math.PI / 2); // rotate 90 degrees
                    dir.normalize();

                    let hatch = Math.floor(distAxis / (10 * cellSize)) * maxHatch; //round(map(distAxis, cellSize, /* max(this.w, this.h) */ 10 * cellSize, 1, maxHatch));
                    // console.log("hatch", hatch);

                    for (let i = 1; i <= hatch; i++) {
                        let j = map(i, 1, hatch, 0, 1);
                        // find point and cast ray both direction against walls
                        let calcX = i * distAxisX / hatch * this.easing(j);
                        let calcY = i * distAxisY / hatch * this.easing(j);
                        let adjust = 1;
                        if (this.AxisPt1.y > this.AxisPt2.y) { adjust = -1; }
                        let rayOrigin = createVector(this.AxisPt1.x + calcX, this.AxisPt1.y + adjust * calcY);

                        let ray = new Ray(rayOrigin, dir);
                        // line(rayOrigin.x, rayOrigin.y, dir.x, dir.y);

                        let record1 = 500000000;
                        let record2 = 500000000;
                        let closest1 = null;
                        let closest2 = null;

                        this.walls.forEach(w => {
                            let pt = ray.cast(w, 1.0);
                            if (pt != null) {
                                let d = rayOrigin.dist(pt);
                                if (d < record1) {
                                    record1 = d;
                                    closest1 = pt;
                                }
                            }
                        });

                        this.walls.forEach(w => {
                            let pt = ray.cast(w, -1.0);
                            if (pt != null) {
                                let d = rayOrigin.dist(pt);
                                if (d < record2) {
                                    record2 = d;
                                    closest2 = pt;
                                }
                            }
                        });

                        if (closest1 != null && closest2 != null) {
                            let RayPt1 = createVector(closest1.x, closest1.y);
                            let RayPt2 = createVector(closest2.x, closest2.y);
                            this.rays.push([RayPt1, RayPt2]);
                        }
                    }
                }

                this.rays.forEach(r => {
                    line(r[0].x, r[0].y, r[1].x, r[1].y);
                });

            }

        } else {
            stroke('#8B0000');
            if (this.hatchDirection == 0) {
                let hatch = round(map(this.h, cellSize, 10 * cellSize, 1, maxHatch));
                for (let i = 1; i <= hatch; i++) {
                    let j = map(i, 1, hatch, 0, 1);
                    line(this.cw - this.w / 2, this.ch - this.h / 2 + i * this.h / hatch * this.easing(j), this.cw + this.w / 2, this.ch - this.h / 2 + i * this.h / hatch * this.easing(j));
                }
            } else {
                let hatch = round(map(this.w, cellSize, 10 * cellSize, 1, maxHatch));
                for (let i = 1; i <= hatch; i++) {
                    let j = map(i, 1, hatch, 0, 1);
                    line(this.cw - this.w / 2 + i * this.w / hatch * this.easing(j), this.ch - this.h / 2, this.cw - this.w / 2 + i * this.w / hatch * this.easing(j), this.ch + this.h / 2);
                }
            }
        }
    }

    renderSVG(d, g) {

        if (!this.isSingularity) {
            this.rays.forEach(r => {
                let line = d.line(r[0].x, r[0].y, r[1].x, r[1].y);
                line.stroke({ color: '#FFFFFF' });
                g[1].add(line);
            })

        } else {

            if (this.hatchDirection == 0) {
                let hatch = round(map(this.h, cellSize, 10 * cellSize, 1, maxHatch));
                for (let i = 1; i <= hatch; i++) {
                    let j = map(i, 1, hatch, 0, 1);
                    let line = d.line(this.cw - this.w / 2, this.ch - this.h / 2 + i * this.h / hatch * this.easing(j), this.cw + this.w / 2, this.ch - this.h / 2 + i * this.h / hatch * this.easing(j));

                    line.stroke({ color: '#8B0000' });
                    g[0].add(line);
                }
            } else {
                let hatch = round(map(this.w, cellSize, 10 * cellSize, 1, maxHatch));
                for (let i = 1; i <= hatch; i++) {
                    let j = map(i, 1, hatch, 0, 1);
                    let line = d.line(this.cw - this.w / 2 + i * this.w / hatch * this.easing(j), this.ch - this.h / 2, this.cw - this.w / 2 + i * this.w / hatch * this.easing(j), this.ch + this.h / 2);

                    line.stroke({ color: '#8B0000' });
                    g[0].add(line);
                }
            }
        }
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