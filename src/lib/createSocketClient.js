import { io } from "socket.io-client";

const createSocketClient = () => {
  return io(SOCKET_SERVER_URL, {
    transports: ["websocket"],
  });
};

export default createSocketClient;
