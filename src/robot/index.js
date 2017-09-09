const {
  isOutOfBounds,
  isFirstTurn,
  getCornerPositions,
  getDiagonalPositions,
  getAdjacentPositions,
  isDiagonalToPlayer,
  isAdjacentToPlayer,
  validMovePositions,
  opponentOccupiedAdjacents,
  opponentOccupiedDiagonals,
  findNumBlocks
} = require('../utils');

const getPlacementFunction = require('../actions');

const clone = (a) => a.map(b => [...b]);

function findAvailableCells(playerId, board) {
  return isFirstTurn(playerId, board) ? [getCornerPositions(board)[playerId]] :
    validMovePositions(playerId, board);
}

function findAvailableMoves(playerId, pieces, board) {
  const place = getPlacementFunction(pieces, board);
  const results = [];
  const availableCells = findAvailableCells(playerId, board);
  let maxAvailPieceNumCells = Math.max(...pieces.map(p => p.numCells));
  while (!results.length) {
    availableCells.forEach(position => {
      const { row, col } = position;
      [...pieces]
      .filter(p => p.numCells === maxAvailPieceNumCells)
        .forEach(piece => {
          const pieceWidth = piece.shape.length;
          const pieceHeight = piece.shape[0].length
          for (let i = 0; i < pieceWidth; i++) {
            for (let j = 0; j < pieceHeight; j++) {
              for (let k = 0; k < 4; k++) {
                for (let l = 0; l < 2; l++) {
                  const placement = {
                    player: playerId,
                    piece: piece.id,
                    rotations: k,
                    flipped: l === 1,
                    position: {
                      row: row + i,
                      col: col + j
                    },
                    probe: true
                  }
                  const placementResult = place(placement);
                  if (placementResult.success) {
                    placement.positions = placementResult.positions;
                    results.push(placement);
                  }
                }
              }
            }
          }
          for (let i = 0; i < pieceWidth; i++) {
            for (let j = 0; j < pieceHeight; j++) {
              for (let k = 0; k < 4; k++) {
                for (let l = 0; l < 2; l++) {
                  const placement = {
                    player: playerId,
                    piece: piece.id,
                    rotations: k,
                    flipped: l === 1,
                    position: {
                      row: row + (i * -1),
                      col: col + (j * -1)
                    },
                    probe: true
                  }
                  const placementResult = place(placement);
                  if (placementResult.success) {
                    placement.positions = placementResult.positions;
                    results.push(placement);
                  }
                }
              }
            }
          }
        });
    });
    maxAvailPieceNumCells--;
    if (maxAvailPieceNumCells <= 0) {
      return results;
    }
  }
  return results;
}

function blockScore(player, prevBoard, currBoard) {
  return findNumBlocks(player, currBoard) - findNumBlocks(player, prevBoard);
}

function evaluateMove(move, board) {
  const testBoard = applyMoveToBoard(move, board);
  let score = scoreByNumCellsAvailableForMove(move.player, testBoard);
  if (move.player === 0) {
    const blockage = blockScore(move.player, board, testBoard);
    score += Math.abs(blockage);
  }
  return Object.assign({}, move, { score });
}

function scoreByNumCellsAvailableForMove(player, board) {
  let score = validMovePositions(player, board).length;
  // if (player === 0) {
  //   const occupiedAdjacents = opponentOccupiedAdjacents(player, board);
  //   const occupiedDiagonals = opponentOccupiedDiagonals(player, board);
  //   score += occupiedAdjacents.length;
  //   score += (occupiedDiagonals.length * 2);
  // } else {
  //
  // }
  return score;
}

function findBestMove(playerId, pieces, board) {
  const availMoves = findAvailableMoves(playerId, pieces, board);
  const scoredMoves = availMoves.map(move => evaluateMove(move, board));
  const bestScore = Math.max(...scoredMoves.map(move => move.score));
  const filteredMoves = scoredMoves.filter(move => move.score === bestScore);
  process.stdout.write(filteredMoves.length.toString());
  return { ...filteredMoves[Math.floor(Math.random() * filteredMoves.length)] }
  // return scoredMoves.reduce((max, curr) => (max.score > curr.score ? max : curr), {});
}

function applyMoveToBoard(move, board) {
  const newBoard = clone(board);
  const { player, positions } = move;
  positions.forEach(position => {
    const { row, col } = position;
    newBoard[row][col] = player;
  });
  return newBoard;
}



module.exports = {
  findAvailableCells,
  findAvailableMoves,
  findBestMove
}
