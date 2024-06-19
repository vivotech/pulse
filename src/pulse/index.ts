import { Artery } from "@vivotech/artery/dist/core";
import { readdir } from "fs/promises";
import { Arteries } from "../artery/arteries";
import { Services } from "../service/services";
import { send } from "./socket";
import { SharedDirectory } from "../memory/shared-directory";
import { install } from "../install/toInstall";

export class Pulse extends Artery {
  dir = new SharedDirectory("/home/.debi");

  services = new Services(this);
  arteries = new Arteries(this);

  cwd() {
    return readdir(process.cwd());
  }

  constructor() {
    super({
      statics: ["/home/dev/sources/pulse-ui/dist/browser"],
    });

    install(
      this,
      this.arteries.list.find(({ name }) => name === "@vivotech/pulse")
    );

    this.services.check().then((list) => this.arteries.provideServices(list));

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
