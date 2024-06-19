import { time } from "@vivotech/out";
import { bashAsync } from "../../../vivo/artery/src";
import { Pulse } from "../pulse/index";
import { ArteryService, Service } from "../service/index";
import { install } from "../install/toInstall";

export class Arteries {
  list: ArteryService[] = [
    {
      gitUrl: "git@github.com:vivotech/pulse.git",
      service: "pulse.service",
      name: "@vivotech/pulse",
      installed: null,
      enabled: null,
      active: null,
      port: 3963,
    },
    {
      gitUrl: "git@github.com:vivotech/shepheard.git",
      service: "shepheard.service",
      name: "@vivotech/shepheard",
      installed: null,
      enabled: null,
      active: null,
      port: 3964,
    },
    {
      gitUrl: "git@github.com:vivotech/memory.git",
      service: "memory.service",
      name: "@vivotech/memory",
      installed: null,
      enabled: null,
      active: null,
      port: 3965,
    },
  ];

  constructor(public pulse: Pulse) {
    this.#actions(pulse);
  }

  #actions(pulse: Pulse) {
    pulse.get("/arteries", async () => this.list);

    pulse.get("/artery", async (params, query) =>
      this.list.find(({ name }) => query.name === name)
    );

    pulse.post(
      "/install",
      async (params, query) => await this.install(pulse, query.name)
    );
  }

  async install(pulse: Pulse, name: string) {
    time(`install ${name}`);
    const service = this.list.find(({ service }) => name === service);

    if (service) {
      const i = await install(pulse, service);
    } else {
      time("Artery service not found");
    }
  }

  async download(artery: ArteryService) {
    const clone = await bashAsync("git", ["clone", artery.gitUrl], {
      cwd: "/home/vivo",
    });
  }

  provideServices(services: Service[]) {
    this.list.forEach((artery) => {
      const service = services.find((s) => s.service === artery.service);

      if (service) {
        artery.enabled = service.enabled;
        artery.active = service.active;
        artery.installed = true;

        this.pulse.broadcast(artery);
      }
    });
  }

  #updateArteries(arteries: ArteryService[]) {
    for (const artery of arteries) {
      const index = this.list.findIndex((a) => a.name === artery.name);

      if (index !== -1) {
        this.list[index] = artery;
      } else {
        this.list.push(artery);
      }
    }
  }
}
