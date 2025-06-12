import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaCopy } from "react-icons/fa";
import Menu from "./Menu";
import { toast } from "react-hot-toast";

const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL);

const initialBoard = Array(9).fill(null);

function Board() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [board, setBoard] = useState(initialBoard);
  const [player, setPlayer] = useState("");
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const createRoom = () => {
    socket.emit("createRoom", (id) => {
      setRoomId(id);
      setJoined(true);
      setPlayer("X");
    });
  };

  const joinRoom = () => {
    const id = prompt("Enter room ID:");
    if (!id === true || !id.trim()) {
      toast.error("Enter valid room id");
      return;
    }
    socket.emit("joinRoom", id, (res) => {
      if (res.success) {
        setRoomId(id);
        setJoined(true);
        setPlayer("O");
      } else {
        toast.error("Failed to join room");
      }
    });
  };

  const handleClick = (idx) => {
    if (!opponentJoined) {
      toast.error("Wait for opponent to join");
      return;
    }
    if (board[idx] || !isMyTurn() || winner) return;

    const newBoard = [...board];
    newBoard[idx] = player;
    setBoard(newBoard);
    socket.emit("makeMove", { roomId, index: idx, player });
    checkWinner(newBoard);
    setIsXTurn(!isXTurn);
  };

  const isMyTurn = () => {
    return (isXTurn && player === "X") || (!isXTurn && player === "O");
  };

  const checkWinner = (b) => {
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
    for (const line of lines) {
      const [a, bIdx, c] = line;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        setWinner(b[a]);
        setWinningLine(line);
        return;
      }
    }
  };

  useEffect(() => {
    socket.on("opponentMove", ({ index, player: p }) => {
      const newBoard = [...board];
      newBoard[index] = p;
      setBoard(newBoard);
      checkWinner(newBoard);
      setIsXTurn(!isXTurn);
    });

    return () => socket.off("opponentMove");
  }, [board, isXTurn]);

  const copyText = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard!");
  };

  const handleRematch = () => {
    setBoard(initialBoard);
    setWinner(null);
    setWinningLine([]);
    setIsXTurn(true);
    socket.emit("rematch", roomId);
  };

  useEffect(() => {
    socket.on("rematch", () => {
      setBoard(initialBoard);
      setWinner(null);
      setWinningLine([]);
      setIsXTurn(true);
      toast.success("Rematch started!");
    });
    return () => socket.off("rematch");
  }, []);

  useEffect(() => {
    socket.on("startGame", () => {
      setOpponentJoined(true);
      toast.success("Opponent joined. Game started!");
    });

    return () => socket.off("startGame");
  }, []);

  useEffect(() => {
    socket.on("opponentLeft", () => {
      toast.error("Opponent has left the game.");
      setJoined(false);
      setRoomId(null);
      setBoard(initialBoard);
      setPlayer(null);
      setIsXTurn(true);
      setWinner(null);
      setWinningLine([]);
    });

    return () => {
      socket.off("opponentLeft");
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-[#101029]
   text-white"
    >
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-lg">
        Tic Tac Toe
      </h1>
      {!joined ? (
        <Menu createRoom={createRoom} joinRoom={joinRoom} />
      ) : (
        <>
          {!opponentJoined && (
            <div className="flex items-center space-x-2 mb-6">
              <span className="font-mono text-lg bg-white text-gray-800 px-3 py-1 rounded-lg shadow">
                Room: {roomId}
              </span>
              <FaCopy
                className="cursor-pointer text-xl text-yellow-300 hover:text-yellow-900"
                onClick={copyText}
              />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                className={`w-24 h-24 text-3xl font-bold flex items-center justify-center bg-white text-gray-800 shadow-lg rounded-lg 
                  ${
                    winningLine.includes(idx)
                      ? "bg-yellow-300 text-yellow-900 "
                      : ""
                  }
                  ${
                    !isMyTurn() || cell || winner
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:scale-105 transform transition-all"
                  }`}
                disabled={!isMyTurn() || cell || winner}
              >
                {cell}
              </button>
            ))}
          </div>
          {winner && (
            <p className="mt-6 text-2xl font-bold text-yellow-300 ">
              {winner} wins!
            </p>
          )}

          {(winner || board.every((cell) => cell)) && (
            <button
              onClick={handleRematch}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-white"
            >
              Rematch
            </button>
          )}
          {!opponentJoined && (
            <p className="mt-4 text-red-400">Waiting for opponent to join...</p>
          )}

          {!isMyTurn() && !winner && !board.every((cell) => cell) && (
            <p className=" mt-6 text-lg text-gray-200">
              Waiting for opponent's move...
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Board;
