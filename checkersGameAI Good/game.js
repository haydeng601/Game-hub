export const BOARD_SIZE = 8;
export const HUMAN = "H";
export const AI = "A";

export function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { player: AI, king: false };
      }
    }
  }

  for (let r = 5; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { player: HUMAN, king: false };
      }
    }
  }

  return board;
}

export function cloneBoard(board) {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

export function opponent(player) {
  return player === HUMAN ? AI : HUMAN;
}

export function inBounds(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export function shouldPromote(piece, row) {
  if (piece.king) {
    return false;
  }
  if (piece.player === HUMAN) {
    return row === 0;
  }
  return row === BOARD_SIZE - 1;
}

function getDirections(piece) {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }

  if (piece.player === HUMAN) {
    return [
      [-1, -1],
      [-1, 1],
    ];
  }

  return [
    [1, -1],
    [1, 1],
  ];
}

export function getImmediateCapturesForPiece(board, r, c) {
  const piece = board[r][c];
  if (!piece) {
    return [];
  }

  const moves = [];
  for (const [dr, dc] of getDirections(piece)) {
    const midR = r + dr;
    const midC = c + dc;
    const toR = r + dr * 2;
    const toC = c + dc * 2;

    if (!inBounds(midR, midC) || !inBounds(toR, toC)) {
      continue;
    }

    const jumped = board[midR][midC];
    if (jumped && jumped.player !== piece.player && !board[toR][toC]) {
      moves.push({
        from: { r, c },
        to: { r: toR, c: toC },
        capture: { r: midR, c: midC },
      });
    }
  }

  return moves;
}

export function getImmediateSimpleMovesForPiece(board, r, c) {
  const piece = board[r][c];
  if (!piece) {
    return [];
  }

  const moves = [];
  for (const [dr, dc] of getDirections(piece)) {
    const toR = r + dr;
    const toC = c + dc;
    if (inBounds(toR, toC) && !board[toR][toC]) {
      moves.push({
        from: { r, c },
        to: { r: toR, c: toC },
      });
    }
  }

  return moves;
}

export function getImmediateLegalMoves(board, player, forcedPiece = null) {
  if (forcedPiece) {
    return getImmediateCapturesForPiece(board, forcedPiece.r, forcedPiece.c).map((m) => ({
      ...m,
      isCapture: true,
    }));
  }

  const captures = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const piece = board[r][c];
      if (!piece || piece.player !== player) {
        continue;
      }

      const pieceCaptures = getImmediateCapturesForPiece(board, r, c).map((m) => ({
        ...m,
        isCapture: true,
      }));
      captures.push(...pieceCaptures);
    }
  }

  if (captures.length > 0) {
    return captures;
  }

  const simpleMoves = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const piece = board[r][c];
      if (!piece || piece.player !== player) {
        continue;
      }

      const moves = getImmediateSimpleMovesForPiece(board, r, c).map((m) => ({
        ...m,
        isCapture: false,
      }));
      simpleMoves.push(...moves);
    }
  }

  return simpleMoves;
}

export function applyImmediateMove(board, move) {
  const next = cloneBoard(board);
  const piece = next[move.from.r][move.from.c];
  next[move.from.r][move.from.c] = null;
  next[move.to.r][move.to.c] = piece;

  if (move.capture) {
    next[move.capture.r][move.capture.c] = null;
  }

  const promoted = shouldPromote(piece, move.to.r);
  if (promoted) {
    piece.king = true;
  }

  return {
    board: next,
    wasCapture: Boolean(move.capture),
    promoted,
    to: move.to,
  };
}

function collectCaptureSequences(board, startR, startC) {
  const original = board[startR][startC];
  if (!original) {
    return [];
  }

  const actions = [];

  function dfs(currentBoard, r, c, sequence, captures) {
    const piece = currentBoard[r][c];
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

      // In many checkers variants, promotion during a jump ends that turn.
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

function collectSimpleActions(board, r, c) {
  return getImmediateSimpleMovesForPiece(board, r, c).map((m) => ({
    from: { ...m.from },
    sequence: [{ ...m.to }],
    captures: [],
    isCapture: false,
  }));
}

export function getAllTurnActions(board, player) {
  const captures = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const piece = board[r][c];
      if (!piece || piece.player !== player) {
        continue;
      }
      captures.push(...collectCaptureSequences(board, r, c));
    }
  }

  if (captures.length > 0) {
    return captures;
  }

  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const piece = board[r][c];
      if (!piece || piece.player !== player) {
        continue;
      }
      moves.push(...collectSimpleActions(board, r, c));
    }
  }

  return moves;
}

export function applyTurnAction(board, action) {
  const next = cloneBoard(board);
  let piece = next[action.from.r][action.from.c];
  next[action.from.r][action.from.c] = null;

  let currentPos = { ...action.from };

  for (let i = 0; i < action.sequence.length; i += 1) {
    const to = action.sequence[i];
    if (action.isCapture) {
      const cap = action.captures[i];
      next[cap.r][cap.c] = null;
    }
    currentPos = { r: to.r, c: to.c };
  }

  if (!piece.king && shouldPromote(piece, currentPos.r)) {
    piece.king = true;
  }

  next[currentPos.r][currentPos.c] = piece;
  return next;
}

export function countPieces(board) {
  const counts = {
    H: { pieces: 0, kings: 0 },
    A: { pieces: 0, kings: 0 },
  };

  for (const row of board) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }
      counts[piece.player].pieces += 1;
      if (piece.king) {
        counts[piece.player].kings += 1;
      }
    }
  }

  return counts;
}

export function getWinner(board, currentPlayer) {
  const counts = countPieces(board);
  if (counts[HUMAN].pieces === 0) {
    return AI;
  }
  if (counts[AI].pieces === 0) {
    return HUMAN;
  }

  const legal = getAllTurnActions(board, currentPlayer);
  if (legal.length === 0) {
    return opponent(currentPlayer);
  }

  return null;
}
