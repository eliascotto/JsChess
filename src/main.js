const getRandom = (min, max) => Math.floor(Math.random() * (max - min) + min);

const getArrayRandom = (array) => array[getRandom(0, array.length)];

const randomMove = () => {
  const moves = game.moves();
  return getArrayRandom(moves);
};

const evaluateBoard = (game) => {
  // Piceses value
  // Setting piece values I wanted to achieve several results:
  // 1. Avoid exchanging one minor piece for three pawns.
  // 2. Encourage the engine to have the bishop pair.
  // 3. Avoid exchanging of two minor pieces for a rook and a pawn.
  // 4. Stick to human chess experience.
  const values = {
    'p': 100,
    'n': 320,
    'b': 330,
    'r': 500,
    'q': 900,
    'k': 20000,
  };
  const board = game.board();

  const pawnsSquares = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5,-10, 0, 0,-10, -5, 5],
    [5, 10, 10,-20,-20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const knightsSquares = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20, 0, 0, 0, 0,-20,-40],
    [-30, 0, 10, 15, 15, 10, 0,-30],
    [-30, 5, 15, 20, 20, 15, 5,-30],
    [-30, 0, 15, 20, 20, 15, 0,-30],
    [-30, 5, 10, 15, 15, 10, 5,-30],
    [-40,-20, 0, 5, 5, 0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ];

  const bishopsSquares = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10, 0, 0, 0, 0, 0, 0,-10],
    [-10, 0, 5, 10, 10, 5, 0,-10],
    [-10, 5, 5, 10, 10, 5, 5,-10],
    [-10, 0, 10, 10, 10, 10, 0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10, 5, 0, 0, 0, 0, 5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ];

  const rooksSquares = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ];

  const queenSquares = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10, 0, 0, 0, 0, 0, 0,-10],
    [-10, 0, 5, 5, 5, 5, 0,-10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0,-10],
    [-10, 0, 5, 0, 0, 0, 0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-2],
  ];

  const kingSquares = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 2],
  ];

  const piecesSquares = {
    'p': pawnsSquares,
    'n': knightsSquares,
    'b': bishopsSquares,
    'r': rooksSquares,
    'q': queenSquares,
    'k': kingSquares,
  };

  const evaluatePiece = (piece, i, j) => {
    if (piece == null) {
      return 0; // empty cell
    } else {
      const getSquareValuation = (piece, i, j) => {
        const squares = piecesSquares[piece.type];
        return piece.color == 'w' ? squares[i][j] : squares[7-i][j];
      };
      const value = values[piece.type] + getSquareValuation(piece, i, j);                 // piece value
      const mult = piece.color == orientation ? 1 : -1; // -value if player color or value
      return value * mult;
    }
  };

  let boardEvaluation = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      boardEvaluation += evaluatePiece(board[i][j], i, j);
    }
  }

  return boardEvaluation;
};

const minimax = (game, depth, maximizingPlayer) => {
  if (depth === 0) {
    return -evaluateBoard(game);
  }

  const moves = game.moves();
  if (maximizingPlayer) {
    let value = -9999;

    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      value = Math.max(value, minimax(game, depth - 1, false));
      game.undo();
    }
    return value;
  } else {
    let value = 9999;

    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      value = Math.min(value, minimax(game, depth - 1, true));
      game.undo();
    }
    return value;
  }
};

const alphabeta = (game, depth, alpha, beta, maximizingPlayer) => {
  if (depth === 0) {
    return -evaluateBoard(game);
  }

  const moves = game.moves();
  if (maximizingPlayer) {
    let value = -9999;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      value = Math.max(value, alphabeta(game, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, value);
      game.undo();

      if (alpha >= beta) {
        break;
      }
    }
    return value;
  } else {
    let value = 9999;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      value = Math.min(value, alphabeta(game, depth - 1, alpha, beta, true));
      alpha = Math.min(alpha, value);
      game.undo();

      if (alpha >= beta) {
        break;
      }
    }
    return value;
  }
};

const evaluatedMove = (cb) => {
  const moves = game.moves();
  const movesEvaluated = [];  // array of { move, evaluation }

  moves.forEach(move => {
    game.move(move);

    const boardValue = cb(game); // use algorithm callback
    movesEvaluated.push({
      move,
      value: boardValue,
    });

    game.undo();
  });

  // get the best move value
  const maxValue = movesEvaluated.reduce((prev, curr) => (prev.value > curr.value) ? prev : curr);
  // filter all the move same as best value
  const filteredMoves = movesEvaluated.filter(m => m.value >= maxValue.value);
  // randomly choose one of the best moves
  return getArrayRandom(filteredMoves).move;
};

const makeMove = () => {
  const newMove = evaluatedMove((game) => {
    // return -evaluateBoard(game);
    // return minimax(game, 1, false);
    return alphabeta(game, 2, -9999, 9999, false);
  });
  game.move(newMove);

  board.position(game.fen());

  if (game.game_over()) {
    alert('Game over');
  }
};

const onDrop = (source, target, piece, newPos, oldPos, orientation) => {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q',
  });

  if (move == null) {
    return 'snapback';
  }

  if (game.game_over()) {
    alert('Game over');
  } else {
    window.setTimeout(makeMove, 250);
  }
};

let game, board, orientation;

game = new Chess();

const startGame = (isBlack = false) => {
  const boardConfig = {
    draggable: true,
    position: 'start',
    orientation: isBlack ? 'black' : 'white',
    onDrop,
  };

  game.reset();
  board = Chessboard('board', boardConfig);

  if (isBlack) {
    orientation = 'b';
    makeMove();
  } else {
    orientation = 'w';
  }
};

window.onload = () => startGame();
