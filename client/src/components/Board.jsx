import {useEffect, useState } from "react"
import SocketIO from "socket.io-client";
import{toast} from "react-hot-toast"; 
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

  return (
    <div>Borde</div>
  )
}

export default Board