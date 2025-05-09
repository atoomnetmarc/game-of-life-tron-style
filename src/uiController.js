"use strict";

import * as gridState from './gridState.js';
import * as renderer from './renderer.js';
import * as simulationController from './simulationController.js';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_SPEED } from './config.js';

// DOM Elements
const gridWidthInput = document.getElementById("gridWidthInput");
const gridHeightInput = document.getElementById("gridHeightInput");
const speedInput = document.getElementById("speedInput");
const startPauseButton = document.getElementById("startPauseButton");
const stepButton = document.getElementById("stepButton");
const resetButton = document.getElementById("resetButton");
const clearButton = document.getElementById("clearButton");
const generationCountDisplay = document.getElementById("generationCount");
const alivePercentageDisplay = document.getElementById("alivePercentage");
const bornDisplay = document.getElementById("stats-born");
const diedDisplay = document.getElementById("stats-died");
const oldestCurrentDisplay = document.getElementById("stats-oldest-current");
const oldestHistoricDisplay = document.getElementById("stats-oldest-historic");

/**
 * Updates the UI elements that display information based on the provided stats object.
 * @param {{born: number, died: number, totalBorn: number, totalDied: number, oldestCurrent: number, oldestHistoric: number, generation: number, alivePercent: string}} stats - The statistics object from the simulation controller.
 */
function updateInfoDisplays(stats) {
    if (!stats) {
        console.warn("updateInfoDisplays called without stats object.");
        // Attempt to fetch current basic stats as a fallback for initialization
        stats = {
            born: 0,
            died: 0,
            totalBorn: 0, // Assume 0 if no stats provided
            totalDied: 0, // Assume 0 if no stats provided
            oldestCurrent: 0,
            oldestHistoric: 0, // Cannot get this without simulation controller state
            generation: gridState.getGenerationCount(),
            alivePercent: gridState.getAliveStats().percentage
        };
    }

    if (generationCountDisplay) {
        generationCountDisplay.textContent = stats.generation ?? 'N/A';
    }
    if (alivePercentageDisplay) {
        alivePercentageDisplay.textContent = stats.alivePercent ?? 'N/A';
    }
    if (bornDisplay) {
        // Display both last step and total
        bornDisplay.textContent = `${stats.born ?? 'N/A'} (Total: ${stats.totalBorn ?? 'N/A'})`;
    }
    if (diedDisplay) {
        // Display both last step and total
        diedDisplay.textContent = `${stats.died ?? 'N/A'} (Total: ${stats.totalDied ?? 'N/A'})`;
    }
    if (oldestCurrentDisplay) {
        oldestCurrentDisplay.textContent = stats.oldestCurrent ?? 'N/A';
    }
    if (oldestHistoricDisplay) {
        // Note: Historic oldest is managed in simulationController, passed via stats
        oldestHistoricDisplay.textContent = stats.oldestHistoric ?? 'N/A';
    }
}

/**
 * Handles changes to the grid size inputs.
 * Validates inputs, triggers grid resize, re-renders, and updates appearance.
 */
function handleSizeChange() {
  const wasRunning = simulationController.getIsRunning();
  if (wasRunning) {
    simulationController.pauseGame(); // Pause simulation temporarily
    startPauseButton.textContent = "Start"; // Update button text immediately
  }

  let newWidth = parseInt(gridWidthInput.value, 10);
  let newHeight = parseInt(gridHeightInput.value, 10);

  // Validation
  const minWidth = parseInt(gridWidthInput.min, 10) || 4;
  const maxWidth = parseInt(gridWidthInput.max, 10) || 100;
  const minHeight = parseInt(gridHeightInput.min, 10) || 4;
  const maxHeight = parseInt(gridHeightInput.max, 10) || 100;

  let widthChanged = false;
  let heightChanged = false;

  if (isNaN(newWidth) || newWidth < minWidth || newWidth > maxWidth) {
    console.warn(`Invalid width input: ${gridWidthInput.value}. Resetting.`);
    newWidth = gridState.getWidth(); // Use current valid width
    gridWidthInput.value = newWidth;
  } else if (newWidth !== gridState.getWidth()) {
      widthChanged = true;
  }

  if (isNaN(newHeight) || newHeight < minHeight || newHeight > maxHeight) {
    console.warn(`Invalid height input: ${gridHeightInput.value}. Resetting.`);
    newHeight = gridState.getHeight(); // Use current valid height
    gridHeightInput.value = newHeight;
  } else if (newHeight !== gridState.getHeight()) {
      heightChanged = true;
  }

  // Only resize if dimensions actually changed
  if (widthChanged || heightChanged) {
      console.log(`UI Handling size change to ${newWidth}x${newHeight}`);
      gridState.resizeGrid(newWidth, newHeight);
      renderer.renderGrid(); // Render the newly resized grid
      updateInfoDisplays(); // Update stats after resize
  } else {
      // If dimensions didn't change but event fired (e.g., user typed same value),
      // still ensure appearance is correct (e.g., if window resized).
      renderer.updateGridAppearance();
  }

  // Resume simulation if it was running
  if (wasRunning) {
    simulationController.startGame();
    startPauseButton.textContent = "Pause";
  }
}

