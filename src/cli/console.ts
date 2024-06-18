import { time } from "@vivotech/out";
import WebSocket from "ws";

export function ui(name: string) {
  console.clear();
  console.log(`#####     ${name}     #####`);
}

export class Console {
  socket?: WebSocket;

  constructor() {
    ui("ass connect");

    process.stdin.resume();
    process.stdin.on("data", (data) => {
      const cmd = data.toString().trim();

      if (cmd === "exit") {
        process.exit(0);
      } else {
        this.send(cmd);
      }

      // time("Nie wiem co powiedzieć");
    });
  }

  send(command: string) {
    this.socket?.send(
      JSON.stringify({
        command,
      })
    );
  }

  onError(url, error) {
    time(`WebSocket error: ${error.message}`);
  }

  onData(url, ev: MessageEvent) {
    const json = ev.data.toString().trim();
    const response = JSON.parse(json);

    time(response.text);
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

    this.socket.onerror = (error) => this.onError(url, error);
    this.socket.onmessage = (data) => this.onData(url, data);
    this.socket.onopen = () => this.onOpen(url);
    this.socket.onclose = () => this.onClose(url);
  }
}
