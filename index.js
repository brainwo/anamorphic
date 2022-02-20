const PIXELCOUNT = 16;
let imageA;
let imageB;
let selectedColor;

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
      drawGrid(ctx, width, blockSize);

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

  initPalette();

  function canvasDraw(ctx, image, positionX, positionY) {
    image[positionY][positionX] = selectedColor;

    ctx.clearRect(0, 0, width, width);
    drawGrid(ctx, width, blockSize);
    drawArt(image, ctx, blockSize);

    VoxelCanvas.context.requestUpdate({
      remove: false,
      x: positionX,
      y: positionY,
      color: selectedColor,
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
      imageA[positionY][positionX] = selectedColor;

      ctxA.clearRect(0, 0, width, width);

      drawGrid(ctxA, width, blockSize);
      drawArt(imageA, ctxA, blockSize);

      VoxelCanvas.context.requestUpdate({
        remove: false,
        x: positionX,
        y: positionY,
        color: selectedColor,
      });
    }

    if (e.buttons === 2) {
      imageA[positionY][positionX] = null;

      ctxA.clearRect(0, 0, width, width);

      drawGrid(ctxA, width, blockSize);
      drawArt(imageA, ctxA, blockSize);

      VoxelCanvas.context.requestUpdate({
        remove: true,
        x: positionX,
        y: positionY,
        color: selectedColor,
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

      imageB[positionY][positionX] = selectedColor;

      ctxB.clearRect(0, 0, width, width);

      drawGrid(ctxB, width, blockSize);
      drawArt(imageB, ctxB, blockSize);
    }

    if (e.buttons === 2) {
      const positionX = Math.floor((e.x - canvasB.offsetLeft) / blockSize);
      const positionY = Math.floor((e.y - canvasB.offsetTop) / blockSize);

      imageB[positionY][positionX] = null;

      ctxB.clearRect(0, 0, width, width);

      drawGrid(ctxB, width, blockSize);
      drawArt(imageB, ctxB, blockSize);
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
    this.rotate = true;
  }

  init() {
    let canvas = document.querySelector("#result");
    this.isRunning = true;

    const width = 820;
    const height = 500;
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x212121);

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -2000,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(width, height);

    const object = new THREE.Object3D();
    this.drawCubes(object);
    scene.add(object);
    object.rotation.y = 1.57;
    object.scale.x = 1.5;
    object.scale.y = 1.5;
    object.scale.z = 1.5;

    camera.position.z = 1;

    let previousPosition = {
      x: 0,
      y: 0,
    };

    canvas.addEventListener("mousemove", (e) => {
      if (e.buttons === 1) {
        console.log(object.rotation.x);

        if (object.rotation.x > 1) {
          object.rotation.x = 1;
        } else if (object.rotation.x < -1) {
          object.rotation.x = -1;
        } else {
          let movement = (e.offsetY - previousPosition.y) * 0.01;
          if (
            object.rotation.x + movement >= -1 &&
            object.rotation.x + movement <= 1
          ) {
            object.rotation.x += movement;
          }
        }

        object.rotation.y += (e.offsetX - previousPosition.x) * 0.01;

        previousPosition = {
          x: e.offsetX,
          y: e.offsetY,
        };

        this.rotate = false;
      } else if (e.buttons === 2) {
        if (object.scale.x > 2) {
          object.scale.copy(new THREE.Vector3(2, 2, 2));
        } else if (object.scale.x < 0.5) {
          object.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
        } else {
          let movementX = (e.offsetY - previousPosition.y) * 0.01;
          let movementY = (e.offsetx - previousPosition.x) * 0.01;
          if (
            object.scale.x + movementX >= 0.5 &&
            object.scale.x + movementX <= 2
          ) {
            object.scale.addScalar(movementX);
          }
          if (
            object.scale.x + movementY >= 0.5 &&
            object.scale.x + movementY <= 2
          ) {
            object.scale.addScalar(movementY);
          }
        }

        previousPosition = {
          x: e.offsetX,
          y: e.offsetY,
        };

        this.rotate = false;
      } else {
        // TODO: check mouse enter and leave
        this.rotate = true;
      }
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    const updateBlock = async () => {
      if (this.update) {
        if (this.updateBlock.remove) {
          for (let z = 0; z < PIXELCOUNT; z++) {
            this.cubes[z][this.updateBlock.y][
              this.updateBlock.x
            ].visible = false;

            this.materials[z][this.updateBlock.y][this.updateBlock.x][4] =
              new THREE.MeshBasicMaterial({
                color: this.updateBlock.color,
              });

            this.materials[z][this.updateBlock.y][this.updateBlock.x][5] =
              new THREE.MeshBasicMaterial({
                color: this.updateBlock.color,
              });
          }
        } else {
          for (let z = 0; z < PIXELCOUNT; z++) {
            this.cubes[z][this.updateBlock.y][
              this.updateBlock.x
            ].visible = true;

            this.materials[z][this.updateBlock.y][this.updateBlock.x][4] =
              new THREE.MeshBasicMaterial({
                color: this.updateBlock.color,
              });

            this.materials[z][this.updateBlock.y][this.updateBlock.x][5] =
              new THREE.MeshBasicMaterial({
                color: this.updateBlock.color,
              });
          }
        }

        this.cutB();

        this.update = false;
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);

      updateBlock();

      if (this.rotate) {
        object.rotation.y += 0.01;
      }

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
              color: imageB[y][z],
            }),
            new THREE.MeshBasicMaterial({
              color: imageB[y][z],
            }),
            new THREE.MeshBasicMaterial({
              color: 0xdcdcdc,
            }),
            new THREE.MeshBasicMaterial({
              color: 0xdcdcdc,
            }),
            new THREE.MeshBasicMaterial({
              color: imageA[y][x],
            }),
            new THREE.MeshBasicMaterial({
              color: imageA[y][x],
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
          if (imageA[y][x] === null) {
            this.cubes[z][y][x].visible = false;
          }
        }
      }
    }

    for (let x = PIXELCOUNT - 1; x >= 0; x--) {
      for (let y = 0; y < PIXELCOUNT; y++) {
        for (let z = 0; z < PIXELCOUNT; z++) {
          if (imageB[y][z] === null) {
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
          if (imageB[y][z] === null) {
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
          let imageAFace = this.materials[x][y][z][4];
          let imageBFace = this.materials[z][y][x][0];

          this.materials[z][y][x][0] = imageAFace;
          this.materials[z][y][x][1] = imageAFace;
          this.materials[x][y][z][4] = imageBFace;
          this.materials[x][y][z][5] = imageBFace;

          this.cubes[z][y][x].visible = imageA[y][x] !== null;
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
  drawGrid(ctxA, width, blockSize);
  drawArt(imageA, ctxA, blockSize);

  ctxB.clearRect(0, 0, width, width);
  drawGrid(ctxB, width, blockSize);
  drawArt(imageB, ctxB, blockSize);

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

      drawGrid(ctxA, width, blockSize);
      drawGrid(ctxB, width, blockSize);

      drawArt(imageA, ctxA, blockSize);
      drawArt(imageB, ctxB, blockSize);

      VoxelCanvas.context.resetCanvas();
    });
}
