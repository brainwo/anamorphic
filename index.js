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
function initCanvas(side, ctx, width, blockSize, voxelCanvas) {
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

        //voxelCanvas.init();
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

  const voxelCanvas = new VoxelCanvas();

  initCanvas(Sides.A, ctxA, width, blockSize, voxelCanvas);
  initCanvas(Sides.B, ctxB, width, blockSize, voxelCanvas);

  canvasA.addEventListener("mousemove", (e) => {
    if (e.buttons === 1) {
      const positionX = Math.floor((e.x - canvasA.offsetLeft) / blockSize);
      const positionY = Math.floor((e.y - canvasA.offsetTop) / blockSize);

      imageA[positionY][positionX] = true;

      ctxA.clearRect(0, 0, width, width);
      drawArt(imageA, ctxA, blockSize);
      drawGrid(ctxA, width, blockSize);

      voxelCanvas.requestUpdate();
    }

    if (e.buttons === 2) {
      const positionX = Math.floor((e.x - canvasA.offsetLeft) / blockSize);
      const positionY = Math.floor((e.y - canvasA.offsetTop) / blockSize);

      imageA[positionY][positionX] = false;

      ctxA.clearRect(0, 0, width, width);
      drawArt(imageA, ctxA, blockSize);
      drawGrid(ctxA, width, blockSize);

      voxelCanvas.requestUpdate();
    }

    debug.clearRect(0, 0, width, 12);
    debug.font = "10px Arial";
    debug.fillText(
      `Location: ${e.x - canvasA.offsetLeft}, ${e.y - canvasA.offsetTop}`,
      0,
      10
    );
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

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.getElementById("result").appendChild(renderer.domElement);

    camera.position.z = 10;

    const object = new THREE.Object3D();
    this.drawCubes(object);
    scene.add(object);

    const animate = () => {
      requestAnimationFrame(animate);

      if (this.update) {
        console.log("hit");
        this.drawCubes(object);
        this.update = false;
      }

      renderer.render(scene, camera);
    };

    animate();
  }

  drawCubes(object) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (imageA[y][x] === true) {
          this.geometries[y] = new THREE.BoxGeometry(10, 10, 10);
          this.materials[y] = new THREE.MeshBasicMaterial({
            color: 0xb000ba,
          });
          this.cubes[y] = new THREE.Mesh(this.geometries[y], this.materials[y]);
          object.add(this.cubes[y]);
          this.cubes[y].position.x = x * -10;
          this.cubes[y].position.y = y * -10;
        }
      }
    }
  }

  requestUpdate() {
    this.update = true;
  }
}
