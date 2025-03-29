# Coding Standards and Guidelines

This document outlines the coding standards and guidelines to be followed for the Conway's Game of Life (TRON Style) project. Consistency helps maintain code quality and makes collaboration easier.

## Technology Stack

*   **HTML:** HTML5
*   **CSS:** CSS3
*   **JavaScript:** Vanilla JavaScript (ES6+ syntax preferred) using ES Modules (`import`/`export`). Avoid external libraries or frameworks unless explicitly agreed upon.

## Code Style

### General
*   **Language:** All code comments and documentation should be in English.
*   **Character Encoding:** Use UTF-8 for all files.
*   **Line Endings:** Use Unix-style line endings (LF).

### JavaScript (Modules in `src/`)
*   **Modules:** Use ES6 `import` and `export` statements to manage dependencies between files in the `src/` directory.
*   **Strict Mode:** Enable strict mode at the beginning of each module file: `"use strict";`
*   **Indentation:** Use 2 spaces for indentation, not tabs.
*   **Semicolons:** Always use semicolons at the end of statements.
*   **Variable Declarations:** Use `const` for variables that won't be reassigned and `let` for variables that will. Avoid using `var`.
*   **Naming Conventions:**
    *   Variables and functions: `camelCase` (e.g., `gridSize`, `renderGrid`).
    *   Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_SPEED`).
    *   Classes (if introduced later): `PascalCase` (e.g., `GameController`).
*   **Function Declarations:** Prefer function declarations (`function myFunction() {}`) or `const` with arrow functions (`const myFunction = () => {}`) over function expressions assigned to `let` or `var`.
*   **Quotes:** Use single quotes (`'`) for strings unless double quotes (`"`) are needed (e.g., for JSON strings or strings containing single quotes).
*   **Whitespace:** Use whitespace appropriately to improve readability (e.g., around operators, after commas).

### CSS (style.css)
*   **Indentation:** Use 2 spaces.
*   **Selectors:** Use meaningful class names. Keep selectors specific but avoid overly complex ones. Consider BEM (Block, Element, Modifier) naming if complexity grows (e.g., `.grid`, `.grid__cell`, `.grid__cell--live`).
*   **Properties:** List properties alphabetically within a rule, or group related properties together (e.g., positioning, box model, typography, visual).
*   **Units:** Use appropriate units (e.g., `rem` or `em` for font sizes, `px` for borders, `%` or `vw`/`vh` for layout).
*   **Colors:** Define theme colors (like the TRON cyan) as CSS custom properties (variables) for easy modification (e.g., `--tron-cyan: #0ff;`).

### HTML (index.html)
*   **Indentation:** Use 2 spaces.
*   **Doctype:** Use `<!DOCTYPE html>`.
*   **Semantics:** Use semantic HTML5 elements where appropriate (`<header>`, `<main>`, `<footer>`, `<button>`, etc.).
*   **Accessibility:** Include basic accessibility features (e.g., `alt` attributes for images if any, proper labels for form controls).

## Documentation

*   **JSDoc:** All JavaScript functions must include JSDoc comments. Describe the function's purpose, parameters (`@param {type} name - description`), and return value (`@return {type} - description`) if applicable.
    ```javascript
    // Example assumes access to grid state (e.g., via an imported module)
    /**
     * Counts the number of live neighbors for a given cell using the current grid state.
     * Handles toroidal wrapping around the grid edges.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {number} width - The current grid width (e.g., from gridState.getWidth()).
     * @param {number} height - The current grid height (e.g., from gridState.getHeight()).
     * @returns {number} The count of live neighbors.
     */
    function countNeighbors(x, y, width, height) {
      // Implementation would likely use gridState.getCellState(nx, ny) internally
      // ... implementation ...
    }
    ```
*   **Inline Comments:** Use inline comments (`//`) for explaining complex or non-obvious parts of the code.

## File Structure

The project uses the following structure:
```
/game-of-life-tron-style/
├── src/                     # Contains all JavaScript modules and related assets
│   ├── backgroundAnimation.css # Styles for the background effect
│   ├── backgroundAnimation.js
│   ├── config.js
│   ├── gameLogic.js
│   ├── gridState.js
│   ├── main.js              # Main entry point, loaded by index.html
│   ├── painter.js
│   ├── renderer.js
│   ├── simulationController.js
│   └── uiController.js
├── index.html             # Main HTML file
├── style.css              # Main CSS file (UI, grid, etc.)
├── README.md              # Project overview and setup instructions
├── TODO.md                # Future tasks/ideas
└── CODING.md              # This file
```