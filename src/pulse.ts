import { Artery } from "@vivotech/artery";
import { readdir } from "fs/promises";
import { Arteries } from "./arteries";
import { Services } from "./services";
import { send } from "./socket";

export class Pulse extends Artery {
  services = new Services(this);
  arteries = new Arteries(this);

  cwd() {
    return readdir(process.cwd());
  }

  constructor() {
    super({
      statics: [],
    });

    this.services
      .check()
      .then(() => this.arteries.provideServices(this.services.list));

    this.wss.on("connection", (socket) => {
      socket.on("message", (data) => {
        const json = data.toString().trim();
        const response = JSON.parse(json);

        switch (response.command) {
          default:
            return send(socket, {
              text: "Hęęę??! - jeszcze nie potrafię odpowiedzieć :c",
            });
        }
      });
    });
  }
}

/*
  #todo() {
    time("[x] check available services");
    time("[x] need to can create new services");
    time("[ ] some cli for creating projects");

    time("[ ] interface for viewing services");
    time("[ ] connect with compact db service (memory)");

    time("[ ] can list available services (with socket updates)");
    time("[ ] can stop/start service");
  }
*/
