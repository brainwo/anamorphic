const PIXELCOUNT = 16;
let imageA;
let imageB;

class Sides {
  static A = new Sides(true);
  static B = new Sides(false);

  constructor(isA) {
    this.isA = isA;
    this.filename = isA ? "./assets/star.json" : "./assets/flower.json";
  }
}

/**
 * Draw the canvas border and pixels
 * @type {function}
 **/
function initCanvas(side, ctx, width, blockSize) {
  fetch(side.filename)
    .then((response) => {
      return response.json();
    })
    .then((file) => {
      drawArt(file.data, ctx, blockSize);
      if (side.isA) {
        imageA = file.data;
      } else {
        imageB = file.data;

        if (!VoxelCanvas.context.isRunning) {
          VoxelCanvas.context.init();
        } else {
          VoxelCanvas.context.resetCanvas();
        }
      }
      drawGrid(ctx, width, blockSize);
    });
}

function drawGrid(ctx, width, blockSize) {
  drawLines(Alignments.Horizontal, ctx, width, blockSize);
  drawLines(Alignments.Vertical, ctx, width, blockSize);
}

function reset() {
  const canvasA = document.getElementById("canvasA");
  const ctxA = canvasA.getContext("2d");
  const canvasB = document.getElementById("canvasB");
  const ctxB = canvasB.getContext("2d");
  const width = canvasA.width;
  const blockSize = width / PIXELCOUNT;

  ctxA.clearRect(0, 0, width, width);
  ctxB.clearRect(0, 0, width, width);

  initCanvas(Sides.A, ctxA, width, blockSize);
  initCanvas(Sides.B, ctxB, width, blockSize);
}

function main() {
  const canvasA = document.getElementById("canvasA");
  const ctxA = canvasA.getContext("2d");
  const canvasB = document.getElementById("canvasB");
  const ctxB = canvasB.getContext("2d");
  const width = canvasA.width;
  const blockSize = width / PIXELCOUNT;

  reset();

  function canvasDraw(ctx, image, positionX, positionY) {
    image[positionY][positionX] = true;

    ctx.clearRect(0, 0, width, width);
    drawArt(imageA, ctxA, blockSize);
    drawGrid(ctxA, width, blockSize);

    VoxelCanvas.context.requestUpdate({
      remove: false,
      x: positionX,
      y: positionY,
    });
  }

  canvasA.addEventListener("click", (e) => {
    const positionX = Math.floor((e.x - canvasA.offsetLeft) / blockSize);
    const positionY = Math.floor((e.y - canvasA.offsetTop) / blockSize);

    canvasDraw(ctxA, imageA, positionX, positionY);
  });

  canvasA.addEventListener("mousemove", (e) => {
    const positionX = Math.floor((e.x - canvasA.offsetLeft) / blockSize);
    const positionY = Math.floor((e.y - canvasA.offsetTop) / blockSize);
    if (e.buttons === 1) {
      imageA[positionY][positionX] = true;

      ctxA.clearRect(0, 0, width, width);
      drawArt(imageA, ctxA, blockSize);
      drawGrid(ctxA, width, blockSize);

      VoxelCanvas.context.requestUpdate({
        remove: false,
        x: positionX,
        y: positionY,
      });
    }

    if (e.buttons === 2) {
      imageA[positionY][positionX] = false;

      ctxA.clearRect(0, 0, width, width);
      drawArt(imageA, ctxA, blockSize);
      drawGrid(ctxA, width, blockSize);

      VoxelCanvas.context.requestUpdate({
        remove: true,
        x: positionX,
        y: positionY,
      });
    }
  });

  //canvasB.addEventListener("click", (e) => {
  //const positionX = Math.floor((e.x - canvasB.offsetLeft) / blockSize);
  //const positionY = Math.floor((e.y - canvasB.offsetTop) / blockSize);

  //canvasDraw(ctxB, imageB, positionX, positionY);
  //});

  canvasB.addEventListener("mousemove", (e) => {
    if (e.buttons === 1) {
      const positionX = Math.floor((e.x - canvasB.offsetLeft) / blockSize);
      const positionY = Math.floor((e.y - canvasB.offsetTop) / blockSize);

      imageB[positionY][positionX] = true;

      ctxB.clearRect(0, 0, width, width);
      drawArt(imageB, ctxB, blockSize);
      drawGrid(ctxB, width, blockSize);
    }

    if (e.buttons === 2) {
      const positionX = Math.floor((e.x - canvasB.offsetLeft) / blockSize);
      const positionY = Math.floor((e.y - canvasB.offsetTop) / blockSize);

      imageB[positionY][positionX] = false;

      ctxB.clearRect(0, 0, width, width);
      drawArt(imageB, ctxB, blockSize);
      drawGrid(ctxB, width, blockSize);
    }
  });

  canvasA.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault();
    },
    false
  );

  canvasB.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault();
    },
    false
  );
}

