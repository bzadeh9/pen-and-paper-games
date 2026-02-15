# Pen & Paper Games

A collection of classic pen and paper games, re-imagined for the web.

## Games

### Black Hole

"A game of reverse-area control"

**How to Play:**

1.  **Game Setup:**
    *   The board consists of 21 circles arranged in a pyramid (rows 1-6).
    *   Player 1 and Player 2 take turns placing numbers 1 through 10 in sequence.
    *   After 20 numbers are placed, the remaining empty circle becomes the "Black Hole".
2.  **Winning the Game:**
    *   At the end of the game, all numbers adjacent to the Black Hole are scored.
    *   Each player's score is the sum of their numbers touching the Black Hole.
    *   **Lowest Score Mode:** The player with the lowest score wins.
    *   **Highest Score Mode:** The player with the highest score wins.

### Hold the Line

"Connect the dots, and be the last one to move!"

**How to Play:**

1.  **Objective:** The player who makes the last legal move **WINS**. If you have no more legal moves on your turn, you lose.
2.  **Setup:** Choose grid size (default 4x4, up to 10x10).
3.  **Moves:**
    *   Players take turns drawing lines between adjacent dots (horizontal, vertical, or diagonal).
    *   The first move can be placed anywhere on the grid.
    *   Subsequent moves must connect to one of the two current ends of the path.
    *   You cannot visit a dot that has already been visited.
    *   You cannot draw a line that intersects an existing line.

### Knight Chase

"Strategic knight movement with a twist!"

**How to Play:**

*   Players start at opposite corners of an 8x8 board.
*   Move like a chess knight: in an L-shape (2 squares in one direction, then 1 square perpendicular).
*   Once you leave a square, it becomes "exhausted" and cannot be entered again.
*   Win by landing on your opponent's square (elimination) or when your opponent has no valid moves left (entrapment).

### Order and Chaos

"Asymmetric strategy on a 6x6 grid"

**How to Play:**

*   **The Roles:**
    *   **Order:** Aims to create a sequence of five-in-a-row of the same color (horizontal, vertical, or diagonal).
    *   **Chaos:** Aims to prevent Order from completing a line until the entire board is filled.
*   **The Turn:** On your turn, select a color (cherry blossom or dusty mauve) and place it in any empty cell on the 6x6 grid.
*   **Winning:**
    *   As soon as a line of five same-colored pieces appears, **Order** wins immediately.
    *   If the board is filled and no five-in-a-row exists, **Chaos** wins.

### Splatter

"Strategic elimination - be the last one standing!"

**How to Play:**

*   Choose between **Auto** (random board setup) or **Manual** (take turns placing dots) mode.
*   On your turn, click one of your colored dots to perform a **Single Splatter** (removes only that dot), or right-click for an **Area Splatter** (removes the dot and all 8 surrounding cells).
*   Area Splatter removes all dots in the area, regardless of color.
*   The player who still has dots remaining when their opponent has none **WINS**.

### Ultimate Tic-Tac-Toe

"A strategic twist on the classic game!"

**How to Play:**

1.  **The Board:** The game is played on a 3x3 grid of smaller 3x3 tic-tac-toe boards.
2.  **Objective:** Win 3 small boards in a row on the global board.
3.  **Game Modes:**
    *   **Standard (Casual):** Play in any available cell on any board.
    *   **Strict (Classic):** Your move determines where your opponent must play next. If you play in a specific position on a small board, your opponent must play on the corresponding small board.
4.  **Winning a Small Board:** Get 3 in a row within a small board to win it.

## Getting Started

This is a [Next.js](https://nextjs.org) project.

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Run the development server:**

    ```bash
    pnpm dev
    ```

3.  **Open [http://localhost:3000](http://localhost:3000)** with your browser to play.

## Development

*   **Framework:** [Next.js](https://nextjs.org)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com)
*   **Testing:** [Vitest](https://vitest.dev)
*   **Repo Structure:** Monorepo with `apps/web` application.