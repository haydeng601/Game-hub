# Solitaire Card Game - CSC200 Data Structures & Algorithms

## Project Description
This project implements a complete Klondike Solitaire card game using custom data structures in JavaScript. The game follows standard Solitaire rules with a graphical interface, drag-and-drop functionality, and advanced features like undo/redo system.

## How to Run the Game
1. Download all project files to a local directory
2. Ensure these files are in the same folder:
   - `index.html`
   - `style.css` 
   - `data-structures.js`
   - `game.js`
3. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
4. No additional installations or dependencies required
5. The game will load automatically and is ready to play

## Dependencies
- **None** - This is a pure JavaScript implementation
- Works on any browser supporting HTML5, CSS3, and ES6+ JavaScript
- No external libraries or frameworks required

## Game Features
✅ **Core Gameplay**: Complete Klondike Solitaire rules  
✅ **Custom Data Structures**: Stack, Queue, LinkedList implemented from scratch  
✅ **Three-Card Draw**: Draw 3 cards at a time from stock  
✅ **Drag & Drop**: Intuitive card movement interface  
✅ **Undo/Redo System**: Full move history with bidirectional navigation  
✅ **Scoring System**: Points for moves, foundation building, and card flips  
✅ **Game Timer**: Real-time tracking of completion time  
✅ **Hint System**: Intelligent move suggestions  
✅ **Win Detection**: Automatic celebration when game is won  
✅ **Auto-move**: Double-click to move cards to foundations automatically  

## Data Structures Implemented
- **CustomArray**: For deck storage and waste pile management
- **Stack**: For foundation piles (LIFO operations)
- **Queue**: For stock pile management (FIFO operations)
- **LinkedList**: For move history and undo/redo functionality

## Project Structure
CSC200M24PID[17]/
├── index.html # Main game interface
├── style.css # Styling and animations
├── data-structures.js # Custom data structures
├── game.js # Game logic and mechanics
└── README.md # This documentation file

## Game Rules
- **Tableau**: Build down in alternating colors (red/black)
- **Foundations**: Build up by suit from Ace to King
- **Stock**: 24 cards drawn 3 at a time
- **Moves**: Only face-up cards can be moved
- **Win Condition**: All 52 cards moved to foundation piles

## Controls
- **Click** on stock to draw cards
- **Drag & Drop** cards to move between piles
- **Double-click** cards for auto-move to foundations
- **Buttons**: New Game, Undo, Redo, Hint

## Developer
**Name**: [Aeman Rehman]  
**Roll Number**: [2024-CS-17]  
**Course**: CSC200 - Data Structures & Algorithms  
**Submission Date**: 07,November 2024

---
*This project demonstrates practical implementation of data structures in game development*