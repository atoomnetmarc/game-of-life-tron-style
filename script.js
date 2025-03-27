"use strict";

// Constants
const DEFAULT_WIDTH = 42;
const DEFAULT_HEIGHT = 32;
const DEFAULT_SPEED = 500; // milliseconds
// Removed CELL_SIZE_PX constant

// DOM Elements
const gridContainer = document.getElementById("grid-container");
const mainContainer = document.querySelector(".container"); // Get the main container
const gridWidthInput = document.getElementById("gridWidthInput");
const gridHeightInput = document.getElementById("gridHeightInput");
const speedInput = document.getElementById("speedInput");
const startPauseButton = document.getElementById("startPauseButton");
const stepButton = document.getElementById("stepButton");
const resetButton = document.getElementById("resetButton");
const generationCountDisplay = document.getElementById("generationCount");
const alivePercentageDisplay = document.getElementById("alivePercentage"); // Added for alive percentage
// Elements needed for height calculation
const titleElement = document.querySelector(".container h1");
const controlsElement = document.querySelector(".controls");
const infoElement = document.querySelector(".info");
const bodyElement = document.body; // Get body element

// State Variables
let gridWidth = DEFAULT_WIDTH;
let gridHeight = DEFAULT_HEIGHT;
let grid = []; // 2D array representing the cell states (0 = dead, 1 = live)
let isRunning = false;
let simulationSpeed = DEFAULT_SPEED;
let intervalId = null; // To store the ID from setInterval
let generationCount = 0;
let isPainting = false; // Track if the user is currently painting cells
let paintingState = 0; // 0 for painting dead, 1 for painting alive

// --- Function Definitions Will Go Here ---

// --- Initialization ---
function initialize() {
  console.log("Initializing Game of Life...");
  // Set input defaults
  gridWidthInput.value = DEFAULT_WIDTH;
  gridHeightInput.value = DEFAULT_HEIGHT;
  speedInput.value = DEFAULT_SPEED;

  // Create the initial grid state
  createGrid(gridWidth, gridHeight);

  // Render the initial grid (pass grid as prevGrid to avoid initial highlight)
  renderGrid(grid);

  // Add event listeners
  setupEventListeners();

  console.log("Initialization complete.");
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  console.log("Setting up event listeners...");

  startPauseButton.addEventListener("click", () => {
    if (isRunning) {
      pauseGame();
    } else {
      startGame();
    }
  });

  stepButton.addEventListener("click", () => {
    if (!isRunning) {
      // Only allow step when paused
      runStep();
    }
  });

  const clearButton = document.getElementById("clearButton");

  resetButton.addEventListener("click", handleReset);

  clearButton.addEventListener("click", handleClear);

  gridWidthInput.addEventListener("change", handleSizeChange);
  gridHeightInput.addEventListener("change", handleSizeChange);

  speedInput.addEventListener("change", handleSpeedChange);

  // Event listeners for painting cells (replaces simple click)
  gridContainer.addEventListener("mousedown", handlePointerDown);
  gridContainer.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp); // Listen on window to catch mouseup outside grid
  gridContainer.addEventListener("touchstart", handlePointerDown, { passive: false }); // Use passive: false to allow preventDefault
  gridContainer.addEventListener("touchmove", handlePointerMove, { passive: false });
  window.addEventListener("touchend", handlePointerUp); // Listen on window for touchend

  // Add window resize listener to adjust grid appearance dynamically
  window.addEventListener('resize', updateGridAppearance);

  console.log("Event listeners attached.");

  // Add wheel event listeners for number inputs
  gridWidthInput.addEventListener("wheel", (e) => handleInputWheel(e, gridWidthInput));
  gridHeightInput.addEventListener("wheel", (e) => handleInputWheel(e, gridHeightInput));
  speedInput.addEventListener("wheel", (e) => handleInputWheel(e, speedInput));
}

/**
 * Handles the mouse wheel event on number input fields to increment/decrement the value.
 * @param {WheelEvent} event The wheel event object.
 * @param {HTMLInputElement} inputElement The input element being scrolled upon.
 */
