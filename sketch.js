let w = document.body.clientWidth;
let h = document.body.clientHeight;
let attempts;
let maxAttempts = 200; // 500 // 1500

let shapes = [];
let grid = [];
let maxCellSize = 1.5; // 1.8
let gridCols = w / maxCellSize;
let gridRows = h / maxCellSize;

let nMaxShapes = (gridCols * gridRows) / 200; // / 2000;

let drawBorders = false;
let maxHatch = 12; //8;

let selectSingularity = false; // has the Singularity been identified ?
let isSingularity = false; // is the current Shape the Singularity ?

// let centerCol = Math.round(gridCols / 2);
// let centerRow = Math.round(gridRows / 2);

let centerCanvas;
let distCenterCanvas;

let powercenters = [];
let maxDepthPowercenters = 6; //2
let maxSubDivision = 4;

function setup() {
  createCanvas(w, h);
  centerCanvas = createVector(w/2, h/2);
  distCenterCanvas = centerCanvas.dist(createVector(0,0));
  noFill();
  stroke(255);
  rectMode(CENTER);

  // target = createVector(w/2, h/2); // initial target at canvas' center

  // console.log(gridCols, gridRows);
  // console.log(centerCol, centerRow);

  randomSeed(fxrand() * 10000);

  // maxRadiusPowerCenter = Math.min(w / 5, h / 5);

  initPowerCenters();
  initGrid();
}

function draw() {
  background(0);
  shapes.forEach(s => s.render());
  powercenters.forEach(pc => pc.show());

  if (attempts < maxAttempts) {
    shapes.forEach(s => {
      let dir = Math.round(random() * 3);
      s.grow(dir);
    });
    attempts++;
  } else {
    console.log("stop");
    shapes.forEach(s => s.generateHatch());
    noLoop();
  }
}

function initGrid() {

  attempts = 0;

  // initialisation of the cell grid
  for (let i = 0; i < gridCols; i++) {
    grid[i] = [];
    for (let j = 0; j < gridRows; j++) {
      grid[i][j] = 0; // all cells are "free"
    }
  }


  for (let s = 1; s <= nMaxShapes; s++) {
    let c = Math.round((random()) * (gridCols - 1));
    let r = Math.round((random()) * (gridRows - 1));

    // let c = Math.round(centerCol + cos(Math.PI * 2 * s / (fxrand() * nMaxShapes / (nCircles * circle))) * (gridCols * circle / (2 * nCircles) - 1)); // ajouté fxrand() et "*circle"
    // let r = Math.round(centerRow + sin(Math.PI * 2 * s / (fxrand() * nMaxShapes / (nCircles * circle))) * (gridRows * circle / (2 * nCircles) - 1));

    // console.log(c, r);



    if (!selectSingularity && c > 10 && c < (gridCols - 10) && r > 10 && r < (gridRows - 10)) { // selection of Singularity
      isSingularity = random() > 0.98 ? true : false;
      if (isSingularity) selectSingularity = true;
    }

    if (grid[c][r] == 0) {
      let shape = new Shape(s + 1, c, r, isSingularity);
      shapes.push(shape); // create shape if cell is free
    }

    isSingularity = false;
  }
}

function initPowerCenters() {
  // let margin = Math.max(w, h) / 5;
  // for (let i = 0; i < nPowercenters; i++) {
  //   let x = Math.round(random(margin, w-margin)); 
  //   let y = Math.round(random(margin, h-margin));
  //   let r = random(0.5, 1) * maxRadiusPowerCenter; // radius
  //   let pc = new Powercenter(x, y, r);
  //   powercenters.push(pc);
  // }
  let s = Math.floor(random() * maxSubDivision + 1);
  let o = Math.round(random());
  let pc = new Powercenter(0, 0, w, h, s, 0); // first PowerCenter at level 0 (whole canvas)

  // console.log(powercenters);
}

function keyTyped() {
  if (key === 'p' || key === 'P') {
    saveCanvas('PowerCenters-' + getTimeStamp(), 'png');
  } else if (key === 's' || key === 'S') {

    // SVG rendering and saving
    let drawSVG = SVG().addTo('body').size(w, h);
    let groups = [drawSVG.group().addClass('singularity'), drawSVG.group().addClass('other')]; // groups to handle Singularity and the rest
    shapes.forEach(s => s.renderSVG(drawSVG, groups));
    drawSVG.rect(w, h).stroke({ color: '#000000' }).back();


    let svg = drawSVG.svg();
    // erreur Maximum call stack size exceeded sur svg.js en cas de canvas trop grand
    let blob = new Blob([svg], { type: "image/svg+xml" });

    let dl = document.createElement("a");
    dl.download = "PowerCenters-" + getTimeStamp() + ".svg";
    dl.href = URL.createObjectURL(blob);
    dl.dataset.downloadurl = ["image/svg+xml", dl.download, dl.href].join(':');
    dl.style.display = "none";
    document.body.appendChild(dl);

    dl.click();

    document.body.removeChild(dl); // remove download element

    let elements = document.body.getElementsByTagName("svg"); // remove SVG element
    document.body.removeChild(elements[0]);
  }

}



