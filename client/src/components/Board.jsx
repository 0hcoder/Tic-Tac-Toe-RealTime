import { useEffect, useState } from "react";
import SocketIO from "socket.io-client";
import { toast } from "react-hot-toast";
import Menu from "./Menu";
import { FaCopy } from "react-icons/fa";

const io = SocketIO("http://localhost:5000");

const intialBoard = Array(9).fill(null);

const Board = () => {
  const [board, setBoard] = useState(intialBoard);
  const [roomId, setRoomId] = useState(null);
  const [joined, setJoined] = useState(false);
  const [player, setPlayer] = useState(null);
  const [xTurn, setXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winingLine, setWinningLine] = useState(null);
  const createRoom = () => {
    io.emit("createRoom", (roomId) => {
      setRoomId(roomId);
      setJoined(true);
      setPlayer("X");
      toast.success("Room created successfully");
    });
  };
  const joinRoom = (roomId) => {
    const id = prompt("Enter room ID to join:");
    if (!id.trim()) {
      toast.error("Room ID cannot be empty");
      return;
    }
    io.emit("joinRoom", id, (response) => {
      if (response.success) {
        setRoomId(id);
        setJoined(true);
        setPlayer("O");
        toast.success("Joined room successfully");
      } else {
        toast.error("Failed to join room");
      }
    });
  };
  const isMyTurn = () => {
    return (xTurn && player === "X") || (!xTurn && player === "O");
  };
  const checkWinner = (newBoard) => {
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
      const [a, b, c] = line;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        setWinner(newBoard[a]);
        setWinningLine(line);
        toast.success(`Player ${newBoard[a]} wins!`);
        return;
      }
    }
  };
  const handelCellClick = (index) => {
    if (board[index] || !isMyTurn() || winner) return;
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);
    io.emit("makeMove", { roomId, index, player: player });
    checkWinner(newBoard);
    setXTurn(!xTurn);
  };
  useEffect(() => {
    io.on(`opponentMove`, (data) => {
      const { index, player } = data;
      if (board[index] || winner) return;
      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);
      checkWinner(newBoard);
      setXTurn(!xTurn);
    });
    return () => io.off(`opponentMove`);
  }, [board, xTurn]);

  const copyRoomId = () => {
    if (!roomId) {
      toast.error("No room ID to copy");
      return;
    }

    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard");
  };

  const handleRemetch = (data) => {
    setBoard(intialBoard);
    setRoomId(null);
    setJoined(false);
    setPlayer(null);
    setXTurn(true);
    setWinner(null);
    setWinningLine(null);
    io.emit("rematch", roomId);
  };
  useEffect(() => {
    io.on("rematch", () => {
      setBoard(intialBoard);
      setRoomId(data.roomId);
      setJoined(true);
      setPlayer(data.player);
      setXTurn(data.player === "X");
      setWinner(null);
      setWinningLine(null);
      toast.success("Rematch started");
    });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen bg-[#101029] text-white">
      <h1 className="text-4xl font-semibold mb-6 drop-shadow-lg">
        Tic Tac Toe
      </h1>
      {!joined ? (
        <Menu createRoom={createRoom} joinRoom={joinRoom} />
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-6">
            <span className="font-mono text-lg text-gray-800 bg-white px-3 py-1 rounded-lg shadow-lg">
              Room: {roomId}
            </span>
            <FaCopy
              onClick={copyRoomId}
              className="cursor-pointer text-xl text-yellow-300 hover:text-yellow-900"
            />
          </div>
          {/* Board ka Code  */}
          <div className="grid  grid-cols-3 gap-4">
            {board.map((cell, idx) => {
              return (
                <button
                  key={idx}
                  onClick={() => handelCellClick(idx)}
                  className={`w-24 h-24 text-3xl font-bold flex items-center justify-center bg-white text-gray-800 shadow-lg rounded-lg ${
                    winingLine?.includes(idx)
                      ? "bg-yellow-300 text-yellow-900"
                      : ""
                  } ${
                    !isMyTurn() || cell || winner
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:scale-105 transform transition-all "
                  }`}
                  disabled={!isMyTurn() || cell || winner}
                >
                  {cell}
                </button>
              );
            })}
          </div>
          {winner ||
            (board.every((cell) => cell) && (
              <button
                onClick={handleRemetch}
                className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-white"
              >
                Rematch
              </button>
            ))}
          {!isMyTurn() && !winner && board.every((cell) => cell) && (
            <p className="mt-6 text-lg text-gray-200"> Waiting for opponent's move...</p>
          )}
        </>
      )}
    </div>
  );
};

export default Board;
