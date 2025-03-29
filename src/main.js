"use strict";

import * as gridState from './gridState.js';
import * as renderer from './renderer.js';
import * as simulationController from './simulationController.js';
import * as uiController from './uiController.js';
import * as painter from './painter.js';
import * as backgroundAnimation from './backgroundAnimation.js';

/**
 * Initializes the entire application.
 */
function initialize() {
  console.log("Initializing Game of Life (Modular)...");

  // 1. Initialize state (grid dimensions, generation count)
  gridState.initializeGrid(); // Uses defaults from config.js

  // 2. Initialize UI elements (set initial input values, button text, info displays)
  uiController.initializeUI();

  // 3. Perform initial render
  renderer.renderGrid(); // Renders the initial random grid

  // 4. Setup event listeners
  uiController.setupEventListeners(); // For buttons, inputs
  painter.setupPaintingListeners(); // For grid painting
  // Window resize listener for grid appearance is handled within renderer.js setup potentially,
  // but let's add one here too for safety, specifically calling the renderer's update function.
  window.addEventListener('resize', renderer.updateGridAppearance);

  // 5. Initialize background animation
  backgroundAnimation.initializeBackground();

  console.log("Game of Life initialization complete.");
}

// --- Main Execution ---
// Wait for the DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", initialize);