function handleInputWheel(event, inputElement) {
  event.preventDefault(); // Prevent page scrolling

  const currentValue = parseFloat(inputElement.value);
  const step = parseFloat(inputElement.step) || 1; // Use step attribute or default to 1
  const min = parseFloat(inputElement.min);
  const max = parseFloat(inputElement.max);

  let newValue;

  // Determine scroll direction and calculate new value
  if (event.deltaY < 0) {
    // Scrolling up (increment)
    newValue = currentValue + step;
  } else {
    // Scrolling down (decrement)
    newValue = currentValue - step;
  }

  // Clamp the value within min/max bounds if they exist
  if (!isNaN(min) && newValue < min) {
    newValue = min;
  }
  if (!isNaN(max) && newValue > max) {
    newValue = max;
  }

  // Update the input value only if it changed
  if (newValue !== currentValue) {
    inputElement.value = newValue;

    // Manually trigger the 'change' event to ensure handlers like
    // handleSizeChange or handleSpeedChange are called
    const changeEvent = new Event("change", { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
  }
}


// --- Main Execution ---
// Wait for the DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", initialize);

/**
 * Creates and initializes the grid state with a random pattern.
 * Updates the global `grid`, `gridWidth`, and `gridHeight` variables.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 */
function createGrid(width, height) {
  grid = []; // Reset the grid
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      // Randomly assign live (1) or dead (0) state
      grid[y][x] = Math.random() > 0.7 ? 1 : 0; // Approx 30% live cells
    }
  }
  gridWidth = width; // Update global gridWidth state
  gridHeight = height; // Update global gridHeight state
  generationCount = 0; // Reset generation count when grid is created
  console.log(`Created a new ${width}x${height} grid.`);
}

/**
 * Resizes the grid while preserving the existing cell states centered.
 * Fills new areas with dead cells.
 * Updates the global `grid`, `gridWidth`, and `gridHeight` variables.
 * @param {number} newWidth - The new width of the grid.
 * @param {number} newHeight - The new height of the grid.
 */
function resizeGrid(newWidth, newHeight) {
  console.log(`Resizing grid from ${gridWidth}x${gridHeight} to ${newWidth}x${newHeight}`);
  const oldGrid = grid;
  const oldWidth = gridWidth;
  const oldHeight = gridHeight;

  // Create the new grid, initialized with dead cells (0)
  const newGrid = [];
  for (let y = 0; y < newHeight; y++) {
    newGrid[y] = Array(newWidth).fill(0);
  }

  // Calculate offsets to center the old grid within the new grid
  // When shrinking, negative offset means we start copying from a later index in the old grid
  // When expanding, positive offset means we start copying into a later index in the new grid
  const deltaWidth = newWidth - oldWidth;
  const deltaHeight = newHeight - oldHeight;

  // Calculate offsetX: Alternate floor/ceil for odd delta based on oldWidth parity
  let offsetX;
  if (deltaWidth % 2 !== 0 && oldWidth % 2 === 0) { // Odd change, even original width
      offsetX = Math.ceil(deltaWidth / 2);
  } else { // Even change OR (odd change and odd original width)
      offsetX = Math.floor(deltaWidth / 2);
  }

  // Calculate offsetY: Alternate floor/ceil for odd delta based on oldHeight parity
  let offsetY;
  if (deltaHeight % 2 !== 0 && oldHeight % 2 === 0) { // Odd change, even original height
      offsetY = Math.ceil(deltaHeight / 2);
  } else { // Even change OR (odd change and odd original height)
      offsetY = Math.floor(deltaHeight / 2);
  }

  // Determine the copy boundaries
  const copyStartX = Math.max(0, -offsetX); // Start X in old grid
  const copyStartY = Math.max(0, -offsetY); // Start Y in old grid
  const copyEndX = Math.min(oldWidth, newWidth - offsetX); // End X in old grid (exclusive)
  const copyEndY = Math.min(oldHeight, newHeight - offsetY); // End Y in old grid (exclusive)

  const pasteStartX = Math.max(0, offsetX); // Start X in new grid
  const pasteStartY = Math.max(0, offsetY); // Start Y in new grid

  // Copy the relevant part of the old grid to the new grid
  for (let oldY = copyStartY; oldY < copyEndY; oldY++) {
    for (let oldX = copyStartX; oldX < copyEndX; oldX++) {
        const newX = oldX + offsetX;
        const newY = oldY + offsetY;
        // Ensure we are within the bounds of the new grid (should be guaranteed by copyEnd calculations)
        if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
            if (oldGrid[oldY] && oldGrid[oldY][oldX] !== undefined) {
                newGrid[newY][newX] = oldGrid[oldY][oldX];
            }
        }
    }
  }


  // Update global state
  grid = newGrid;
  gridWidth = newWidth;
  gridHeight = newHeight;
  // Do NOT reset generationCount, allow simulation state to persist through resize
  console.log(`Resized grid to ${gridWidth}x${gridHeight}.`);
}

