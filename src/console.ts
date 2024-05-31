import WebSocket from "ws";
import { time } from "organ";

export class Console {
  socket?: WebSocket;

  constructor() {
    console.clear();
    console.log("#####     ass connect     #####");

    process.stdin.resume();
    process.stdin.on("data", (data) => {
      const cmd = data.toString().trim();

      if (cmd === "exit") {
        process.exit(0);
      }

      // time("Nie wiem co powiedzieć");
    });
  }

  onError(error) {
    time(`WebSocket error: ${error.message}`);
  }

  onData(data) {
    time(data);
  }

  onOpen(url) {
    time("connected " + url);
  }

  onClose(url) {
    const delay = 4;

    setTimeout(() => this.connect(url), 1000 * delay);
  }

  connect(url: string) {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(url);

    this.socket.onclose = this.onClose.bind(this, url);
    this.socket.onmessage = this.onData.bind(this);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onopen = this.onOpen.bind(this);
  }
}
