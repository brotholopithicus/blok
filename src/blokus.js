const {
  processOptions,
  generatePieces,
  generateBoard
} = require('./init');

const getPlacementFunction = require('./actions');

function Blokus(options = {}) {
  const { height, width, players } = processOptions(options);
  this.players = players;
  this.pieces = generatePieces();
  this.board = generateBoard(height, width);
  this.action = getPlacementFunction(this.pieces, this.board);
  this.turns = [];

}
Blokus.prototype.currentPlayer = function() {
  if (this.players.every(player => player.hasPassed)) {
    return null;
  }
  let playerId = this.turns.length > 0 ?
    (this.turns[this.turns.length - 1].player + 1) % 4 : 0;
  let player = this.players.find(p => p.id === playerId);

  while (player.hasPassed) {
    playerId = (playerId + 1) % 4;
    player = this.players.find(p => p.id === playerId);
  }
  return player;
}
Blokus.prototype.availablePieces = function(playerId) {
  return [...this.pieces]
    .filter(piece => !piece.used && piece.player === playerId);
}
Blokus.prototype.place = function({
  player = null,
  piece,
  flipped = false,
  rotations = 0,
  position,
  probe = false,
  _isPass = false
}) {
  if (player && !probe) {
    return { success: false, message: 'Turn Probe On If Specifying Player' }
  }
  player = player ? player : this.currentPlayer().id;

  const placement = {
    player,
    piece,
    flipped,
    rotations,
    position,
    probe,
    isPass: _isPass
  };

  const placementResult = _isPass ? { success: true, message: 'Pass' } :
    this.action(placement);

  if (!probe && placementResult.success) {
    this.turns = [...this.turns].concat([Object.assign({}, placement)]);
  }
  return placementResult;
}

Blokus.prototype.pass = function() {
  const currentPlayer = this.currentPlayer();
  const placement = { piece: null, flipped: null, rotations: null, position: null, _isPass: true };
  const placementResult = this.place(placement);
  this.players.find(player => player.id === currentPlayer.id)
    .hasPassed = true;
  return placementResult;
}

Blokus.prototype.isOver = function() {
  return !this.currentPlayer();
}
module.exports = Blokus;