/**
 * Renders the current grid state to the DOM.
 * Clears the existing grid and creates new cell elements.
 * Sets CSS variables for grid dimensions.
 * @param {Array<Array<number>>} [prevGrid=null] - The grid state from the previous generation.
 *                                                 Used to highlight newly alive cells.
 */
function renderGrid(prevGrid = null) {
  // Clear previous grid content
  gridContainer.innerHTML = "";

  // Grid dimensions (columns/rows) are now set in updateGridAppearance()
  // Optional: Adjust container size explicitly if fit-content isn't perfect
  // gridContainer.style.width = `${gridWidth * cellSize}px`; // Note: cellSize would need to be passed or accessed globally
  // gridContainer.style.height = `${gridHeight * cellSize}px`;

  // Create and append cell elements
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      // Check if grid[y] and grid[y][x] exist before accessing
      const currentState = grid[y]?.[x]; // Use optional chaining
      const previousState = prevGrid?.[y]?.[x]; // Safely access previous state

      // Handle potential undefined currentState if grid structure is unexpected
      if (currentState === 1) {
        cell.classList.add("live");
        // Check if it was dead in the previous step
        if (prevGrid && previousState === 0) {
          cell.classList.add("newly-alive");
        }
      } else {
        // Default to dead if currentState is 0 or undefined
        cell.classList.add("dead");
      }

      // Store coordinates for potential click events
      cell.dataset.x = x;
      cell.dataset.y = y;
      gridContainer.appendChild(cell);
    }
  }
  // console.log(`Rendered ${gridWidth}x${gridHeight} grid.`); // Optional logging

  // Calculate and display alive percentage
  let aliveCount = 0;
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      // Check if grid[y] and grid[y][x] exist before accessing
      if (grid[y]?.[x] === 1) { // Use optional chaining
        aliveCount++;
      }
    }
  }
  const totalCells = gridWidth * gridHeight;
  const percentage = totalCells > 0 ? ((aliveCount / totalCells) * 100).toFixed(1) : 0.0;
  if (alivePercentageDisplay) {
    alivePercentageDisplay.textContent = percentage;
  }

  // Update grid appearance based on container size and grid dimensions
  updateGridAppearance();
}

/**
 * Calculates and applies the optimal cell size based on available container space.
 * Updates grid container styles and individual cell dimensions.
 */
function updateGridAppearance() {
  if (!gridContainer || !mainContainer || gridWidth <= 0 || gridHeight <= 0) {
    console.warn("Cannot update grid appearance: Missing elements or invalid grid dimensions.");
    return;
  }

  // Get container dimensions and padding
  const containerStyle = window.getComputedStyle(mainContainer);
  const containerPaddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
  const containerPaddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);

  // Get available space within the container (excluding padding)
  // Use clientWidth/clientHeight which includes padding, then subtract it
  const availableWidth = mainContainer.clientWidth - containerPaddingX;

  // Calculate available height more accurately by subtracting heights of sibling elements
  let nonGridElementsHeight = 0;
  [titleElement, controlsElement, infoElement].forEach(el => {
    if (el) {
      const style = window.getComputedStyle(el);
      nonGridElementsHeight += el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }
  });

  // Also consider the grid container's own margins if any (though it's set to auto horizontally)
  const gridStyle = window.getComputedStyle(gridContainer);
  nonGridElementsHeight += parseFloat(gridStyle.marginTop) + parseFloat(gridStyle.marginBottom);

  // Calculate available height based on viewport, subtracting body/container padding and non-grid elements
  const bodyStyle = window.getComputedStyle(bodyElement);
  const bodyPaddingY = parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom);
  const totalPaddingY = bodyPaddingY + containerPaddingY;

  const availableHeight = window.innerHeight - totalPaddingY - nonGridElementsHeight;


  // Calculate max cell size based on width and height constraints
  const maxCellWidth = Math.floor(availableWidth / gridWidth);
  const maxCellHeight = Math.floor(availableHeight / gridHeight);


  // Use the smaller dimension to ensure the grid fits
  let cellSize = Math.max(1, Math.min(maxCellWidth, maxCellHeight)); // Ensure at least 1px


  // Apply the calculated size
  gridContainer.style.gridTemplateColumns = `repeat(${gridWidth}, ${cellSize}px)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridHeight}, ${cellSize}px)`;

  // Update individual cell elements (important if they have fixed sizes in CSS)
  const cells = gridContainer.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });

  // Optional: Adjust container size explicitly if fit-content isn't perfect
  // gridContainer.style.width = `${gridWidth * cellSize}px`;
  // gridContainer.style.height = `${gridHeight * cellSize}px`;
}


