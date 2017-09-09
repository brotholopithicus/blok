const {
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
  positionInCorrectCorner
} = require('./utils');

const { rotate, flip } = require('./transform');

function getPlacementPositions(piece, flipped, rotations, position) {
  const { shape } = piece;
  const flippedShape = flipped ? flip(shape) : shape;
  const flippedRotatedShape = rotate(flippedShape, rotations);
  const placementPositions = getShapePositions(flippedRotatedShape, position);
  return placementPositions;
}

function validPosition(positions, board, playerId) {
  if (
    positions.some(position =>
      isOutOfBounds(position, board) ||
      isTaken(position, board) ||
      isAdjacentToPlayer(position, board, playerId)
    )
  ) {
    return {
      success: false,
      message: 'Invalid Position'
    };
  } else if (isFirstTurn(playerId, board)) {
    if (!positionInCorrectCorner(positions, board, playerId)) {
      return {
        success: false,
        message: 'Not In Correct Corner'
      }
    } else {
      return {
        success: true,
        message: 'FirstTurnAndPositionInCorrectCorner'
      }
    }
  } else if (!positions.some(position =>
      isDiagonalToPlayer(position, board, playerId)
    )) {
    return {
      success: false,
      message: 'Not Diagonal To Existing Piece'
    }
  } else {
    return {
      success: true,
      message: 'awesome sauce'
    }
  }
}

function getPlacementFunction(pieces, board) {
  return function placementFunction({
    player,
    piece,
    flipped = false,
    rotations = 0,
    position,
    probe = false
  }) {
    const matchingPiece = pieces.find(p => p.id === piece && p.player === player);
    if (!matchingPiece || matchingPiece.used) {
      return { success: false, message: 'Invalid Piece' };
    }
    const placementPositions = getPlacementPositions(matchingPiece, flipped, rotations, position);
    const isValid = validPosition(placementPositions, board, player);
    if (isValid.success) {
      if (!probe) {
        placementPositions.forEach(position => {
          const { row, col } = position;
          board[row][col] = player;
        });
        matchingPiece.used = true;
      }
      return { success: true, positions: placementPositions }
    } else {
      return { success: false, message: 'Placment Positions Invalid', isValid };
    }
  }
}

module.exports = getPlacementFunction;
