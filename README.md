Made with [Google: Gemini Pro 2.5 Experimental (free)](https://openrouter.ai/google/gemini-2.5-pro-exp-03-25:free) in [Roo Code](https://github.com/RooVetGit/Roo-Code).

See it in action: http://atoomnetmarc.github.io/game-of-life-tron-style

# Conway's Game of Life (TRON Style)

## Description

This project is a web-based implementation of Conway's Game of Life, a cellular automaton devised by the British mathematician John Horton Conway in 1970. It features a visual style inspired by the movie TRON.

The "game" is a zero-player game, meaning its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.

## Features

- **Visual Grid:** Displays the Game of Life cells.
- **Configurable Grid Size:** Adjust the width and height of the simulation grid (default: 16x16).
- **Configurable Speed:** Control the time interval between simulation steps (default: 500ms).
- **Simulation Controls:**
  - Start/Pause the simulation.
  - Advance the simulation by a single step manually.
  - Reset the grid (e.g., to a random state).
- **TRON Aesthetic:** Dark background with glowing cyan elements for the grid and live cells.
- **Wrapping Boundaries:** The grid edges wrap around (toroidal array), meaning cells on the top edge interact with the bottom edge, and cells on the left edge interact with the right edge.
- **Interactive Editing:** Click on cells to toggle their state (live/dead) when the simulation is paused.

## How to Run

1.  Clone or download this repository.
2.  Navigate to the `game-of-life` directory.
3.  Open the `index.html` file in a modern web browser (like Chrome, Firefox, Edge, or Safari).

## Controls

- **Grid Size Input:** Enter desired width/height for the grid. The grid will reset upon change.
- **Speed Input:** Enter the desired interval in milliseconds (ms) between steps.
- **Start/Pause Button:** Toggles the automatic progression of the simulation.
- **Step Button:** Manually advances the simulation by one generation (only works when paused).
- **Reset Button:** Clears the grid or initializes it with a new random pattern.
- **Grid Cells:** Click on individual cells to toggle them between live and dead states while the simulation is paused.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