/**
 * Handles the reset button click.
 * Pauses simulation, creates a new random grid, and renders it.
 */
function handleClear() {
  console.log("Handling clear.");
  pauseGame();
  // Clear the grid by setting all cells to dead (0)
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      // Check if grid[y] exists before accessing
      if (grid[y]) {
          grid[y][x] = 0;
      }
    }
  }
  // Re-render the grid to reflect the change (pass grid as prevGrid to avoid highlight)
  renderGrid(grid);
}

/**
 * Counts the number of live neighbors for a given cell.
 * Handles toroidal wrapping around the grid edges.
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 * @return {number} The count of live neighbors.
 */
function countNeighbors(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      // Skip the cell itself
      if (dx === 0 && dy === 0) {
        continue;
      }

      // Calculate neighbor coordinates with wrapping
      const nx = (x + dx + gridWidth) % gridWidth;
      const ny = (y + dy + gridHeight) % gridHeight;

      // Add neighbor's state to the count (live = 1, dead = 0)
      // Ensure grid[ny] and grid[ny][nx] exist (should always be true with wrapping, but safe check)
      if (grid[ny]?.[nx] === 1) { // Use optional chaining and check for 1
        count++;
      }
    }
  }
  return count;
}

/**
 * Computes the next state of the grid based on Conway's Game of Life rules.
 * @return {Array<Array<number>>} The grid representing the next generation.
 */
function computeNextGeneration() {
  const nextGrid = [];
  for (let y = 0; y < gridHeight; y++) {
    nextGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      const neighbors = countNeighbors(x, y);
      const currentState = grid[y]?.[x]; // Use optional chaining
      let nextState = currentState; // Assume state stays the same initially

      // Handle potential undefined currentState
      if (currentState === 1) {
        // Cell is alive
        if (neighbors < 2 || neighbors > 3) {
          nextState = 0; // Dies (underpopulation or overpopulation)
        }
        // else stays alive (neighbors === 2 || neighbors === 3)
      } else {
        // Cell is dead (or undefined, treat as dead)
        if (neighbors === 3) {
          nextState = 1; // Becomes alive (reproduction)
        } else {
          nextState = 0; // Stays dead
        }
      }
      nextGrid[y][x] = nextState;
    }
  }
  return nextGrid;
}

/**
 * Updates the global grid state with the next generation's grid.
 * Increments the generation counter.
 * @param {Array<Array<number>>} nextGrid - The computed next grid state.
 */
function updateGridState(nextGrid) {
  grid = nextGrid;
  generationCount++;
  if (generationCountDisplay) {
    generationCountDisplay.textContent = generationCount;
  }
  // console.log(`Advanced to generation ${generationCount}`); // Optional logging
}

/**
 * Executes a single step of the simulation:
 * 1. Computes the next generation.
 * 2. Updates the grid state.
 * 3. Renders the new grid, highlighting newly alive cells.
 */
function runStep() {
  // Create a deep copy of the current grid state for prevGrid comparison
  // This is important because updateGridState modifies the global 'grid'
  const prevGrid = grid.map(row => [...row]);
  const nextGrid = computeNextGeneration();
  updateGridState(nextGrid); // Updates global 'grid' to nextGrid
  // Pass the deep copied previous grid for correct highlighting
  renderGrid(prevGrid);
}

