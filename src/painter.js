"use strict";

import * as gridState from './gridState.js';
import * as renderer from './renderer.js';

// DOM Element Reference
const gridContainer = document.getElementById("grid-container");

// Module-level state
let isPainting = false; // Track if the user is currently painting cells
let paintingState = false; // State being painted (true for alive, false for dead)

/**
 * Gets the cell coordinates (x, y) under a PointerEvent or TouchEvent relative to the grid container.
 * @param {MouseEvent|TouchEvent} event - The pointer or touch event.
 * @returns {{x: number, y: number}|null} The cell coordinates {x, y} or null if outside the grid or cell size cannot be determined.
 */
function getCellCoordsFromEvent(event) {
  if (!gridContainer) return null;

  const rect = gridContainer.getBoundingClientRect();
  let clientX, clientY;

  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if (event.clientX !== undefined && event.clientY !== undefined) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return null; // Invalid event type
  }

  const xPos = clientX - rect.left;
  const yPos = clientY - rect.top;

  // Calculate cell size from computed style
  const gridStyle = window.getComputedStyle(gridContainer);
  const columnStyle = gridStyle.gridTemplateColumns;
  const firstColumnSize = columnStyle.split(' ')[0];
  const cellSize = parseFloat(firstColumnSize);

  if (isNaN(cellSize) || cellSize <= 0) {
    console.error("Could not determine cell size for painting.");
    return null;
  }

  const x = Math.floor(xPos / cellSize);
  const y = Math.floor(yPos / cellSize);

  // Check bounds
  const width = gridState.getWidth();
  const height = gridState.getHeight();
  if (x >= 0 && x < width && y >= 0 && y < height) {
    return { x, y };
  } else {
    return null; // Outside grid cells
  }
}

/**
 * Handles the start of a painting action (mousedown or touchstart).
 * Toggles the initial cell and sets the painting state.
 * @param {MouseEvent|TouchEvent} event - The mousedown or touchstart event.
 */
function handlePointerDown(event) {
  // Prevent default scrolling/selection behavior, especially for touch
  if (event.type === 'touchstart') {
    event.preventDefault();
  }

  const coords = getCellCoordsFromEvent(event);
  if (!coords) return; // Click was not on a valid cell

  const { x, y } = coords;
  const currentCellState = gridState.getCellState(x, y);

  if (!currentCellState) {
      console.error("Invalid cell state on pointer down:", x, y);
      return;
  }

  const currentIsAlive = currentCellState.age > 0;
  const newAge = currentIsAlive ? 0 : 1; // Toggle age
  const newIsAliveState = newAge > 0; // The boolean state corresponding to the new age

  // Update the cell state via gridState module
  gridState.setCellState(x, y, newAge);
  console.log(`Painter Down: Toggled cell (${x}, ${y}) to age: ${newAge}`);

  // Start painting
  isPainting = true;
  paintingState = newIsAliveState; // Set painting state (boolean)

  // Re-render the grid immediately to show the toggle
  renderer.renderGrid();
}

/**
 * Handles the continuation of a painting action (mousemove or touchmove).
 * Sets the state of cells under the pointer to the current painting state.
 * @param {MouseEvent|TouchEvent} event - The mousemove or touchmove event.
 */
function handlePointerMove(event) {
  if (!isPainting) return;

  // Prevent default scrolling/selection behavior
   if (event.type === 'touchmove') {
    event.preventDefault();
  }

  const coords = getCellCoordsFromEvent(event);
   if (!coords) return; // Pointer is outside the grid

  const { x, y } = coords;
  const currentCellState = gridState.getCellState(x, y);

  if (!currentCellState) {
      // Can happen if moving quickly outside grid bounds
      return;
  }

  const currentIsAlive = currentCellState.age > 0;

  // Only update and re-render if the cell's state is different from the painting state
  if (currentIsAlive !== paintingState) {
    const newAge = paintingState ? 1 : 0; // Age based on boolean painting state
    gridState.setCellState(x, y, newAge);
    console.log(`Painter Move: Set cell (${x}, ${y}) to age: ${newAge}`);

    // Re-render the grid to show the change
    // Optimization: Could potentially debounce/throttle rendering here
    renderer.renderGrid();
  }
}

/**
 * Handles the end of a painting action (mouseup or touchend).
 * Stops the painting state.
 * @param {MouseEvent|TouchEvent} event - The mouseup or touchend event.
 */
function handlePointerUp(event) {
  if (isPainting) {
    console.log("Painter Up: Painting stopped.");
    isPainting = false;
    // No re-render needed here, last move event handled it.
  }
}

/**
 * Sets up event listeners for painting on the grid container.
 */
export function setupPaintingListeners() {
    if (!gridContainer) {
        console.error("Grid container not found. Cannot attach painting listeners.");
        return;
    }
    console.log("Setting up painting listeners...");

    gridContainer.addEventListener("mousedown", handlePointerDown);
    gridContainer.addEventListener("mousemove", handlePointerMove);
    // Listen on window to catch pointer up outside the grid
    window.addEventListener("mouseup", handlePointerUp);

    // Touch events
    gridContainer.addEventListener("touchstart", handlePointerDown, { passive: false });
    gridContainer.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    console.log("Painting listeners attached.");
}