/**
 * Handles changes to the simulation speed input.
 * Validates input and updates the simulation controller.
 */
function handleSpeedChange() {
  let newSpeed = parseInt(speedInput.value, 10);

  // Validation
  const minSpeed = parseInt(speedInput.min, 10) || 50;
  if (isNaN(newSpeed) || newSpeed < minSpeed) {
    console.warn(`Invalid speed input: ${speedInput.value}. Resetting.`);
    newSpeed = simulationController.getSimulationSpeed(); // Use current valid speed
    speedInput.value = newSpeed;
  }

  simulationController.setSimulationSpeed(newSpeed);
}

/**
 * Handles the start/pause button click.
 */
function handleStartPause() {
    const isRunning = simulationController.toggleSimulation();
    startPauseButton.textContent = isRunning ? "Pause" : "Start";
}

/**
 * Handles the step button click. Only works when paused.
 */
function handleStep() {
    if (!simulationController.getIsRunning()) {
        simulationController.runStep(); // runStep now calls updateInfoDisplays via callback
    }
}

/**
 * Handles the reset button click.
 * Uses the simulation controller's handler which manages state, rendering, and UI updates.
 */
function handleReset() {
    simulationController.handleResetGrid();
    // Update button text immediately as simulation is paused by handleResetGrid
    startPauseButton.textContent = "Start";
}

/**
 * Handles the clear button click.
 * Uses the simulation controller's handler which manages state, rendering, and UI updates.
 */
function handleClear() {
    simulationController.handleClearGrid();
    // Update button text immediately as simulation is paused by handleClearGrid
    startPauseButton.textContent = "Start";
}

/**
 * Handles the mouse wheel event on number input fields to increment/decrement the value.
 * @param {WheelEvent} event The wheel event object.
 * @param {HTMLInputElement} inputElement The input element being scrolled upon.
 */
function handleInputWheel(event, inputElement) {
  event.preventDefault(); // Prevent page scrolling

  const currentValue = parseFloat(inputElement.value);
  const step = parseFloat(inputElement.step) || 1;
  const min = parseFloat(inputElement.min);
  const max = parseFloat(inputElement.max);

  let newValue;
  if (event.deltaY < 0) { // Scrolling up
    newValue = currentValue + step;
  } else { // Scrolling down
    newValue = currentValue - step;
  }

  // Clamp the value within min/max bounds
  if (!isNaN(min) && newValue < min) newValue = min;
  if (!isNaN(max) && newValue > max) newValue = max;

  // Update the input value and trigger change event if value changed
  if (newValue !== currentValue) {
    inputElement.value = newValue;
    // Manually trigger the 'change' event
    const changeEvent = new Event("change", { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
  }
}


/**
 * Sets up all event listeners for UI controls.
 */
export function setupEventListeners() {
  if (!gridWidthInput || !gridHeightInput || !speedInput || !startPauseButton || !stepButton || !resetButton || !clearButton) {
      console.error("One or more UI control elements not found. Cannot attach listeners.");
      return;
  }
  console.log("Setting up UI event listeners...");

  startPauseButton.addEventListener("click", handleStartPause);
  stepButton.addEventListener("click", handleStep);
  resetButton.addEventListener("click", handleReset);
  clearButton.addEventListener("click", handleClear);

  gridWidthInput.addEventListener("change", handleSizeChange);
  gridHeightInput.addEventListener("change", handleSizeChange);
  speedInput.addEventListener("change", handleSpeedChange);

  // Add wheel event listeners for number inputs
  gridWidthInput.addEventListener("wheel", (e) => handleInputWheel(e, gridWidthInput));
  gridHeightInput.addEventListener("wheel", (e) => handleInputWheel(e, gridHeightInput));
  speedInput.addEventListener("wheel", (e) => handleInputWheel(e, speedInput));

  // Set the callback in the simulation controller to update UI after each step
  simulationController.setUICallback(updateInfoDisplays);

  console.log("UI Event listeners attached.");
}

/**
 * Initializes the UI state (input values, button text, info displays).
 */
export function initializeUI() {
    console.log("Initializing UI state...");
    gridWidthInput.value = gridState.getWidth();
    gridHeightInput.value = gridState.getHeight();
    speedInput.value = simulationController.getSimulationSpeed();
    startPauseButton.textContent = simulationController.getIsRunning() ? "Pause" : "Start";
    // Initial display update with default stats
    const initialStats = {
        born: 0,
        died: 0,
        totalBorn: 0, // Initialize total born
        totalDied: 0, // Initialize total died
        oldestCurrent: 0,
        oldestHistoric: 0, // Historic starts at 0
        generation: gridState.getGenerationCount(),
        alivePercent: gridState.getAliveStats().percentage
    };
    updateInfoDisplays(initialStats);
    console.log("UI state initialized.");
}