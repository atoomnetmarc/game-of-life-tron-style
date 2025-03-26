"use strict";

// Constants
const DEFAULT_WIDTH = 42;
const DEFAULT_HEIGHT = 32;
const DEFAULT_SPEED = 500; // milliseconds
const CELL_SIZE_PX = 15; // Pixel size for each cell in the grid display

// DOM Elements
const gridContainer = document.getElementById("grid-container");
const gridWidthInput = document.getElementById("gridWidthInput");
const gridHeightInput = document.getElementById("gridHeightInput");
const speedInput = document.getElementById("speedInput");
const startPauseButton = document.getElementById("startPauseButton");
const stepButton = document.getElementById("stepButton");
const resetButton = document.getElementById("resetButton");
const generationCountDisplay = document.getElementById("generationCount");
const alivePercentageDisplay = document.getElementById("alivePercentage"); // Added for alive percentage

// State Variables
let gridWidth = DEFAULT_WIDTH;
let gridHeight = DEFAULT_HEIGHT;
let grid = []; // 2D array representing the cell states (0 = dead, 1 = live)
let isRunning = false;
let simulationSpeed = DEFAULT_SPEED;
let intervalId = null; // To store the ID from setInterval
let generationCount = 0;

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

  // Use event delegation for cell clicks
  gridContainer.addEventListener("click", handleCellClick);

  console.log("Event listeners attached.");
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
 * Renders the current grid state to the DOM.
 * Clears the existing grid and creates new cell elements.
 * Sets CSS variables for grid dimensions.
 * @param {Array<Array<number>>} [prevGrid=null] - The grid state from the previous generation.
 *                                                 Used to highlight newly alive cells.
 */
function renderGrid(prevGrid = null) {
  // Clear previous grid content
  gridContainer.innerHTML = "";

  // Set grid dimensions using CSS Grid
  gridContainer.style.gridTemplateColumns = `repeat(${gridWidth}, ${CELL_SIZE_PX}px)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridHeight}, ${CELL_SIZE_PX}px)`;
  // Optional: Adjust container size explicitly if fit-content isn't perfect
  // gridContainer.style.width = `${gridWidth * CELL_SIZE_PX}px`;
  // gridContainer.style.height = `${gridHeight * CELL_SIZE_PX}px`;

  // Create and append cell elements
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      const currentState = grid[y][x];
      const previousState = prevGrid?.[y]?.[x]; // Safely access previous state

      if (currentState === 1) {
        cell.classList.add("live");
        // Check if it was dead in the previous step
        if (prevGrid && previousState === 0) {
          cell.classList.add("newly-alive");
        }
      } else {
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
      if (grid[y][x] === 1) {
        aliveCount++;
      }
    }
  }
  const totalCells = gridWidth * gridHeight;
  const percentage = totalCells > 0 ? ((aliveCount / totalCells) * 100).toFixed(1) : 0.0;
  if (alivePercentageDisplay) {
    alivePercentageDisplay.textContent = percentage;
  }
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
      grid[y][x] = 0;
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
      // Ensure grid[ny] and grid[ny][nx] exist (should always be true with wrapping)
      if (grid[ny] && grid[ny][nx] !== undefined) {
        count += grid[ny][nx];
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
      const currentState = grid[y][x];
      let nextState = currentState; // Assume state stays the same initially

      if (currentState === 1) {
        // Cell is alive
        if (neighbors < 2 || neighbors > 3) {
          nextState = 0; // Dies (underpopulation or overpopulation)
        }
        // else stays alive (neighbors === 2 || neighbors === 3)
      } else {
        // Cell is dead
        if (neighbors === 3) {
          nextState = 1; // Becomes alive (reproduction)
        }
        // else stays dead
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
  const prevGrid = grid; // Store the current grid state
  const nextGrid = computeNextGeneration();
  updateGridState(nextGrid); // Updates global 'grid' to nextGrid
  // Pass both the new grid (which is now the global 'grid') and the previous grid
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
 * Pauses simulation, validates inputs, creates a new grid, and renders it.
 */
function handleSizeChange() {
  pauseGame(); // Pause simulation during resize

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

  console.log(`Handling size change to ${newWidth}x${newHeight}`);
  // Create new grid state and update global width/height
  createGrid(newWidth, newHeight);
  // Render the new grid (pass grid as prevGrid to avoid initial highlight)
  renderGrid(grid);
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
 * Handles clicks on individual cells within the grid container.
 * Toggles the state of the clicked cell (live/dead) if the simulation is paused.
 * @param {Event} event - The click event object.
 */
function handleCellClick(event) {
  // Only allow clicks if simulation is paused and the click is on a cell
  if (isRunning || !event.target.classList.contains("cell")) {
    return;
  }

  const cellElement = event.target;
  const x = parseInt(cellElement.dataset.x, 10);
  const y = parseInt(cellElement.dataset.y, 10);

  // Ensure coordinates are valid
  if (isNaN(x) || isNaN(y) || !grid[y] || grid[y][x] === undefined) {
    console.error("Invalid cell coordinates clicked:", x, y);
    return;
  }

  // Toggle the state in the grid array
  grid[y][x] = grid[y][x] === 1 ? 0 : 1;
  console.log(`Toggled cell (${x}, ${y}) to state ${grid[y][x]}`);

  // Re-render the grid to reflect the change (pass grid as prevGrid to avoid highlight)
  renderGrid(grid);
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
