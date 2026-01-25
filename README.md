# Pen & Paper Games

A collection of classic pen and paper games, re-imagined for the web.

## Games

### Hold the Line

"Connect the dots, and be the last one to move!"

**How to Play:**

1.  **Objective:** The player who makes the last legal move **WINS** (Normal play). If you cannot make a legal move on your turn, you lose.
2.  **Setup:** Choose grid size (default 4x4, up to 10x10). Click "Start Game".
3.  **Moves:**
    - Players take turns drawing lines between adjacent dots (horizontal, vertical, or diagonal).
    - **First Move:** Can be placed anywhere on the grid. This dot becomes both the "start" and "end" of the path.
    - **Subsequent Moves:** Must connect to one of the two _current_ ends of the path.
    - **Restrictions:**
      - You cannot visit a dot that has already been visited.
      - You cannot draw a line that intersects an existing line.

## Getting Started

This is a [Next.js](https://nextjs.org) project.

1.  **Install dependencies:**

    ```bash
    pnpm install
    # or
    npm install
    ```

2.  **Run the development server:**

    ```bash
    pnpm dev
    # or
    npm run dev
    ```

3.  **Open [http://localhost:3000](http://localhost:3000)** with your browser to play.

## Development

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Testing:** [Vitest](https://vitest.dev)
- **Repo Structure:** Monorepo with `apps/web` application.

### Running Tests

To run the game engine tests:

```bash
cd apps/web
pnpm vitest
```
