# Coding Standards and Guidelines

This document outlines the coding standards and guidelines to be followed for the Conway's Game of Life (TRON Style) project. Consistency helps maintain code quality and makes collaboration easier.

## Technology Stack

*   **HTML:** HTML5
*   **CSS:** CSS3
*   **JavaScript:** Vanilla JavaScript (ES6+ syntax preferred). Avoid external libraries or frameworks unless explicitly agreed upon.

## Code Style

### General
*   **Language:** All code comments and documentation should be in English.
*   **Character Encoding:** Use UTF-8 for all files.
*   **Line Endings:** Use Unix-style line endings (LF).

### JavaScript (script.js)
*   **Strict Mode:** Enable strict mode at the beginning of the script: `'use strict';`
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
    /**
     * Counts the number of live neighbors for a given cell.
     * Handles toroidal wrapping around the grid edges.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {Array<Array<number>>} currentGrid - The current state of the grid.
     * @param {number} size - The width/height of the grid.
     * @return {number} The count of live neighbors.
     */
    function countNeighbors(x, y, currentGrid, size) {
      // ... implementation ...
    }
    ```
*   **Inline Comments:** Use inline comments (`//`) for explaining complex or non-obvious parts of the code.

## File Structure

Adhere to the agreed-upon project structure:
```
/game-of-life/
├── index.html
├── style.css
├── script.js
├── README.md
├── TODO.md
└── CODING.md