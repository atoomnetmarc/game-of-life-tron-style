"use strict";

import * as gridState from './gridState.js';
import * as gameLogic from './gameLogic.js';
import * as renderer from './renderer.js';
import { DEFAULT_SPEED } from './config.js';

// Module-level state
let isRunning = false;
let simulationSpeed = DEFAULT_SPEED;
let intervalId = null;
let historicOldestAge = 0; // Track the oldest cell ever seen
let totalBornCount = 0;    // Track total cells born across all generations
let totalDiedCount = 0;    // Track total cells died across all generations

// Callback for UI updates (to be set by uiController)
// Now includes stats parameters
let updateUICallback = (stats) => {
    // Default implementation does nothing, but shows expected signature
    // console.log('UI Update Callback called with stats:', stats);
};

/**
 * Sets a callback function to update UI elements after a step.
 * @param {Function} callback - The function to call. Expected signature: (stats: {born: number, died: number, totalBorn: number, totalDied: number, oldestCurrent: number, oldestHistoric: number, generation: number, alivePercent: string}) => void
 */
export function setUICallback(callback) {
    updateUICallback = callback;
}

/**
 * Executes a single step of the simulation:
 * 1. Computes the next generation.
 * 2. Updates the grid state.
 * 3. Renders the new grid.
 * 4. Updates historic oldest age.
 * 5. Calls the UI update callback with all stats.
 */
export function runStep() {
  const { nextGrid, stats } = gameLogic.computeNextGeneration();
  gridState.updateGrid(nextGrid); // Updates global 'grid' and increments generation count

  // Update historic oldest age
  if (stats.oldest > historicOldestAge) {
    historicOldestAge = stats.oldest;
  }

  // Update total counts
  totalBornCount += stats.born;
  totalDiedCount += stats.died;

  renderer.renderGrid();

  // Prepare stats object for UI callback
  const uiStats = {
    born: stats.born,
    died: stats.died,
    totalBorn: totalBornCount, // Add total born
    totalDied: totalDiedCount, // Add total died
    oldestCurrent: stats.oldest,
    oldestHistoric: historicOldestAge,
    generation: gridState.getGenerationCount(),
    alivePercent: gridState.getAliveStats().percentage // Get current percentage
  };
  updateUICallback(uiStats); // Update UI elements with all stats

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
 * Handles the logic for clearing the grid.
 * Stops simulation, clears state, resets historic stats, renders, and updates UI.
 */
export function handleClearGrid() {
    if (isRunning) {
        pauseGame(); // Stop simulation if running
    }
    gridState.clearGrid();
    historicOldestAge = 0; // Reset historic stat
    totalBornCount = 0;    // Reset total born count
    totalDiedCount = 0;    // Reset total died count
    renderer.renderGrid();
    // Update UI with cleared state (0 for all stats)
    const clearedStats = {
        born: 0,
        died: 0,
        totalBorn: 0, // Include reset total
        totalDied: 0, // Include reset total
        oldestCurrent: 0,
        oldestHistoric: 0,
        generation: gridState.getGenerationCount(), // Keep current generation count
        alivePercent: gridState.getAliveStats().percentage // Should be "0.0"
    };
    updateUICallback(clearedStats);
    console.log("Grid cleared and historic stats reset.");
}

/**
 * Handles the logic for resetting the grid to a new random state.
 * Stops simulation, resets state, resets historic stats, renders, and updates UI.
 */
export function handleResetGrid() {
    if (isRunning) {
        pauseGame(); // Stop simulation if running
    }
    gridState.resetGrid(); // Resets generation count internally
    historicOldestAge = 0; // Reset historic stat
    totalBornCount = 0;    // Reset total born count
    totalDiedCount = 0;    // Reset total died count
    renderer.renderGrid();
    // Update UI with reset state (0 for all stats, new generation count)
    const resetStats = {
        born: 0,
        died: 0,
        totalBorn: 0, // Include reset total
        totalDied: 0, // Include reset total
        oldestCurrent: 0,
        oldestHistoric: 0,
        generation: gridState.getGenerationCount(), // Should be 0
        alivePercent: gridState.getAliveStats().percentage // Will vary based on random start
    };
    updateUICallback(resetStats);
    console.log("Grid reset and historic stats reset.");
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