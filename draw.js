/**
 * Determine alignment
 * @type { class }
 **/
class Alignments {
  static Horizontal = new Alignments(true);
  static Vertical = new Alignments(false);

  constructor(isHorizontal) {
    this.isHorizontal = isHorizontal;
  }
}

/**
 * Draw the individual block on canvas
 * @type {function}
 **/
function drawBlock(x, y, ctx, blockSize) {
  ctx.beginPath();
  ctx.rect(x * blockSize, y * blockSize, blockSize, blockSize);
  ctx.fillStyle = "#2c6eba";
  ctx.fill();
}

/**
 * Draw repeating lines on canvas
 * @type {function}
 **/
function drawLines(alignment, ctx, width, blockSize) {
  if (alignment.isHorizontal) {
    for (let i = 0; i < PIXELCOUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * blockSize);
      ctx.lineTo(width, i * blockSize);
      ctx.strokeStyle = "#BBBBBB";
      ctx.stroke();
    }
  } else {
    for (let i = 0; i < PIXELCOUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * blockSize, 0);
      ctx.lineTo(i * blockSize, width);
      ctx.strokeStyle = "#BBBBBB";
      ctx.stroke();
    }
  }
}

/**
 * Draw a pixel art from a JSON file
 * @type {function}
 **/
function drawArt(data, ctx, blockSize) {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x] === true) {
        drawBlock(x, y, ctx, blockSize);
      }
    }
  }
}
