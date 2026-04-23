import { chooseBestAiAction } from "./ai.js";
import {
  AI,
  BOARD_SIZE,
  HUMAN,
  applyImmediateMove,
  cloneBoard,
  countPieces,
  createInitialBoard,
  getImmediateCapturesForPiece,
  getImmediateSimpleMovesForPiece,
  shouldPromote,
  getWinner,
} from "./game.js";

const boardEl = document.getElementById("board");
const turnInfoEl = document.getElementById("turnInfo");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const capturedByHumanEl = document.getElementById("capturedByHuman");
const capturedByAiEl = document.getElementById("capturedByAi");
const winnerModalEl = document.getElementById("winnerModal");
const winnerTextEl = document.getElementById("winnerText");
const modalRestartBtn = document.getElementById("modalRestartBtn");

const state = {
  board: createInitialBoard(),
  turn: HUMAN,
  selected: null,
  legalActions: [],
  gameOver: false,
  aiThinking: false,
  animating: false,
};

function keyOf(pos) {
  return `${pos.r},${pos.c}`;
}

function posEquals(a, b) {
  return a && b && a.r === b.r && a.c === b.c;
}

function resetGame() {
  closeWinnerModal();
  state.board = createInitialBoard();
  state.turn = HUMAN;
  state.selected = null;
  state.gameOver = false;
  state.aiThinking = false;
  state.animating = false;
  state.legalActions = getHumanLegalActions(state.board);

  messageEl.textContent = "Select a piece to move.";
  updateCapturedUi();
  updateTurnInfo();
  renderBoard();
}

function collectCaptureActionsForPiece(board, startR, startC) {
  const original = board[startR][startC];
  if (!original) {
    return [];
  }

  const actions = [];

  function dfs(currentBoard, r, c, sequence, captures) {
    const captureMoves = getImmediateCapturesForPiece(currentBoard, r, c);
    if (captureMoves.length === 0) {
      if (sequence.length > 0) {
        actions.push({
          from: { r: startR, c: startC },
          sequence: sequence.map((p) => ({ ...p })),
          captures: captures.map((p) => ({ ...p })),
          isCapture: true,
        });
      }
      return;
    }

    for (const move of captureMoves) {
      const cloned = cloneBoard(currentBoard);
      const movingPiece = cloned[r][c];
      cloned[r][c] = null;
      cloned[move.capture.r][move.capture.c] = null;
      cloned[move.to.r][move.to.c] = movingPiece;

      let promotedNow = false;
      if (!movingPiece.king && shouldPromote(movingPiece, move.to.r)) {
        movingPiece.king = true;
        promotedNow = true;
      }

      const nextSequence = [...sequence, { r: move.to.r, c: move.to.c }];
      const nextCaptures = [...captures, { r: move.capture.r, c: move.capture.c }];

      if (promotedNow) {
        actions.push({
          from: { r: startR, c: startC },
          sequence: nextSequence,
          captures: nextCaptures,
          isCapture: true,
        });
      } else {
        dfs(cloned, move.to.r, move.to.c, nextSequence, nextCaptures);
      }
    }
  }

  dfs(board, startR, startC, [], []);
  return actions;
}

function getHumanLegalActions(board) {
  const legal = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const piece = board[r][c];
      if (!piece || piece.player !== HUMAN) {
        continue;
      }

      const captures = collectCaptureActionsForPiece(board, r, c);
      const simples = getImmediateSimpleMovesForPiece(board, r, c).map((m) => ({
        from: { ...m.from },
        sequence: [{ ...m.to }],
        captures: [],
        isCapture: false,
      }));

      legal.push(...captures, ...simples);
    }
  }

  return legal;
}

function refreshHumanLegalMoves() {
  state.legalActions = getHumanLegalActions(state.board);
}

function openWinnerModal(winner) {
  winnerTextEl.textContent = winner === HUMAN ? "Winner: Human" : "Winner: AI";
  winnerModalEl.classList.add("open");
  winnerModalEl.setAttribute("aria-hidden", "false");
}

function closeWinnerModal() {
  winnerModalEl.classList.remove("open");
  winnerModalEl.setAttribute("aria-hidden", "true");
}

function updateTurnInfo() {
  if (state.gameOver) {
    return;
  }

  if (state.aiThinking) {
    turnInfoEl.textContent = "Turn: AI (thinking...)";
    return;
  }

  turnInfoEl.textContent = state.turn === HUMAN ? "Turn: Human" : "Turn: AI";
}

function moveTargetsForSelected() {
  if (!state.selected) {
    return [];
  }

  return state.legalActions.filter((action) => posEquals(action.from, state.selected));
}

function actionDestination(action) {
  return action.sequence[action.sequence.length - 1];
}

function updateCapturedUi() {
  const counts = countPieces(state.board);
  capturedByHumanEl.textContent = String(12 - counts[AI].pieces);
  capturedByAiEl.textContent = String(12 - counts[HUMAN].pieces);
}

function updateGameEndIfAny() {
  const winner = getWinner(state.board, state.turn);
  if (!winner) {
    return false;
  }

  state.gameOver = true;
  turnInfoEl.textContent = winner === HUMAN ? "Winner: Human" : "Winner: AI";
  messageEl.textContent = "Game over. Press Restart to play again.";
  openWinnerModal(winner);
  return true;
}

function setHumanTurnState() {
  state.turn = HUMAN;
  state.selected = null;
  refreshHumanLegalMoves();
  messageEl.textContent = "Your move.";

  updateTurnInfo();
  renderBoard();
}

