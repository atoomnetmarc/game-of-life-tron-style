Made with [Google: Gemini Pro 2.5 Experimental (free)](https://openrouter.ai/google/gemini-2.5-pro-exp-03-25:free) in [Roo Code](https://github.com/RooVetGit/Roo-Code).

See it in action: http://atoomnetmarc.github.io/game-of-life-tron-style

# Conway's Game of Life (TRON Style)

## Description

This project is a web-based implementation of Conway's Game of Life, a cellular automaton devised by the British mathematician John Horton Conway in 1970. It features a visual style inspired by the movie TRON.

The "game" is a zero-player game, meaning its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.

## Features

- **Visual Grid:** Displays the Game of Life cells.
- **Configurable Grid Size:** Adjust the width and height of the simulation grid (default: 42x32). The existing pattern is preserved and centered during resize.
- **Configurable Speed:** Control the time interval between simulation steps (default: 500ms).
- **Simulation Controls:**
  - Start/Pause the simulation.
  - Advance the simulation by a single step manually.
  - Reset the grid to a new random state.
  - Clear the grid (set all cells to dead).
- **TRON Aesthetic:** Dark background with glowing elements for the grid and live cells.
- **Animated Background:** Features a dynamic Tron-inspired light cycle animation in the background.
- **Wrapping Boundaries:** The grid edges wrap around (toroidal array).
- **Interactive Painting:** Click/touch and drag on the grid to paint cells alive or dead. Works whether the simulation is running or paused.
- **Dynamic Cell Sizing:** Cell size automatically adjusts to best fit the available window space.
- **Alive Cell Percentage:** Displays the current percentage of live cells.
- **Newly Alive Cell Highlighting:** Cells that become alive are briefly highlighted for visual feedback.
- **Mouse Wheel Input Control:** Adjust grid dimensions and speed using the mouse wheel over the respective input fields.

## How to Run

1.  Clone or download this repository.
2.  Navigate to the project directory in your terminal.
3.  **Start a local web server.** This project uses JavaScript Modules (`type="module"`), which require the files to be served over HTTP(S) due to browser security policies (CORS). Opening `index.html` directly from the file system (`file://`) will not work.
    *   A simple way is to use Node.js/npm: Run `npx serve .` in the project directory.
    *   Alternatively, if you have Python 3: Run `python3 -m http.server`.
4.  Open your web browser and navigate to the local address provided by the server (e.g., `http://localhost:3000` or `http://localhost:8000`).

## Controls

- **Grid Size Inputs (Width/Height):** Enter desired dimensions. The grid resizes while preserving the centered pattern. Also adjustable via mouse wheel.
- **Speed Input:** Enter the desired interval in milliseconds (ms) between steps. Also adjustable via mouse wheel.
- **Start/Pause Button:** Toggles the automatic progression of the simulation.
- **Step Button:** Manually advances the simulation by one generation (only works when paused).
- **Reset Button:** Initializes the grid with a new random pattern.
- **Clear Button:** Sets all cells to dead without changing grid size or speed.
- **Grid Cells:** Click/touch and drag on the grid to paint cells. Click/touching an alive cell starts painting dead cells; clicking/touching a dead cell starts painting live cells. This works both when the simulation is running and when it is paused.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (ES6+) using ES Modules
  - Code organized into modules within the `src/` directory for better structure and maintainability.
