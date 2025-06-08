import { useEffect, useState } from "react";
import SocketIO from "socket.io-client";
import { toast } from "react-hot-toast";
const io = SocketIO("http://localhost:3000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  query: {
    token: localStorage.getItem("token"),
  },
});

const intialBoard = Array(9).fill(null);

const Board = () => {
  const [board, setBoard] = useState(intialBoard);
  const [roomId, setRoomId] = useState(null);
  const [joined, setJoined] = useState(false);
  const [payer, setPlayer] = useState(null);
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
        setRoomId(roomId);
        setJoined(true);
        setPlayer("O");
        toast.success("Joined room successfully");
      } else {
        toast.error("Failed to join room");
      }
    });
  };
  const isMyTurn = () => {
    return (xTurn && payer === "X") || (!xTurn && payer === "O");
  };
  const checkWinner=(newBoard) => {
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
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinner(newBoard[a]);
        setWinningLine(line);
        toast.success(`Player ${newBoard[a]} wins!`);
        return;
      }
    } 
  }
  const handelCellClick = (index) => {
    if (board[index] || !isMyTurn() || winner) return;
    const newBoard = [...board];
    newBoard[index] = payer;
    setBoard(newBoard);
    io.emit("makeMove", { roomId, index, player: payer });
    checkWinner(newBoard);
    setXTurn(!xTurn);
  };
  useEffect(() => {
   
    SocketIO.on(`opponentMove`)
  }, [board,xTurn,player,winner]);
  

  return <div>Borde</div>;
};

export default Board;
