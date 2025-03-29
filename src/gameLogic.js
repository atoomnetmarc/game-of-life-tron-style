"use strict";

import * as gridState from './gridState.js';

/**
 * Counts the number of live neighbors for a given cell using the current grid state.
 * Handles toroidal wrapping around the grid edges.
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 * @param {number} width - The current grid width.
 * @param {number} height - The current grid height.
 * @returns {number} The count of live neighbors.
 */
function countNeighbors(x, y, width, height) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      // Skip the cell itself
      if (dx === 0 && dy === 0) {
        continue;
      }

      // Calculate neighbor coordinates with wrapping
      const nx = (x + dx + width) % width;
      const ny = (y + dy + height) % height;

      // Get neighbor state from gridState module
      const neighborState = gridState.getCellState(nx, ny);

      // Add to count if the neighbor exists and is alive (age > 0)
      if (neighborState?.age > 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Computes the next state of the grid based on Conway's Game of Life rules.
 * Reads the current state from gridState.js.
 * @returns {Array<Array<{age: number}>>} The grid representing the next generation.
 */
export function computeNextGeneration() {
  const currentWidth = gridState.getWidth();
  const currentHeight = gridState.getHeight();
  const nextGrid = [];

  for (let y = 0; y < currentHeight; y++) {
    nextGrid[y] = [];
    for (let x = 0; x < currentWidth; x++) {
      const neighbors = countNeighbors(x, y, currentWidth, currentHeight);
      const currentCellState = gridState.getCellState(x, y);
      const currentAge = currentCellState?.age || 0;
      const currentIsAlive = currentAge > 0;

      let nextIsAlive = currentIsAlive;
      let nextAge = currentAge;

      // Apply Game of Life rules
      if (currentIsAlive) {
        // Cell is alive
        if (neighbors < 2 || neighbors > 3) {
          nextIsAlive = false; // Dies
        }
        // else stays alive
      } else {
        // Cell is dead
        if (neighbors === 3) {
          nextIsAlive = true; // Becomes alive
        }
        // else stays dead
      }

      // Calculate the next age
      if (nextIsAlive) {
        nextAge = currentIsAlive ? currentAge + 1 : 1; // Increment existing age or set to 1 if newly alive
      } else {
        nextAge = 0; // Reset age if dead
      }

      // Store the new state object in the next grid
      nextGrid[y][x] = { age: nextAge };
    }
  }
  return nextGrid;
}