/**
 * Starts the simulation interval.
 * Updates the UI state (e.g., button text).
 */
function startGame() {
  if (isRunning) return; // Prevent multiple intervals

  isRunning = true;
  intervalId = setInterval(runStep, simulationSpeed);
  startPauseButton.textContent = "Pause"; // Update button text
  console.log(`Simulation started with speed ${simulationSpeed}ms.`);
}

/**
 * Pauses the simulation interval.
 * Updates the UI state (e.g., button text).
 */
function pauseGame() {
  if (!isRunning) return; // Already paused

  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
  startPauseButton.textContent = "Start"; // Update button text
  console.log("Simulation paused.");
}

/**
 * Handles changes to the grid size input.
 * Handles changes to the grid width or height inputs.
 * Validates inputs, resizes the grid preserving state, and renders it.
 * If the simulation is running, it pauses temporarily during the resize and resumes afterwards.
 */
function handleSizeChange() {
  const wasRunning = isRunning; // Store the current running state
  if (wasRunning) {
    pauseGame(); // Pause simulation temporarily if it was running
  }

  let newWidth = parseInt(gridWidthInput.value, 10);
  let newHeight = parseInt(gridHeightInput.value, 10);

  // Validation for Width
  const minWidth = parseInt(gridWidthInput.min, 10) || 4;
  const maxWidth = parseInt(gridWidthInput.max, 10) || 100;
  if (isNaN(newWidth) || newWidth < minWidth || newWidth > maxWidth) {
    console.warn(
      `Invalid width input: ${gridWidthInput.value}. Resetting to ${gridWidth}.`
    );
    gridWidthInput.value = gridWidth; // Reset input to current valid width
    return; // Stop processing if width is invalid
  }

  // Validation for Height
  const minHeight = parseInt(gridHeightInput.min, 10) || 4;
  const maxHeight = parseInt(gridHeightInput.max, 10) || 100;
  if (isNaN(newHeight) || newHeight < minHeight || newHeight > maxHeight) {
    console.warn(
      `Invalid height input: ${gridHeightInput.value}. Resetting to ${gridHeight}.`
    );
    gridHeightInput.value = gridHeight; // Reset input to current valid height
    return; // Stop processing if height is invalid
  }

  // Only resize if the dimensions actually changed
  if (newWidth !== gridWidth || newHeight !== gridHeight) {
      console.log(`Handling size change to ${newWidth}x${newHeight}`);
      // Resize grid state preserving content and update global width/height
      resizeGrid(newWidth, newHeight);
      // Render the new grid (pass grid as prevGrid to avoid initial highlight)
      renderGrid(grid); // Render the newly resized grid, which now calls updateGridAppearance
      // Explicitly call updateGridAppearance again in case renderGrid didn't run due to no dimension change,
      // or just to be sure the latest container size is considered.
      updateGridAppearance();
  } else {
      console.log("Size change detected, but dimensions are the same. No resize needed.");
      // Still might need to update appearance if window resized without grid dimension change
      updateGridAppearance();
  }

  // Resume simulation if it was running before the resize
  if (wasRunning) {
    startGame();
  }
}

/**
 * Handles changes to the simulation speed input.
 * Validates input and updates the simulation interval if running.
 */
function handleSpeedChange() {
  let newSpeed = parseInt(speedInput.value, 10);

  // Validation
  const minSpeed = parseInt(speedInput.min, 10) || 50;
  if (isNaN(newSpeed) || newSpeed < minSpeed) {
    console.warn(
      `Invalid speed input: ${speedInput.value}. Resetting to ${simulationSpeed}.`
    );
    speedInput.value = simulationSpeed; // Reset input to current valid speed
    return;
  }

  simulationSpeed = newSpeed;
  console.log(`Handling speed change to ${simulationSpeed}ms.`);

  // If simulation is running, restart the interval with the new speed
  if (isRunning) {
    pauseGame();
    startGame();
  }
}

/**
 * Handles the reset button click.
 * Pauses simulation, creates a new random grid, and renders it.
 */
function handleReset() {
  console.log("Handling reset.");
  pauseGame();
  // Re-create grid with current width and height (randomizes)
  createGrid(gridWidth, gridHeight);
  // Render the new grid (pass grid as prevGrid to avoid initial highlight)
  renderGrid(grid);
}

