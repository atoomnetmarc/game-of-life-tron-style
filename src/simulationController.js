"use strict";

import * as gridState from './gridState.js';
// import * as gameLogic from './gameLogic.js'; // Logic moved to worker
import * as renderer from './renderer.js';
import { DEFAULT_SPEED } from './config.js';

// Module-level state
let isRunning = false;
let simulationSpeed = DEFAULT_SPEED;
let timeoutId = null; // Changed from intervalId
let historicOldestAge = 0; // Track the oldest cell ever seen
let totalBornCount = 0;    // Track total cells born across all generations
let totalDiedCount = 0;    // Track total cells died across all generations
let isCalculating = false; // Flag to prevent overlapping worker requests

// Initialize the Web Worker
const worker = new Worker('src/gameLogic.worker.js', { type: 'module' });

worker.onerror = (error) => {
  console.error("Error in gameLogic.worker.js:", error.message, error);
  // Optionally pause the game or notify the user
  pauseGame();
};

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
 * Requests the next generation calculation from the worker.
 * This is called by the setTimeout loop or manually for a single step.
 */
function requestNextStep() {
  if (!isRunning && timeoutId === null) { // Ensure manual step doesn't run if already running
      // Allow manual step even if isCalculating is true from a previous run?
      // For now, let's prevent overlap entirely.
      if (isCalculating) {
          console.warn("Calculation already in progress. Manual step ignored.");
          return;
      }
  } else if (!isRunning) {
      // If paused, don't request next step automatically
      return;
  }

  if (isCalculating) {
    // console.log("Skipping requestNextStep, calculation already in progress.");
    return; // Don't send another request if one is pending
  }

  isCalculating = true;
  // console.log("Requesting next step from worker...");
  const currentGrid = gridState.getGrid();
  const width = gridState.getWidth();
  const height = gridState.getHeight();
  worker.postMessage({ grid: currentGrid, width, height });
}

/**
 * Handles the result received from the Web Worker.
 * Updates state, renders, updates UI, and schedules the next step if running.
 */
worker.onmessage = (e) => {
  // console.log("Received result from worker.");
  const { nextGrid, stats } = e.data;

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
    totalBorn: totalBornCount,
    totalDied: totalDiedCount,
    oldestCurrent: stats.oldest,
    oldestHistoric: historicOldestAge,
    generation: gridState.getGenerationCount(),
    alivePercent: gridState.getAliveStats().percentage
  };
  updateUICallback(uiStats); // Update UI elements with all stats

  isCalculating = false; // Mark calculation as complete

  // If the simulation is still set to run, schedule the next step
  if (isRunning) {
    // Clear any potentially existing timeout before setting a new one
    // (Shouldn't be necessary with the isCalculating flag, but safe)
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(requestNextStep, simulationSpeed);
    // console.log(`Scheduled next step in ${simulationSpeed}ms`);
  } else {
      timeoutId = null; // Ensure timeoutId is null when paused
  }
};


/**
 * Executes a single manual step of the simulation (when paused).
 * Sends a request to the worker. The result will be handled by worker.onmessage.
 */
export function runStep() {
  if (isRunning) {
    console.warn("Manual step called while simulation is running. Ignoring.");
    return;
  }
  if (isCalculating) {
      console.warn("Calculation already in progress. Manual step ignored.");
      return;
  }
  console.log("Requesting manual step...");
  requestNextStep(); // Request calculation, result handled by onmessage
}

/**
 * Starts the simulation loop by requesting the first step from the worker.
 */
export function startGame() {
  if (isRunning) return isRunning; // Already running

  isRunning = true;
  isCalculating = false; // Reset calculation flag
  console.log(`Simulation started with speed ${simulationSpeed}ms.`);
  requestNextStep(); // Request the first step
  return isRunning; // Return current state (true)
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
 * Pauses the simulation loop by clearing the pending timeout.
 */
export function pauseGame() {
  if (!isRunning) return isRunning; // Already paused

  isRunning = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = null;
  // Note: A calculation might still be in progress in the worker when paused.
  // The result will arrive, update the grid/UI, but won't schedule the *next* step.
  // isCalculating flag will be reset by the worker response handler.
  console.log("Simulation paused.");
  return isRunning; // Return current state (false)
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
 * Updates the simulation speed. The new speed will be used for the next setTimeout schedule.
 * @param {number} newSpeed - The new speed in milliseconds.
 */
export function setSimulationSpeed(newSpeed) {
  simulationSpeed = Math.max(0, newSpeed); // Ensure speed is not negative
  console.log(`Simulation speed set to ${simulationSpeed}ms.`);
  // No need to restart timeout explicitly. The next schedule in worker.onmessage
  // will automatically use the updated simulationSpeed.
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