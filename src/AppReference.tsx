import { useState } from "react";

export default function Game() {
  const [history, setHistory] = useState<Array<Array<string>>>([Array(9).fill("")]);
  const [currentMove, setCurrentMove] = useState(0);
  const [currentSquareLocation, setCurrentSquareLocation] = useState('');

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: string[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const prevSquares= history[currentMove];
    function findCurrentSquareIndex(prevSquares: string[], nextSquares: string[]): number | null {
      for (let i = 0; i < prevSquares.length; i++) {
        if (prevSquares[i] !== nextSquares[i]) {
          return i;
        }
      }
      return null;
    }
    
    const currentSquareIndex = findCurrentSquareIndex(prevSquares, nextSquares);
    let currentSquareLocation = '';

    switch (currentSquareIndex) {
      case 0: currentSquareLocation = "row 1, column 1"; break;
      case 1: currentSquareLocation = "row 1, column 2"; break;
      case 2: currentSquareLocation = "row 1, column 3"; break;
      case 3: currentSquareLocation = "row 2, column 1"; break;
      case 4: currentSquareLocation = "row 2, column 2"; break;
      case 5: currentSquareLocation = "row 2, column 3"; break;
      case 6: currentSquareLocation = "row 3, column 1"; break;
      case 7: currentSquareLocation = "row 3, column 2"; break;
      case 8: currentSquareLocation = "row 3, column 3"; break;
      default: currentSquareLocation = "unknown";
    }

    setCurrentSquareLocation(currentSquareLocation);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const currentHistory = history.slice(0, currentMove + 1);
  const moves = currentHistory.map((_, move) => {
    let previousMovesDescription;
    let latestMoveDescription;
    let gameStartDescription;
    if (move == 0) {
      gameStartDescription = 'Go to game start';
      return (
        <li key={move}>
        <button onClick={() => jumpTo(move)}>{gameStartDescription}</button>
        </li>
      )
    } else if (move > 0 && move < currentHistory.length - 1) {
      previousMovesDescription = 'Go to move#' + move;
    } else {
      latestMoveDescription = "You're at move#" + move;
      return (
        <li key={move}>
          <p>{latestMoveDescription} {currentSquareLocation}</p>
        </li>
      )
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{previousMovesDescription} {currentSquareLocation}</button>
      </li>
    );
  });

  const reversedMoves = moves.slice().reverse();

  function orderMoves() {
    const moveList = document.querySelector<HTMLElement>('.move-list');
    const reversedMoveList = document.querySelector<HTMLElement>('.reversed-move-list');
    moveList!.style.display = moveList!.style.display === 'none' ? '' : 'none';
    reversedMoveList!.style.display = reversedMoveList!.style.display === 'none' ? '' : 'none';
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol className="move-list">{moves}</ol>
        <ol className="reversed-move-list" style={{display: 'none'}}>{reversedMoves}</ol>
        <button onClick={orderMoves}>Order moves</button>
      </div>
    </div>
  );
}

function Square({ index, value, onSquareClick }: { index: number; value: string; onSquareClick: () => void }) {
  return (
    <button id={'square' + String(index)} className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }: { xIsNext: boolean; squares: string[]; onPlay: (nextSquares: string[]) => void }) {
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

    onPlay(nextSquares);
  }

  let status;

  function isFilled(squares: string[]): boolean {
    return squares.every(square => square !== "");
  }

  if (calculateWinner(squares)) {
    status = "Winner: " + calculateWinner(squares);
  } else if (isFilled(squares)) {
    status = "Tie";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const renderSquare = (index: number) => (
    <Square index={index} value={squares[index]} onSquareClick={() => handleClick(index)} />
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

function calculateWinner(squares: string[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      const winningSquares = document.querySelectorAll(`#square${a}, #square${b}, #square${c}`) as NodeListOf<HTMLElement>;
      winningSquares.forEach(square => square.style.background = 'grey');
      return squares[a];
    }
  }

  return null;
}