"use strict";

/**
 * Counts the number of live neighbors for a given cell using the provided grid data.
 * Handles toroidal wrapping around the grid edges.
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 * @param {number} width - The grid width.
 * @param {number} height - The grid height.
 * @param {Array<Array<{age: number}>>} grid - The grid data.
 * @returns {number} The count of live neighbors.
 */
function countNeighbors(x, y, width, height, grid) {
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

      // Get neighbor state from grid
      const neighborState = grid[ny]?.[nx];

      // Add to count if the neighbor exists and is alive (age > 0)
      if (neighborState?.age > 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Computes the next state of the grid based on Conway's Game of Life rules
 * and calculates statistics about the transition (born, died, oldest cell).
 * @param {Array<Array<{age: number}>>} currentGrid - The current grid state.
 * @param {number} width - The grid width.
 * @param {number} height - The grid height.
 * @returns {{nextGrid: Array<Array<{age: number}>>, stats: {born: number, died: number, oldest: number}}}
 *          An object containing the grid for the next generation and statistics.
 */
function computeNextGeneration(currentGrid, width, height) {
  const nextGrid = [];
  let cellsBorn = 0;
  let cellsDied = 0;
  let currentOldestAge = 0;

  for (let y = 0; y < height; y++) {
    nextGrid[y] = [];
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(x, y, width, height, currentGrid);
      const currentCellState = currentGrid[y]?.[x];
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

      // Calculate the next age and update stats
      if (nextIsAlive) {
        if (currentIsAlive) {
          nextAge = currentAge + 1; // Survived: Increment age
        } else {
          nextAge = 1; // Born: Set age to 1
          cellsBorn++;
        }
        // Update oldest age for this generation
        if (nextAge > currentOldestAge) {
          currentOldestAge = nextAge;
        }
      } else {
        nextAge = 0; // Died or stayed dead: Reset age
        if (currentIsAlive) {
          cellsDied++; // Died
        }
      }

      // Store the new state object in the next grid
      nextGrid[y][x] = { age: nextAge };
    }
  }

  const stats = {
    born: cellsBorn,
    died: cellsDied,
    oldest: currentOldestAge
  };

  return { nextGrid, stats };
}

// Respond to message from parent thread
self.onmessage = function(e) {
  const { grid, width, height } = e.data;
  const result = computeNextGeneration(grid, width, height);
  self.postMessage(result);
}