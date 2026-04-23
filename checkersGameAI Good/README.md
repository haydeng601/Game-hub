# Checkers AI Project

Single-page Checkers (Draughts) game with Human vs AI using Minimax + Alpha-Beta pruning.

## Features

- 8x8 board with standard initial setup
- Human plays first
- Mandatory capture rule
- Multi-jump (chain capture) rule
- King promotion and king movement in both directions
- AI opponent with Minimax and Alpha-Beta pruning
- Configurable AI depth
- Turn, status, and winner display
- Restart game button

## Project Structure

- `index.html` - Page layout
- `style.css` - UI styling
- `main.js` - App controller and UI wiring
- `game.js` - Game rules and move generation
- `ai.js` - Minimax and evaluation

## How to Run

1. Open `index.html` in a browser.
2. Click a human piece to select it.
3. Click one of the highlighted destination squares to move.
4. If capture is available, only capture moves are allowed.
5. During chain captures, you must continue jumping with the same piece.

## Notes

- The AI evaluates board states using piece count, king count, and small positional bonuses.
- Multi-jump sequences are fully handled in the AI game tree.
