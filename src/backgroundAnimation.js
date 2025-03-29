"use strict";

// DOM Element Reference
const backgroundCanvas = document.getElementById("backgroundCanvas");

// Check if canvas exists
if (!backgroundCanvas) {
    console.warn("Background canvas element not found. Skipping background animation setup.");
    // Provide dummy export functions if canvas is missing to prevent errors in main.js
    // export function initializeBackground() {}
    // export function resizeBackgroundCanvas() {} // Might still be needed if called directly
    // export function animateBackground() {}
    // For simplicity, we'll let it potentially fail later if main.js tries to use it without the canvas.
    // A more robust approach would use the dummy exports.
}

const bgCtx = backgroundCanvas ? backgroundCanvas.getContext("2d") : null;

// Configuration
const numCycles = 4;
const cycleColors = ["#ff9900", "#ff0000", "#00ff00", "#cccccc"]; // Orange, Red, Green, Grey
const cycleSpeed = 2;
const trailLength = 50; // Number of segments in the trail

// State
let bgWidth, bgHeight;
const lightCycles = [];
let animationFrameId = null; // To potentially cancel the animation frame

class LightCycle {
  constructor(x, y, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = color;
    this.trail = []; // Stores {x, y} points
  }

  move() {
    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > trailLength) {
      this.trail.shift(); // Remove oldest segment
    }

    // Update position
    this.x += this.dx * cycleSpeed;
    this.y += this.dy * cycleSpeed;

    // Randomly change direction occasionally
    if (Math.random() < 0.01) {
      this.changeDirection();
    }

    // Wrap around screen edges
    if (this.x < 0) this.x = bgWidth;
    if (this.x > bgWidth) this.x = 0;
    if (this.y < 0) this.y = bgHeight;
    if (this.y > bgHeight) this.y = 0;
  }

  changeDirection() {
    const directions = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    ];
    // Avoid immediate reversal
    let newDir;
    do {
      newDir = directions[Math.floor(Math.random() * directions.length)];
    } while (newDir.dx === -this.dx && newDir.dy === -this.dy);

    this.dx = newDir.dx;
    this.dy = newDir.dy;
  }

  draw() {
    if (!bgCtx) return;
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const segment = this.trail[i];
      const alpha = (i / this.trail.length) * 0.6; // Fade out
      // Ensure alpha is between 00 and FF
      const alphaHex = Math.max(0, Math.min(255, Math.floor(alpha * 255))).toString(16).padStart(2, "0");
      bgCtx.fillStyle = `${this.color}${alphaHex}`;
      bgCtx.fillRect(segment.x - 1, segment.y - 1, 3, 3);
    }

    // Draw head
    bgCtx.fillStyle = this.color;
    bgCtx.shadowColor = this.color;
    bgCtx.shadowBlur = 10;
    bgCtx.fillRect(this.x - 2, this.y - 2, 5, 5);
    bgCtx.shadowBlur = 0; // Reset shadow
  }
}

/**
 * Resizes the background canvas to match the window size.
 */
export function resizeBackgroundCanvas() {
    if (!backgroundCanvas) return;
    bgWidth = backgroundCanvas.width = window.innerWidth;
    bgHeight = backgroundCanvas.height = window.innerHeight;
    console.log(`Background canvas resized to ${bgWidth}x${bgHeight}`);
}

/**
 * The main animation loop for the background.
 */
function animateBackground() {
  if (!bgCtx) return;

  // Clear canvas with a fade effect
  bgCtx.fillStyle = "rgba(5, 8, 16, 0.1)"; // --tron-bg with low alpha
  bgCtx.fillRect(0, 0, bgWidth, bgHeight);

  // Move and draw each cycle
  lightCycles.forEach((cycle) => {
    cycle.move();
    cycle.draw();
  });

  animationFrameId = requestAnimationFrame(animateBackground); // Loop
}

/**
 * Initializes the background animation. Creates cycles and starts the loop.
 */
export function initializeBackground() {
    if (!backgroundCanvas || !bgCtx) {
        console.warn("Background canvas or context not available. Skipping initialization.");
        return;
    }
    console.log("Initializing background animation...");
    resizeBackgroundCanvas(); // Initial size
    window.addEventListener("resize", resizeBackgroundCanvas); // Adjust on window resize

    // Clear existing cycles if re-initializing
    lightCycles.length = 0;

    // Create initial light cycles
    for (let i = 0; i < numCycles; i++) {
        const x = Math.random() * bgWidth;
        const y = Math.random() * bgHeight;
        const angle = Math.random() * Math.PI * 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        // Ensure initial direction is axis-aligned
        let initialDx, initialDy;
        if (Math.abs(dx) > Math.abs(dy)) {
            initialDx = dx > 0 ? 1 : -1; initialDy = 0;
        } else {
            initialDx = 0; initialDy = dy > 0 ? 1 : -1;
        }
        lightCycles.push(
            new LightCycle(x, y, initialDx, initialDy, cycleColors[i % cycleColors.length])
        );
    }

    // Start the animation loop if not already running
    if (animationFrameId === null) {
        animateBackground();
    }
    console.log("Background animation initialized.");
}