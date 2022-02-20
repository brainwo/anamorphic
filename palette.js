function initPalette() {
  const canvas = document.getElementById("palette");
  const ctx = canvas.getContext("2d");

  canvas.style.cursor = "pointer";

  const zantPalette = [
    [
      "#97c5e4",
      "#1a1d96",
      "#494cdd",
      "#617ce8",
      "#7299e8",
      "#8cb0e2",
      "#b9dbdf",
      "#d4ece7",
      "#bd5378",
      "#ce6737",
      "#e18856",
      "#f5c573",
      "#f0eac9",
      "#ffffff",
      "#d1f0a6",
    ],
    [
      "#89df43",
      "#4fd032",
      "#1ab720",
      "#0da14d",
      "#08815d",
      "#544c78",
      "#824ba1",
      "#ce61a8",
      "#df7cdb",
      "#d8adec",
      "#ddd0ee",
      "#7fb7b7",
      "#73979f",
      "#617181",
      "#545b6c",
    ],
  ];

  let resetPalette = () => {
    for (let [index, value] of zantPalette[0].entries()) {
      drawBlock(index, 0, ctx, canvas.width / 15, value);
    }

    for (let [index, value] of zantPalette[1].entries()) {
      drawBlock(index, 1, ctx, canvas.width / 15, value);
    }
  };

  resetPalette();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;

  canvas.addEventListener("click", (e) => {
    resetPalette();
    const positionX = Math.floor(
      (e.x - canvas.offsetLeft) / (canvas.width / 15)
    );
    const positionY = Math.floor(
      (e.y - canvas.offsetTop) / (canvas.height / 2)
    );

    ctx.strokeRect(
      (positionX * canvas.width) / 15,
      (positionY * canvas.height) / 2,
      canvas.width / 15,
      canvas.height / 2
    );

    console.log(positionX);
    console.log(positionY);

    selectedColor = zantPalette[positionY][positionX];

    console.log(selectedColor);
  });
}