class VoxelCanvas {
  //TODO: Came up with better name
  static context = new VoxelCanvas();

  constructor() {
    this.geometries = [[[]]];
    this.materials = [[[]]];
    this.cubes = [[[]]];
    this.update = false;
    this.updateBlock = {};
    this.isRunning = false;
  }

  init() {
    let canvas = document.querySelector("#result");
    this.isRunning = true;

    const width = 820;
    const height = 500;
    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -100,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(width, height);

    camera.position.z = 10;

    const object = new THREE.Object3D();
    this.drawCubes(object);
    scene.add(object);
    object.rotation.y = 1.57;

    let previousMousePosition = {
      x: 0,
      y: 0,
    };

    canvas.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) {
        console.log(object.rotation.x);
        //TODO: X axis rotation
        if (object.rotation.x >= -0.29 && object.rotation.x <= 0.29) {
          let movement = (e.offsetY - previousMousePosition.y) * 0.01;
          if (movement > 0.29) {
            object.rotation.x = 0.29;
          } else if (movement < -0.29) {
            object.rotation.x = -0.29;
          } else {
            object.rotation.x = movement;
          }
        }
        object.rotation.y = e.offsetX * 0.01;

        previousMousePosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
      }
    });

    const updateBlock = async () => {
      if (this.update) {
        if (this.updateBlock.remove) {
          for (let z = 0; z < PIXELCOUNT; z++) {
            this.cubes[z][this.updateBlock.y][
              this.updateBlock.x
            ].visible = false;
          }
        } else {
          for (let z = 0; z < PIXELCOUNT; z++) {
            this.cubes[z][this.updateBlock.y][
              this.updateBlock.x
            ].visible = true;
          }
        }

        this.cutB();

        this.update = false;
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);

      updateBlock();

      //if (object.rotation.y > 1.57 * 3) {
      //swapButton();
      //object.rotation.y = 1.57;
      //}

      renderer.render(scene, camera);
    };

    animate();
  }

  drawCubes(object) {
    for (let z = 0; z < PIXELCOUNT; z++) {
      this.geometries[z] = [];
      this.materials[z] = [];
      this.cubes[z] = [];
      for (let y = 0; y < PIXELCOUNT; y++) {
        this.geometries[z][y] = [];
        this.materials[z][y] = [];
        this.cubes[z][y] = [];
        for (let x = 0; x < PIXELCOUNT; x++) {
          this.geometries[z][y][x] = new THREE.BoxGeometry(10, 10, 10);
          this.materials[z][y][x] = [
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
            }),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
            }),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
            }),
            new THREE.MeshBasicMaterial({
              color: 0xffffff,
            }),
            new THREE.MeshBasicMaterial({
              color: 0xededed,
            }),
            new THREE.MeshBasicMaterial({
              color: 0xededed,
            }),
          ];

          this.cubes[z][y][x] = new THREE.Mesh(
            this.geometries[z][y][x],
            this.materials[z][y][x]
          );
          object.add(this.cubes[z][y][x]);
          this.cubes[z][y][x].position.x = x * 10 - (PIXELCOUNT * 10) / 2;
          this.cubes[z][y][x].position.y = y * -10 - (PIXELCOUNT * -10) / 2;
          this.cubes[z][y][x].position.z = z * -10 - (PIXELCOUNT * -10) / 2;
          if (imageA[y][x] === false) {
            this.cubes[z][y][x].visible = false;
          }
        }
      }
    }

    for (let x = PIXELCOUNT - 1; x >= 0; x--) {
      for (let y = 0; y < PIXELCOUNT; y++) {
        for (let z = 0; z < PIXELCOUNT; z++) {
          if (imageB[y][z] === false) {
            this.cubes[z][y][x].visible = false;
          }
        }
      }
    }
  }

  cutB() {
    for (let x = PIXELCOUNT - 1; x >= 0; x--) {
      for (let y = 0; y < PIXELCOUNT; y++) {
        for (let z = 0; z < PIXELCOUNT; z++) {
          if (imageB[y][z] === false) {
            this.cubes[z][y][x].visible = false;
          }
        }
      }
    }
  }

  resetCanvas() {
    for (let z = 0; z < PIXELCOUNT; z++) {
      for (let y = 0; y < PIXELCOUNT; y++) {
        for (let x = 0; x < PIXELCOUNT; x++) {
          this.cubes[z][y][x].visible = imageA[y][x];
        }
      }
    }

    this.cutB();
  }

  requestUpdate(updateBlock) {
    this.update = true;
    this.updateBlock = updateBlock;
  }

  exportJson() {
    let data = [];
    for (let z = 0; z < PIXELCOUNT; z++) {
      data[z] = [];
      for (let y = 0; y < PIXELCOUNT; y++) {
        data[z][y] = [];
        for (let x = 0; x < PIXELCOUNT; x++) {
          data[z][y][x] = {
            x: x,
            y: y,
            z: z,
            visible: this.cubes[z][y][x].visible,
          };
        }
      }
    }
    var blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    window.open(url);
  }
}