/**
 * Gets the cell coordinates (x, y) under a PointerEvent or TouchEvent relative to the grid container.
 * @param {MouseEvent|TouchEvent} event - The pointer or touch event.
 * @returns {{x: number, y: number}|null} The cell coordinates {x, y} or null if outside the grid.
 */
function getCellCoordsFromEvent(event) {
  const rect = gridContainer.getBoundingClientRect();
  let clientX, clientY;

  if (event.touches && event.touches.length > 0) {
    // Use the first touch point
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if (event.clientX !== undefined && event.clientY !== undefined) {
    // Use mouse coordinates
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return null; // Not a valid event type
  }

  const xPos = clientX - rect.left;
  const yPos = clientY - rect.top;

  // Calculate cell size (assuming square cells, get from computed style)
  // This assumes the grid has rendered and has computed styles.
  const gridStyle = window.getComputedStyle(gridContainer);
  // grid-template-columns might be like "repeat(42, 15px)" or "15px 15px ..."
  const columnStyle = gridStyle.gridTemplateColumns;
  const firstColumnSize = columnStyle.split(' ')[0];
  const cellSize = parseFloat(firstColumnSize); // Assumes square cells and first column size is representative

  if (isNaN(cellSize) || cellSize <= 0) {
      console.error("Could not determine cell size for painting.");
      return null; // Cannot calculate without cell size
  }

  const x = Math.floor(xPos / cellSize);
  const y = Math.floor(yPos / cellSize);

  // Check if the calculated coordinates are within the grid bounds
  if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
    return { x, y };
  } else {
    return null; // Click was outside the grid cells (e.g., on border/padding)
  }
}


/**
 * Handles the start of a painting action (mousedown or touchstart).
 * Toggles the initial cell and sets the painting state.
 * @param {MouseEvent|TouchEvent} event - The mousedown or touchstart event.
 */
function handlePointerDown(event) {
  // Removed isRunning check to allow painting while running

  // Prevent default scrolling/selection behavior, especially for touch
  if (event.type === 'touchstart') {
    event.preventDefault();
  }

  const coords = getCellCoordsFromEvent(event);
  if (!coords) return; // Click was not on a valid cell

  const { x, y } = coords;

  // Ensure coordinates are valid and grid cell exists (redundant check, but safe)
  if (!grid[y] || grid[y][x] === undefined) {
    console.error("Invalid cell coordinates on pointer down:", x, y);
    return;
  }

  // Toggle the state of the clicked cell
  grid[y][x] = grid[y][x] === 1 ? 0 : 1;
  console.log(`Pointer Down: Toggled cell (${x}, ${y}) to state ${grid[y][x]}`);

  // Start painting
  isPainting = true;
  paintingState = grid[y][x]; // Set painting state to the *new* state of the clicked cell

  // Re-render the grid immediately to show the toggle
  renderGrid(grid);
}

/**
 * Handles the continuation of a painting action (mousemove or touchmove).
 * Sets the state of cells under the pointer to the current painting state.
 * @param {MouseEvent|TouchEvent} event - The mousemove or touchmove event.
 */
function handlePointerMove(event) {
  if (!isPainting) return; // Only paint if actively painting (removed isRunning check)

  // Prevent default scrolling/selection behavior
   if (event.type === 'touchmove') {
    event.preventDefault();
  }

  const coords = getCellCoordsFromEvent(event);
   if (!coords) return; // Pointer is outside the grid

  const { x, y } = coords;

  // Ensure coordinates are valid and grid cell exists
  if (!grid[y] || grid[y][x] === undefined) {
    // This can happen if moving quickly outside grid bounds
    return;
  }

  // Check if the cell's current state is different from the painting state
  if (grid[y][x] !== paintingState) {
    grid[y][x] = paintingState; // Set the cell to the painting state
    console.log(`Pointer Move: Set cell (${x}, ${y}) to state ${paintingState}`);

    // Re-render the grid to show the change
    // Optimization: Could potentially debounce or throttle rendering here for performance
    // on very large grids or fast movements, but for now, direct render is simpler.
    renderGrid(grid);
  }
}

/**
 * Handles the end of a painting action (mouseup or touchend).
 * Stops the painting state.
 * @param {MouseEvent|TouchEvent} event - The mouseup or touchend event.
 */
