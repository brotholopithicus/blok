function validMovePositions(playerId, board) {
  let availableCells = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === playerId) {
        const position = { row: i, col: j };
        availableCells = availableCells.concat(
          getDiagonalPositions(position)
          .filter(d => !isOutOfBounds(d, board) &&
            board[d.row][d.col] === null &&
            getAdjacentPositions(d)
            .filter(adj => !isOutOfBounds(adj, board))
            .every(adj => board[adj.row][adj.col] !== playerId))
        );
      }
    }
  }
  return availableCells;
}

function findNumBlocks(playerId, board) {
  return [...Array(4).keys()]
    .filter(k => k !== playerId)
    .map(player => validMovePositions(player, board))
    .reduce((a, b) => (a.concat(b)), []).length;
}

function occupiedByOpponent(position, playerId, board) {
  const { row, col } = position;
  return !isOutOfBounds(position, board) &&
    board[row][col] !== null &&
    board[row][col] !== playerId;
}

function opponentOccupiedAdjacents(playerId, board) {
  return playerOccupiedCells(playerId, board)
    .map(p => getAdjacentPositions(p)
      .filter(adj => occupiedByOpponent(adj, playerId, board))
    ).reduce((a, b) => (a.concat(b)), []);
}

function opponentOccupiedDiagonals(playerId, board) {
  return playerOccupiedCells(playerId, board)
    .map(p => getDiagonalPositions(p)
      .filter(d => occupiedByOpponent(d, playerId, board))
    ).reduce((a, b) => (a.concat(b)), []);
}

function playerOccupiedCells(playerId, board) {
  let result = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === playerId) {
        result.push({ row: i, col: j });
      }
    }
  }
  return result;
}

function getShapePositions(shape, position) {
  const shapePositions = [];
  let leftCol = null;
  shape.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
    if (cell === 'X') {
      if (leftCol === null) {
        leftCol = position.col - colIdx;
      }
      shapePositions.push({
        row: position.row + rowIdx,
        col: leftCol + colIdx
      });
    }
  }));
  return shapePositions;
}

function getCornerPositions(board) {
  const height = board.length;
  const width = board[0].length;
  return [
    { row: 0, col: 0 },
    { row: 0, col: width - 1 },
    { row: height - 1, col: width - 1 },
    { row: height - 1, col: 0 }
  ]
}

function getAdjacentPositions(position) {
  const { row, col } = position;
  return [
    { row, col: col + 1 },
    { row, col: col - 1 },
    { row: row + 1, col },
    { row: row - 1, col }
  ];
}

function getDiagonalPositions(position) {
  const { row, col } = position;
  return [
    { row: row + 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row - 1, col: col - 1 }
  ];
}

function isAdjacentToPlayer(position, board, playerId) {
  const adjacentPositions = getAdjacentPositions(position);
  return adjacentPositions.some(pos => !isOutOfBounds(pos, board) && board[pos.row][pos.col] === playerId);
}

function isDiagonalToPlayer(position, board, playerId) {
  const diagonalPositions = getDiagonalPositions(position);
  return diagonalPositions.some(pos => !isOutOfBounds(pos, board) && board[pos.row][pos.col] === playerId);
}

function isOutOfBounds(position, board) {
  const { row, col } = position;
  const height = board.length;
  const width = board[0].length;
  return row < 0 || col < 0 || row >= height || col >= width;
}

function isTaken(position, board) {
  return !isOutOfBounds(position, board) && board[position.row][position.col] !== null;
}

function isFirstTurn(playerId, board) {
  const { row, col } = getCornerPositions(board)[playerId];
  return !board.some(row => row.some(col => col === playerId));
}

function isInCorner(position, board) {
  const cornerPositions = getCornerPositions(board);
  return cornerPositions.some(pos => pos.row === position.row && pos.col === position.col);
}

function positionInCorrectCorner(position, board, playerId) {
  const cornerPositions = getCornerPositions(board);
  const { row, col } = cornerPositions[playerId];
  return position.some(pos => row === pos.row && col === pos.col);
}

module.exports = {
  getShapePositions,
  getCornerPositions,
  getDiagonalPositions,
  getAdjacentPositions,
  isDiagonalToPlayer,
  isAdjacentToPlayer,
  isOutOfBounds,
  isTaken,
  isFirstTurn,
  isInCorner,
  positionInCorrectCorner,
  validMovePositions,
  opponentOccupiedAdjacents,
  opponentOccupiedDiagonals,
  findNumBlocks
}
