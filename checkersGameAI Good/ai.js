import {
  AI,
  HUMAN,
  applyTurnAction,
  countPieces,
  getAllTurnActions,
  getWinner,
} from "./game.js";

function evaluateBoard(board) {
  const counts = countPieces(board);
  const aiScore = counts[AI].pieces * 2 + counts[AI].kings * 3;
  const humanScore = counts[HUMAN].pieces * 2 + counts[HUMAN].kings * 3;

  let positional = 0;
  for (let r = 0; r < board.length; r += 1) {
    for (let c = 0; c < board[r].length; c += 1) {
      const piece = board[r][c];
      if (!piece) {
        continue;
      }
      if (piece.player === AI) {
        positional += piece.king ? 0.15 : r * 0.03;
      } else {
        positional -= piece.king ? 0.15 : (7 - r) * 0.03;
      }
    }
  }

  return aiScore - humanScore + positional;
}

function terminalScore(board, playerToMove, depth) {
  const winner = getWinner(board, playerToMove);
  if (!winner) {
    return null;
  }
  if (winner === AI) {
    return 1000 + depth;
  }
  return -1000 - depth;
}

function minimax(board, depth, alpha, beta, maximizingPlayer, playerToMove) {
  const terminal = terminalScore(board, playerToMove, depth);
  if (terminal !== null) {
    return { score: terminal, action: null };
  }

  if (depth === 0) {
    return { score: evaluateBoard(board), action: null };
  }

  const actions = getAllTurnActions(board, playerToMove);
  if (actions.length === 0) {
    return {
      score: playerToMove === AI ? -999 : 999,
      action: null,
    };
  }

  if (maximizingPlayer) {
    let bestScore = -Infinity;
    let bestAction = actions[0];

    for (const action of actions) {
      const child = applyTurnAction(board, action);
      const result = minimax(child, depth - 1, alpha, beta, false, HUMAN);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestAction = action;
      }

      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore, action: bestAction };
  }

  let bestScore = Infinity;
  let bestAction = actions[0];

  for (const action of actions) {
    const child = applyTurnAction(board, action);
    const result = minimax(child, depth - 1, alpha, beta, true, AI);

    if (result.score < bestScore) {
      bestScore = result.score;
      bestAction = action;
    }

    beta = Math.min(beta, bestScore);
    if (beta <= alpha) {
      break;
    }
  }

  return { score: bestScore, action: bestAction };
}

const MEDIUM_AI = {
  depth: 3,
  randomTopN: 3,
  blunderChance: 0.14,
};

export function chooseBestAiAction(board) {
  const config = MEDIUM_AI;
  const actions = getAllTurnActions(board, AI);
  if (actions.length === 0) {
    return null;
  }

  if (config.blunderChance > 0 && Math.random() < config.blunderChance) {
    return actions[Math.floor(Math.random() * actions.length)];
  }

  // Score each root action with minimax, then optionally pick from top-N to humanize play.
  const scored = actions.map((action) => {
    const child = applyTurnAction(board, action);
    const result = minimax(child, config.depth - 1, -Infinity, Infinity, false, HUMAN);
    return { action, score: result.score };
  });

  scored.sort((a, b) => b.score - a.score);
  const count = Math.min(config.randomTopN, scored.length);
  const pool = scored.slice(0, count);

  if (pool.length === 1) {
    return pool[0].action;
  }

  const choice = pool[Math.floor(Math.random() * pool.length)];
  return choice.action;
}
