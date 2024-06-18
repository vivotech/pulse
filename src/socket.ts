export function send<Type = unknown>(socket: WebSocket, message: Type) {
  socket.send(JSON.stringify(message));
}