async function playAiTurn() {
  if (state.gameOver) {
    return;
  }

  state.turn = AI;
  state.selected = null;
  state.aiThinking = true;
  updateTurnInfo();
  renderBoard();

  await new Promise((resolve) => setTimeout(resolve, 360));

  const action = chooseBestAiAction(state.board);

  if (!action) {
    state.aiThinking = false;
    state.gameOver = true;
    turnInfoEl.textContent = "Winner: Human";
    messageEl.textContent = "AI has no legal moves.";
    openWinnerModal(HUMAN);
    renderBoard();
    return;
  }

  await animateAndApplyTurnAction(action);
  state.aiThinking = false;
  updateCapturedUi();

  setHumanTurnState();

  if (updateGameEndIfAny()) {
    renderBoard();
    return;
  }

  messageEl.textContent = "AI moved. Your turn.";
}

async function onCellClick(r, c) {
  if (state.gameOver || state.turn !== HUMAN || state.aiThinking || state.animating) {
    return;
  }

  refreshHumanLegalMoves();

  const clickedPiece = state.board[r][c];

  if (clickedPiece && clickedPiece.player === HUMAN) {
    if (state.selected && state.selected.r === r && state.selected.c === c) {
      state.selected = null;
      messageEl.textContent = "Selection cleared. Choose a piece.";
      renderBoard();
      return;
    }

    const selectable = state.legalActions.some((a) => a.from.r === r && a.from.c === c);
    if (selectable) {
      state.selected = { r, c };
      const hasChain = moveTargetsForSelected().some((a) => a.isCapture && a.sequence.length > 1);
      messageEl.textContent = hasChain
        ? "This piece can chain-capture. Select a highlighted final square."
        : "Piece selected. Choose a highlighted move.";
      renderBoard();
      return;
    }

    messageEl.textContent = "That piece has no legal move now. Choose a highlighted option.";
    return;
  }

  if (!state.selected) {
    return;
  }

  const possible = moveTargetsForSelected();
  const action = possible.find((a) => {
    const dest = actionDestination(a);
    return dest.r === r && dest.c === c;
  });

  if (!action) {
    if (!clickedPiece) {
      state.selected = null;
      renderBoard();
    }
    return;
  }

  await animateAndApplyTurnAction(action);
  updateCapturedUi();
  state.selected = null;

  state.turn = AI;
  if (updateGameEndIfAny()) {
    renderBoard();
    return;
  }

  renderBoard();
  await playAiTurn();
}

function getCellEl(r, c) {
  return boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animatePieceStep(from, to, piece) {
  const fromCell = getCellEl(from.r, from.c);
  const toCell = getCellEl(to.r, to.c);
  if (!fromCell || !toCell) {
    return;
  }

  const boardRect = boardEl.getBoundingClientRect();
  const fromRect = fromCell.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();

  const ghost = document.createElement("div");
  ghost.className = "moving-piece";
  ghost.style.left = `${fromRect.left - boardRect.left}px`;
  ghost.style.top = `${fromRect.top - boardRect.top}px`;
  ghost.style.width = `${fromRect.width}px`;
  ghost.style.height = `${fromRect.height}px`;

  const pieceEl = document.createElement("div");
  pieceEl.className = `piece ${piece.player === HUMAN ? "human" : "ai"}${piece.king ? " king" : ""}`;
  ghost.appendChild(pieceEl);

  fromCell.classList.add("hide-piece");
  boardEl.appendChild(ghost);

  await new Promise((resolve) => requestAnimationFrame(resolve));
  ghost.style.transition = "transform 380ms cubic-bezier(0.2, 0.7, 0.2, 1)";
  ghost.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px)`;

  await wait(390);
  fromCell.classList.remove("hide-piece");
  ghost.remove();
}

async function animateAndApplyTurnAction(action) {
  state.animating = true;

  let current = { ...action.from };
  for (let i = 0; i < action.sequence.length; i += 1) {
    const move = {
      from: { ...current },
      to: { ...action.sequence[i] },
      capture: action.isCapture ? { ...action.captures[i] } : null,
    };

    const movingPiece = state.board[current.r][current.c];
    await animatePieceStep(move.from, move.to, movingPiece);
    const result = applyImmediateMove(state.board, move);
    state.board = result.board;
    current = { ...move.to };
    renderBoard();
    await wait(140);
  }

  state.animating = false;
}

function renderBoard() {
  boardEl.innerHTML = "";

  const targetActions = moveTargetsForSelected();
  const targetSet = new Map(targetActions.map((action) => [keyOf(actionDestination(action)), action]));
  const playableSet = new Set(
    state.legalActions.map((action) => keyOf(action.from)),
  );

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `cell ${(r + c) % 2 === 0 ? "light" : "dark"}`;
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      cell.addEventListener("click", () => onCellClick(r, c));

      if (state.selected && state.selected.r === r && state.selected.c === c) {
        cell.classList.add("selected");
      }

      if (state.turn === HUMAN && !state.gameOver && !state.aiThinking && playableSet.has(keyOf({ r, c }))) {
        cell.classList.add("playable");
      }

      const target = targetSet.get(keyOf({ r, c }));
      if (target) {
        cell.classList.add(target.isCapture ? "capture-target" : "move-target");
      }

      const piece = state.board[r][c];
      if (piece) {
        const pieceEl = document.createElement("div");
        pieceEl.className = `piece ${piece.player === HUMAN ? "human" : "ai"}`;
        if (piece.king) {
          pieceEl.classList.add("king");
        }
        cell.appendChild(pieceEl);
      }

      boardEl.appendChild(cell);
    }
  }
}

restartBtn.addEventListener("click", resetGame);
modalRestartBtn.addEventListener("click", resetGame);

resetGame();
