"use strict";

import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from './config.js';

// Module-level state
let grid = [];
let width = DEFAULT_WIDTH;
let height = DEFAULT_HEIGHT;
let generationCount = 0;

/**
 * Creates the initial grid state with a random pattern.
 * @param {number} w - The width of the grid.
 * @param {number} h - The height of the grid.
 */
function createGrid(w, h) {
  grid = []; // Reset the grid
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      // Initialize with state object using only age
      const isAliveRandom = Math.random() > 0.7; // Approx 30% live cells
      grid[y][x] = { age: isAliveRandom ? 1 : 0 }; // Age 1 if alive, 0 if dead
    }
  }
  width = w;
  height = h;
  generationCount = 0; // Reset generation count when grid is created
  console.log(`Grid state created: ${width}x${height}`);
}

/**
 * Initializes the grid state. Called once at the start.
 * @param {number} initialWidth - Initial width.
 * @param {number} initialHeight - Initial height.
 */
export function initializeGrid(initialWidth = DEFAULT_WIDTH, initialHeight = DEFAULT_HEIGHT) {
  createGrid(initialWidth, initialHeight);
}

/**
 * Resizes the grid while preserving the existing cell states centered.
 * Fills new areas with dead cells.
 * @param {number} newWidth - The new width of the grid.
 * @param {number} newHeight - The new height of the grid.
 */
export function resizeGrid(newWidth, newHeight) {
  if (newWidth === width && newHeight === height) {
    return; // No change needed
  }
  console.log(`Resizing grid state from ${width}x${height} to ${newWidth}x${newHeight}`);
  const oldGrid = grid;
  const oldWidth = width;
  const oldHeight = height;

  // Create the new grid, initialized with dead cells
  const newGrid = [];
  for (let y = 0; y < newHeight; y++) {
    newGrid[y] = Array(newWidth).fill(null).map(() => ({ age: 0 })); // Ensure new objects
  }

  // Calculate offsets to center the old grid
  const deltaWidth = newWidth - oldWidth;
  const deltaHeight = newHeight - oldHeight;

  let offsetX;
  if (deltaWidth % 2 !== 0 && oldWidth % 2 === 0) {
      offsetX = Math.ceil(deltaWidth / 2);
  } else {
      offsetX = Math.floor(deltaWidth / 2);
  }

  let offsetY;
  if (deltaHeight % 2 !== 0 && oldHeight % 2 === 0) {
      offsetY = Math.ceil(deltaHeight / 2);
  } else {
      offsetY = Math.floor(deltaHeight / 2);
  }

  // Determine copy boundaries
  const copyStartX = Math.max(0, -offsetX);
  const copyStartY = Math.max(0, -offsetY);
  const copyEndX = Math.min(oldWidth, newWidth - offsetX);
  const copyEndY = Math.min(oldHeight, newHeight - offsetY);

  // Copy the relevant part
  for (let oldY = copyStartY; oldY < copyEndY; oldY++) {
    for (let oldX = copyStartX; oldX < copyEndX; oldX++) {
        const newX = oldX + offsetX;
        const newY = oldY + offsetY;
        if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
            if (oldGrid[oldY]?.[oldX] !== undefined) {
                newGrid[newY][newX] = oldGrid[oldY][oldX];
            }
        }
    }
  }

  // Update state
  grid = newGrid;
  width = newWidth;
  height = newHeight;
  // Do NOT reset generationCount
  console.log(`Resized grid state to ${width}x${height}.`);
}

/**
 * Clears the grid by setting all cells to dead.
 */
export function clearGrid() {
  console.log("Clearing grid state.");
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y]?.[x]) {
          grid[y][x] = { age: 0 };
      }
    }
  }
  // generationCount is not reset on clear
}

/**
 * Resets the grid to a new random state with current dimensions.
 */
export function resetGrid() {
    console.log("Resetting grid state.");
    createGrid(width, height); // Re-create with current dimensions
}


/**
 * Updates the grid state with the next generation's grid.
 * Increments the generation counter.
 * @param {Array<Array<{age: number}>>} nextGrid - The computed next grid state.
 */
export function updateGrid(nextGrid) {
  grid = nextGrid;
  generationCount++;
}

/**
 * Gets the state of a specific cell.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {{age: number} | undefined} The cell state object or undefined if out of bounds.
 */
export function getCellState(x, y) {
  return grid[y]?.[x];
}

/**
 * Sets the state (age) of a specific cell.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} age - The new age for the cell (0 for dead, >0 for alive).
 */
export function setCellState(x, y, age) {
  if (grid[y]?.[x] !== undefined) {
    grid[y][x] = { age: age };
  } else {
    console.warn(`Attempted to set state for invalid cell coordinates: (${x}, ${y})`);
  }
}

/**
 * Gets the current grid width.
 * @returns {number}
 */
export function getWidth() {
  return width;
}

/**
 * Gets the current grid height.
 * @returns {number}
 */
export function getHeight() {
  return height;
}

/**
 * Gets the current generation count.
 * @returns {number}
 */
export function getGenerationCount() {
  return generationCount;
}

/**
 * Gets the entire grid data structure.
 * NOTE: Returns a direct reference for performance. Avoid direct modification outside this module.
 * @returns {Array<Array<{age: number}>>}
 */
export function getGrid() {
    return grid;
}

/**
 * Calculates statistics about the current grid state.
 * @returns {{aliveCount: number, totalCells: number, percentage: string}}
 */
export function getAliveStats() {
  let aliveCount = 0;
  const totalCells = width * height;
  if (totalCells > 0) {
      for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
              if (grid[y]?.[x]?.age > 0) {
                  aliveCount++;
              }
          }
      }
  }
  const percentage = totalCells > 0 ? ((aliveCount / totalCells) * 100).toFixed(1) : "0.0";
  return { aliveCount, totalCells, percentage };
}