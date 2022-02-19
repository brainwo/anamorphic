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

        voxelCanvas.init();
      }
      drawGrid(ctx, width, blockSize);
    });
}

function drawGrid(ctx, width, blockSize) {
  drawLines(Alignments.Horizontal, ctx, width, blockSize);
  drawLines(Alignments.Vertical, ctx, width, blockSize);
}

function main() {
  const canvasA = document.getElementById("canvasA");
  const ctxA = canvasA.getContext("2d");
  const canvasB = document.getElementById("canvasB");
  const ctxB = canvasB.getContext("2d");
  const width = canvasA.width;
  const blockSize = width / PIXELCOUNT;

  const debug = document.getElementById("debug").getContext("2d");

  initCanvas(Sides.A, ctxA, width, blockSize);
  initCanvas(Sides.B, ctxB, width, blockSize, voxelCanvas);

  canvasA.addEventListener("mousemove", (e) => {
    const positionX = Math.floor((e.x - canvasA.offsetLeft) / blockSize);
    const positionY = Math.floor((e.y - canvasA.offsetTop) / blockSize);
    if (e.buttons === 1) {
      imageA[positionY][positionX] = true;

      ctxA.clearRect(0, 0, width, width);
      drawArt(imageA, ctxA, blockSize);
      drawGrid(ctxA, width, blockSize);

      voxelCanvas.requestUpdate({
        remove: false,
        index: positionY * 16 + positionX,
      });
    }

    if (e.buttons === 2) {
      imageA[positionY][positionX] = false;

      ctxA.clearRect(0, 0, width, width);
      drawArt(imageA, ctxA, blockSize);
      drawGrid(ctxA, width, blockSize);

      voxelCanvas.requestUpdate({
        remove: true,
        index: positionY * 16 + positionX,
      });
    }

    debug.clearRect(0, 0, width, 12);
    debug.font = "10px Arial";
    debug.fillText(`Location: ${positionX}, ${positionY}`, 0, 10);
  });

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

    debug.clearRect(0, 12, width, width);
    debug.font = "10px Arial";
    debug.fillText(
      `Location: ${e.x - canvasB.offsetLeft}, ${e.y - canvasB.offsetTop}`,
      0,
      24
    );
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
  constructor() {
    this.geometries = [];
    this.materials = [];
    this.cubes = [];
    this.update = false;
    this.updateBlock = {};
  }

  init() {
    const width = 820;
    const height = 500;
    const scene = new THREE.Scene();
    //const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -100,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#result"),
    });
    renderer.setSize(width, height);

    camera.position.z = 10;

    const object = new THREE.Object3D();
    this.drawCubes(object);
    scene.add(object);
    object.rotation.y = 1.57;

    const animate = () => {
      requestAnimationFrame(animate);

      if (this.update) {
        console.log("hit");
        if (this.updateBlock.remove) {
          this.cubes[this.updateBlock.index].visible = false;
        } else {
          this.cubes[this.updateBlock.index].visible = true;
        }

        this.update = false;
      }

      object.rotation.y += 0.01;

      if (object.rotation.y > 1.57 * 3) {
        swapButton();
        object.rotation.y = 1.57;
      }

      renderer.render(scene, camera);
    };

    animate();
  }

  drawCubes(object) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const index = y * 16 + x;
        this.geometries[index] = new THREE.BoxGeometry(10, 10, 10);
        this.materials[index] = new THREE.MeshBasicMaterial({
          color: 0xb000ba,
        });
        this.cubes[index] = new THREE.Mesh(
          this.geometries[index],
          this.materials[index]
        );
        object.add(this.cubes[index]);
        this.cubes[index].position.x = x * 10 - (16 * 10) / 2;
        this.cubes[index].position.y = y * -10 - (16 * -10) / 2;
        if (imageA[y][x] === false) {
          this.cubes[index].visible = false;
        }
      }
    }
  }

  resetCanvas() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const index = y * 16 + x;
        this.cubes[index].visible = imageA[y][x];
      }
    }
  }

  requestUpdate(updateBlock) {
    this.update = true;
    this.updateBlock = updateBlock;
  }
}

function swapButton() {
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

  voxelCanvas.resetCanvas();
}

const voxelCanvas = new VoxelCanvas();
