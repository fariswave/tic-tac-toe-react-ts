import { useState } from "react";

type SquareValue = "X" | "O" | "";
type MoveHistory = {
  squares: SquareValue[];
  location?: string;
};
type WinningSquares = {
  winningIndices: Array<number>;
  winningSquares: string;
};

type MoveListProps = {
  history: { squares: string[]; location?: string }[];
  currentMove: number;
  jumpTo: (move: number) => void;
  ascendingOrder: boolean;
};

export default function Game() {
  const [history, setHistory] = useState<MoveHistory[]>([
    { squares: Array(9).fill("") },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [winningSquares, setWinningSquares] = useState<WinningSquares>({
    winningIndices: [],
    winningSquares: "",
  });

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const getSquareLocation = (index: number) => {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    return `row ${row}, column ${col}`;
  };

  function handleWinning(
    winningIndices: Array<number>,
    winningSquares: string
  ) {
    setWinningSquares({ winningIndices, winningSquares });
  }
  function handlePlay(nextSquares: SquareValue[], squareIndex: number) {
    const location = getSquareLocation(squareIndex);

    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, location },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    const nextMoveSquares = history[nextMove].squares;
    const nextMoveWinner = calculateWinner(nextMoveSquares);
    if (nextMoveWinner) {
      setWinningSquares({
        winningIndices: nextMoveWinner.winningIndices,
        winningSquares: nextMoveWinner.winningSquares,
      });
    } else {
      setWinningSquares({ winningIndices: [], winningSquares: "" });
    }

    setCurrentMove(nextMove);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares.squares}
          onPlay={handlePlay}
          onWin={handleWinning}
          winningSquares={winningSquares}
        />
      </div>
      <div className="game-info">
        <MoveList
          history={history}
          currentMove={currentMove}
          jumpTo={jumpTo}
          ascendingOrder={ascendingOrder}
        />{" "}
        <button onClick={() => setAscendingOrder(!ascendingOrder)}>
          Toggle Move Order
        </button>
      </div>
    </div>
  );
}

function Square({
  index,
  value,
  onSquareClick,
  style,
}: {
  index: number;
  value: string;
  onSquareClick: () => void;
  style: React.CSSProperties;
}) {
  return (
    <button
      id={"square" + String(index)}
      className="square"
      onClick={onSquareClick}
      style={style}
    >
      {value}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
  onWin,
  winningSquares,
}: {
  xIsNext: boolean;
  squares: SquareValue[];
  onPlay: (nextSquares: SquareValue[], squareIndex: number) => void;
  onWin: (winningIndices: Array<number>, winningSquares: string) => void;
  winningSquares: WinningSquares;
}) {
  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }

    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    onPlay(nextSquares, i);
    const winningSquares = calculateWinner(nextSquares);

    if (winningSquares) {
      onWin(winningSquares.winningIndices, winningSquares.winningSquares);
    }
  }

  let status;

  function isFilled(squares: string[]): boolean {
    return squares.every((square) => square !== "");
  }

  if (winningSquares.winningSquares) {
    status = "Winner: " + winningSquares.winningSquares;
  } else if (isFilled(squares)) {
    status = "Tie";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function highlightWinningSquares(squareIndex: number) {
    if (winningSquares && winningSquares.winningIndices.includes(squareIndex)) {
      return { backgroundColor: "green" };
    }
    return {};
  }

  const renderSquare = (index: number) => (
    <Square
      index={index}
      value={squares[index]}
      onSquareClick={() => handleClick(index)}
      style={highlightWinningSquares(index)}
    />
  );

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </>
  );
}

function MoveList({
  history,
  currentMove,
  jumpTo,
  ascendingOrder,
}: MoveListProps) {
  const moves = history.map((step, move) => {
    const isCurrentMove = move === currentMove;
    const description =
      move === 0
        ? "Go to game start"
        : isCurrentMove
        ? `You are at move #${move}${step.location && ` (${step.location})`}`
        : `Go to move #${move} (${step.location})`;

    return (
      <li key={move}>
        {isCurrentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  return (
    <ol className="move-list">
      {ascendingOrder ? moves : moves.slice().reverse()}
    </ol>
  );
}

function calculateWinner(squares: string[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winningSquares;

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      winningSquares = { winningIndices: lines[i], winningSquares: squares[a] };
    }
  }
  return winningSquares;
}