function swap() {
  const imageC = imageA;
  imageA = imageB;
  imageB = imageC;

  const canvasA = document.getElementById("canvasA");
  const ctxA = canvasA.getContext("2d");
  const canvasB = document.getElementById("canvasB");
  const ctxB = canvasB.getContext("2d");
  const width = canvasA.width;
  const blockSize = width / PIXELCOUNT;

  ctxA.clearRect(0, 0, width, width);
  drawArt(imageA, ctxA, blockSize);
  drawGrid(ctxA, width, blockSize);

  ctxB.clearRect(0, 0, width, width);
  drawArt(imageB, ctxB, blockSize);
  drawGrid(ctxB, width, blockSize);

  VoxelCanvas.context.resetCanvas();
}

function clearCanvas() {
  console.log("clear");

  const canvasA = document.getElementById("canvasA");
  const ctxA = canvasA.getContext("2d");
  const canvasB = document.getElementById("canvasB");
  const ctxB = canvasB.getContext("2d");
  const width = canvasA.width;
  const blockSize = width / PIXELCOUNT;

  fetch("./assets/blank.json")
    .then((response) => {
      return response.json();
    })
    .then((file) => {
      ctxA.clearRect(0, 0, width, width);
      ctxB.clearRect(0, 0, width, width);
      data = file.data;

      //TODO: move data to ImageA and ImageB
      imageA = [...data];
      imageB = [...data];

      drawArt(imageA, ctxA, blockSize);
      drawArt(imageB, ctxB, blockSize);

      VoxelCanvas.context.resetCanvas();
      drawGrid(ctxA, width, blockSize);
      drawGrid(ctxB, width, blockSize);
    });
}
