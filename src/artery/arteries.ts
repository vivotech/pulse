import { time } from "@vivotech/out";
import { ArteryList } from "@vivotech/artery/dist/list";
import { Pulse } from "../pulse/index";
import { ArteryService, Service } from "../service/index";
import { install } from "../install/toInstall";
import { Artery } from "@vivotech/artery/dist/core";

export class Arteries extends ArteryList<ArteryService, Pulse> {
  constructor(private art: Pulse) {
    super("arteries", art);

    this.#actions(art);

    this.init([
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
    ]);
  }

  #actions(art: Pulse) {
    art.get("/arteries", async () => this.all);

    art.get("/artery", async (params, query) =>
      this.all.find(({ service }) => service === query.name)
    );

    art.post(
      "/install",
      async (params, query) => await this.install(art, query.name)
    );
  }

  async install(art: Pulse, name: string) {
    time(`install ${name}`);
    const service = this.all.find(({ service }) => name === service);

    if (service) {
      const i = await install(art, service);
    } else {
      time("Artery service not found");
    }
  }

  provideServices(services: Service[]) {
    for (const service of services) {
      const artery = this.all.find(
        ({ service: ser }) => ser === service.service
      );

      if (artery) {
        this.update([
          {
            ...artery,
            installed: true,
            enabled: true,
            active: true,
          },
        ]);
      }
    }
  }
}
