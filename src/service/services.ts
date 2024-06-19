import { time } from "@vivotech/out";
import { readFile, readdir, writeFile } from "fs/promises";
import { bashAsync } from "@vivotech/artery/dist/common";
import { Pulse } from "../pulse";
import { ArteryService, Service, Unit, generateUnitFile } from "../service";

export const USER_SERVICES_PATH = "/etc/systemd/system";

export class Services {
  list: Service[] = [];

  constructor(private pulse: Pulse) {
    this.#actions(pulse);
  }

  get(name: string): Service {
    return this.list.find(({ service: n }) => n.startsWith(name));
  }

  async init({ name, port }: ArteryService) {
    const directoryName = name.split("/").pop();

    await this.#setServiceFile({
      directory: `${this.pulse.dir.path}/${directoryName}`,
      command: `npm run service ${port}`,
      name: directoryName,
      description: "WIP",
      restartTimeout: 15,
      restart: "always",
    });

    return `${name} initialized`;
  }

  async #doubleCheck(list: Service[]) {
    const response = list;

    this.pulse.arteries.list.forEach(async (art) => {
      const res = {
        enabled: (await this.sysctl(art.service, "is-enabled")) === "enabled",
        active: (await this.sysctl(art.service, "is-active")) === "active",
        service: art.service,
      };

      const index = response.findIndex((s) => s.service === art.service);

      if (index > -1) {
        response[index] = { ...response[index], ...res };
        this.init(art);
      } else {
        response.push({ ...res, installed: false });
      }
    });

    return response;
  }

  async check() {
    const servicesDirectory = await readdir(USER_SERVICES_PATH);
    const services = servicesDirectory.filter((name) => name.startsWith(name));

    const list = await Promise.all(
      services.map(async (name) => {
        const service = {
          installed: true,
          service: name,
          enabled: null,
          active: null,
        };

        return service;
      })
    );

    this.list = [...list];

    return this.#doubleCheck(list);
  }

  async sysctl(
    name: string,
    command:
      | "is-active"
      | "is-enabled"
      | "restart"
      | "disable"
      | "enable"
      | "start"
      | "stop"
  ) {
    return await bashAsync("systemctl", [command, name], {
      user: "root",
    }).catch(
      this.#error.bind(this, `Insufficient permissions to ${command} service`)
    );
  }

  async #setServiceFile(unit: Unit) {
    const file = generateUnitFile(unit);

    if (
      JSON.stringify(file.trim()) !==
      JSON.stringify(
        (
          await readFile(USER_SERVICES_PATH + "/" + unit.name + ".service")
        ).toString()
      ).trim()
    ) {
      time(`Writing ${unit.name}.service`, { color: "cyan" });

      return await writeFile(
        USER_SERVICES_PATH + "/" + unit.name + ".service",
        file
      );
    } else {
      // OK
    }
  }

  #error(error: string) {
    time(error, { color: "red" });
  }

  #actions(pulse: Pulse) {
    pulse.get("/services", async () => this.list);

    pulse.post(
      "/service",
      async (params, query) => await this.sysctl(query.name, query.state)
    );
  }
}
