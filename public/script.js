const gridElement = document.getElementById("grid");
const generateButton = document.getElementById("generate");

const renderGrid = (layout) => {
  gridElement.innerHTML = "";

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      gridElement.appendChild(cell);
    }
  }

  layout.forEach(([[r1, c1], [r2, c2]]) => {
    const cell1 = gridElement.children[r1 * 4 + c1];
    const cell2 = gridElement.children[r2 * 4 + c2];

    const wall = document.createElement("div");
    wall.classList.add("wall");

    if (r1 === r2) wall.classList.add("horizontal");
    else wall.classList.add("vertical");

    cell1.appendChild(wall);
    cell2.appendChild(wall);
  });
};

const fetchLayout = async () => {
  const response = await fetch("/api/layout");
  const data = await response.json();
  renderGrid(data.layout);
};

generateButton.addEventListener("click", fetchLayout);

// Fetch the initial layout
fetchLayout();