function handlePointerUp(event) {
  if (isPainting) {
    console.log("Pointer Up: Painting stopped.");
    isPainting = false;
    // No re-render needed here, as the last move event would have triggered it.
  }
}

// --- TRON Background Animation ---

const backgroundCanvas = document.getElementById("backgroundCanvas");
const bgCtx = backgroundCanvas.getContext("2d");

let bgWidth, bgHeight;
const lightCycles = [];
const numCycles = 4;
const cycleColors = ["#ff9900", "#ff0000", "#00ff00", "#cccccc"]; // Orange, Red, Green, Grey
const cycleSpeed = 2;
const trailLength = 50; // Number of segments in the trail
const mouseRepulsionRadius = 100; // Pixels within which cycles react to mouse
const mouseRepulsionStrength = 0.5; // How strongly they react

let mouseX = -1000; // Initialize mouse position off-screen
let mouseY = -1000;

function resizeBackgroundCanvas() {
  bgWidth = backgroundCanvas.width = window.innerWidth;
  bgHeight = backgroundCanvas.height = window.innerHeight;
}

class LightCycle {
  constructor(x, y, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = color;
    this.trail = []; // Stores {x, y} points
  }

  move() {
    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > trailLength) {
      this.trail.shift(); // Remove oldest segment
    }

    // Update position
    this.x += this.dx * cycleSpeed;
    this.y += this.dy * cycleSpeed;

    // Randomly change direction occasionally (less frequent)
    if (Math.random() < 0.01) {
      this.changeDirection();
    }

    // Wrap around screen edges
    if (this.x < 0) this.x = bgWidth;
    if (this.x > bgWidth) this.x = 0;
    if (this.y < 0) this.y = bgHeight;
    if (this.y > bgHeight) this.y = 0;
  }

  changeDirection() {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    // Avoid immediate reversal
    let newDir;
    do {
      newDir = directions[Math.floor(Math.random() * directions.length)];
    } while (newDir.dx === -this.dx && newDir.dy === -this.dy);

    this.dx = newDir.dx;
    this.dy = newDir.dy;
  }

  draw() {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const segment = this.trail[i];
      const alpha = (i / this.trail.length) * 0.6; // Fade out
      bgCtx.fillStyle = `${this.color}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`; // Append alpha hex
      bgCtx.fillRect(segment.x - 1, segment.y - 1, 3, 3); // Small squares for trail
    }

    // Draw head (slightly brighter)
    bgCtx.fillStyle = this.color;
    bgCtx.shadowColor = this.color;
    bgCtx.shadowBlur = 10;
    bgCtx.fillRect(this.x - 2, this.y - 2, 5, 5);
    bgCtx.shadowBlur = 0; // Reset shadow
  }
}

function initializeBackground() {
  resizeBackgroundCanvas();
  window.addEventListener("resize", resizeBackgroundCanvas);

  // Create initial light cycles
  for (let i = 0; i < numCycles; i++) {
    const x = Math.random() * bgWidth;
    const y = Math.random() * bgHeight;
    const angle = Math.random() * Math.PI * 2;
    const dx = Math.cos(angle); // Initial direction
    const dy = Math.sin(angle);
    // Ensure initial direction is axis-aligned for simplicity
    let initialDx, initialDy;
    if (Math.abs(dx) > Math.abs(dy)) {
        initialDx = dx > 0 ? 1 : -1;
        initialDy = 0;
    } else {
        initialDx = 0;
        initialDy = dy > 0 ? 1 : -1;
    }

    lightCycles.push(
      new LightCycle(x, y, initialDx, initialDy, cycleColors[i % cycleColors.length])
    );
  }

  animateBackground(); // Start the animation loop
}

function animateBackground() {
  // Clear canvas with a slight fade effect
  bgCtx.fillStyle = "rgba(5, 8, 16, 0.1)"; // --tron-bg with low alpha
  bgCtx.fillRect(0, 0, bgWidth, bgHeight);

  // Move and draw each cycle
  lightCycles.forEach((cycle) => {
    cycle.move();
    cycle.draw();
  });

  requestAnimationFrame(animateBackground); // Loop the animation
}

// Initialize background animation after main game setup
document.addEventListener("DOMContentLoaded", initializeBackground);
