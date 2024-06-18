import { Pulse } from "./pulse";
import { ArteryService, Service } from "./service";

export class Arteries {
  list: ArteryService[] = [
    {
      service: "pulse.service",
      name: "@vivotech/pulse",
      installed: null,
      enabled: null,
      active: null,
      port: null,
    },
    {
      service: "shepherd.service",
      name: "@vivotech/shepherd",
      installed: null,
      enabled: null,
      active: null,
      port: null,
    },
    {
      service: "memory.service",
      name: "@vivotech/memory",
      installed: null,
      enabled: null,
      active: null,
      port: null,
    },
  ];

  constructor(pulse: Pulse) {
    this.#actions(pulse);
  }

  #actions(pulse: Pulse) {
    pulse.get("/arteries", async () => this.list);

    pulse.get("/arteryPort", async (params, query) => {
      const name = query.name;

      if (name === "@vivotech/pulse") {
        return 3963;
      } else {
        return null;
      }
    });
  }

  provideServices(services: Service[]) {
    this.list.forEach((artery) => {
      const service = services.find((s) => s.service === artery.service);

      if (service) {
        artery.enabled = service.enabled;
        artery.active = service.active;
        artery.installed = true;
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
