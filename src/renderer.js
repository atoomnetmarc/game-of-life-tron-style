"use strict";

import * as gridState from './gridState.js';

// DOM Element References (Consider passing these in during initialization for better decoupling)
const gridContainer = document.getElementById("grid-container");
const mainContainer = document.querySelector(".container");
const titleElement = document.querySelector(".container h1");
const controlsElement = document.querySelector(".controls");
const infoElement = document.querySelector(".info");
const bodyElement = document.body;

/**
 * Calculates and applies the optimal cell size based on available container space.
 * Updates grid container styles and individual cell dimensions.
 */
export function updateGridAppearance() {
  const width = gridState.getWidth();
  const height = gridState.getHeight();

  if (!gridContainer || !mainContainer || width <= 0 || height <= 0) {
    console.warn("Cannot update grid appearance: Missing elements or invalid grid dimensions.");
    return;
  }

  // Get container dimensions and padding
  const containerStyle = window.getComputedStyle(mainContainer);
  const containerPaddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
  const containerPaddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);

  // Get available space within the container
  const availableWidth = mainContainer.clientWidth - containerPaddingX;

  // Calculate available height by subtracting heights of other elements
  let nonGridElementsHeight = 0;
  [titleElement, controlsElement, infoElement].forEach(el => {
    if (el) {
      const style = window.getComputedStyle(el);
      nonGridElementsHeight += el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }
  });

  const gridStyle = window.getComputedStyle(gridContainer);
  nonGridElementsHeight += parseFloat(gridStyle.marginTop) + parseFloat(gridStyle.marginBottom);

  const bodyStyle = window.getComputedStyle(bodyElement);
  const bodyPaddingY = parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom);
  const totalPaddingY = bodyPaddingY + containerPaddingY;

  const availableHeight = window.innerHeight - totalPaddingY - nonGridElementsHeight;

  // Calculate max cell size
  const maxCellWidth = Math.floor(availableWidth / width);
  const maxCellHeight = Math.floor(availableHeight / height);

  // Use the smaller dimension
  let cellSize = Math.max(1, Math.min(maxCellWidth, maxCellHeight)); // Ensure at least 1px

  // Apply the calculated size to the grid container
  gridContainer.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;
  gridContainer.style.gridTemplateRows = `repeat(${height}, ${cellSize}px)`;

  // Update individual cell elements (if they exist)
  const cells = gridContainer.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });

  // Optional: Adjust container size explicitly if fit-content isn't perfect
  // gridContainer.style.width = `${width * cellSize}px`;
  // gridContainer.style.height = `${height * cellSize}px`;
}


/**
 * Renders the current grid state from gridState.js to the DOM.
 * Clears the existing grid and creates new cell elements.
 */
export function renderGrid() {
  if (!gridContainer) {
      console.error("Grid container not found for rendering.");
      return;
  }

  const grid = gridState.getGrid();
  const width = gridState.getWidth();
  const height = gridState.getHeight();

  // Clear previous grid content
  gridContainer.innerHTML = "";

  // Create and append cell elements
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      const currentCellState = grid[y]?.[x];

      if (!currentCellState) {
          console.warn(`Undefined cell state at (${x}, ${y}) during render`);
          cell.classList.add("dead");
      } else {
          // Add 'live' or 'dead' class based on age
          if (currentCellState.age > 0) {
              cell.classList.add("live");
          } else {
              cell.classList.add("dead");
          }
          // Add 'newly-alive' class if age is 1
          if (currentCellState.age === 1) {
              cell.classList.add("newly-alive");
          }
      }

      // Store coordinates for event handling (e.g., painting)
      cell.dataset.x = x;
      cell.dataset.y = y;
      gridContainer.appendChild(cell);
    }
  }
  // console.log(`Rendered ${width}x${height} grid.`); // Optional logging

  // Update grid appearance (cell size, etc.) based on the new structure
  updateGridAppearance();
}