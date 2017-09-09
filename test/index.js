#!/usr/bin/env node

const chalk = require('chalk');

const Blokus = require('../src/blokus');
const robot = require('../src/robot');

console.reset = function() {
  return process.stdout.write('\x1Bc');
}

function runSim() {
  let scores;
  let g = new Blokus();
  let count = 0;
  while (!g.isOver()) {
    console.time('roundTime');
    const playerId = g.currentPlayer().id;
    const availPieces = g.availablePieces(playerId);
    const board = [...g.board];
    const bestMove = robot.findBestMove(playerId, availPieces, board);
    if (Object.keys(bestMove).length) {
      const { piece, flipped, rotations, position } = bestMove;
      g.place({ piece, flipped, rotations, position });
    } else {
      g.pass();
    }
    count++;
    let round = Math.floor(count / 4);
    console.reset();
    process.stdout.write('\n');
    board.forEach(row => {
      row.forEach(col => {
        let msg = '  ';
        switch (col) {
          case 0:
            msg = chalk.bgBlue(msg);
            break;
          case 1:
            msg = chalk.bgYellow(msg);
            break;
          case 2:
            msg = chalk.bgGreen(msg);
            break;
          case 3:
            msg = chalk.bgRed(msg);
            break;
          default:
            msg = chalk.bgBlack(msg);
            break;
        }
        process.stdout.write(msg);
      });
      process.stdout.write('\n');
    });
    const msg = chalk.bold.blue(`Round: ${round}`);
    console.log(msg);
    scores = [...Array(4).keys()].map(playerId => {
      const score = g.availablePieces(playerId).reduce((acc, curr) => (acc += curr.numCells), 0);
      console.log(`Player ${playerId + 1}: ${score}pts`);
      return {
        id: playerId,
        player: `PLAYER ${playerId + 1}`,
        score
      }
    });
    console.timeEnd('roundTime');
    console.log('\n');
  }
  console.log('GAMEOVER');
  return scores;
}


function testPieces() {
  let g = new Blokus();
  console.log(g.pieces.length);
}

function test() {
  let results = [];
  let rounds = 100;
  for (let i = 0; i < rounds; i++) {
    let score = runSim();
    results.push(score)
  }
  const avgs = Array(4).fill(0);
  results.forEach((r, i) => {
    r.forEach((s, j) => {
      avgs[j] += s.score;
    });
  });
  const e = avgs.map((a, i) => {
    return {
      id: i,
      score: a / rounds
    }
  });
  console.log(chalk.yellow(`Avg. Scores For ${rounds} round(s):`));
  e.forEach(o => {
    console.log(`PLAYER ${o.id + 1} ${o.score}pts`);
  })
}
console.time('total');
test();
console.timeEnd('total');
