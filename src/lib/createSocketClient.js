import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

const createSocketClient = () => {
  return io(SOCKET_SERVER_URL, {
    transports: ["websocket"],
  });
};

export default createSocketClient;
