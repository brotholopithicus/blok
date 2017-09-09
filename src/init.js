const pieces = require('./pieces');


function processOptions({ height = 20, width = 20, players = [] }) {
  players = [...Array(4).keys()].map(playerId => {
    return {
      id: playerId,
      name: players[playerId] || `Player ${playerId}`,
      hasPassed: false
    }
  });
  return { height, width, players };
}

function generatePieces() {
  return [...Array(4).keys()].reduce((curr, playerId) => {
    const playerPieces = [...pieces].map((piece, pieceId) => {
      return Object.assign({}, piece, { id: pieceId, player: playerId, used: false });
    });
    return curr.concat([...playerPieces]);
  }, []);
}

function generateBoard(height = 20, width = 20) {
  const board = [];
  for (let i = 0; i < height; i++) {
    board[i] = [];
    for (let j = 0; j < width; j++) {
      board[i][j] = null;
    }
  }
  return board;
}

module.exports = {
  processOptions,
  generatePieces,
  generateBoard
}
