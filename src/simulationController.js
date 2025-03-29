"use strict";

import * as gridState from './gridState.js';
import * as gameLogic from './gameLogic.js';
import * as renderer from './renderer.js';
import { DEFAULT_SPEED } from './config.js';

// Module-level state
let isRunning = false;
let simulationSpeed = DEFAULT_SPEED;
let intervalId = null;

// Callback for UI updates (to be set by uiController)
let updateUICallback = () => {}; // No-op default

/**
 * Sets a callback function to update UI elements after a step.
 * @param {Function} callback - The function to call (e.g., to update generation count display).
 */
export function setUICallback(callback) {
    updateUICallback = callback;
}

/**
 * Executes a single step of the simulation:
 * 1. Computes the next generation.
 * 2. Updates the grid state.
 * 3. Renders the new grid.
 * 4. Calls the UI update callback.
 */
export function runStep() {
  const nextGrid = gameLogic.computeNextGeneration();
  gridState.updateGrid(nextGrid); // Updates global 'grid' and increments generation count
  renderer.renderGrid();
  updateUICallback(); // Update UI elements like generation count
  // console.log(`Advanced to generation ${gridState.getGenerationCount()}`); // Optional logging
}

/**
 * Starts the simulation interval.
 */
export function startGame() {
  if (isRunning) return; // Prevent multiple intervals

  isRunning = true;
  intervalId = setInterval(runStep, simulationSpeed);
  console.log(`Simulation started with speed ${simulationSpeed}ms.`);
  return isRunning; // Return current state
}

/**
 * Pauses the simulation interval.
 */
export function pauseGame() {
  if (!isRunning) return; // Already paused

  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
  console.log("Simulation paused.");
  return isRunning; // Return current state
}

/**
 * Toggles the simulation state between running and paused.
 * @returns {boolean} The new running state (true if running, false if paused).
 */
export function toggleSimulation() {
    if (isRunning) {
        return pauseGame();
    } else {
        return startGame();
    }
}

/**
 * Updates the simulation speed. If the simulation is running, it restarts the interval.
 * @param {number} newSpeed - The new speed in milliseconds.
 */
export function setSimulationSpeed(newSpeed) {
  simulationSpeed = newSpeed;
  console.log(`Simulation speed set to ${simulationSpeed}ms.`);
  if (isRunning) {
    // Restart the interval with the new speed
    pauseGame();
    startGame();
  }
}

/**
 * Gets the current simulation speed.
 * @returns {number}
 */
export function getSimulationSpeed() {
    return simulationSpeed;
}

/**
 * Gets the current running state.
 * @returns {boolean}
 */
export function getIsRunning() {
    return isRunning;
}