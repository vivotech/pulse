import { time } from "@vivotech/out";
import { readFile, readdir, writeFile } from "fs/promises";
import { bashAsync } from "@vivotech/artery/dist/common";
import { Pulse } from "../pulse";
import { NpmPackage, Service, Unit, generateUnitFile } from "../service";
import { ArteryList } from "@vivotech/artery/dist/list";
import { existsSync } from "fs";

export const USER_SERVICES_PATH = "/etc/systemd/system";

export function toServiceName(name: string) {
  return name.replace("@", "").replace("/", "-");
}

export class Services extends ArteryList<Service, Pulse> {
  constructor(private pulse: Pulse) {
    super("services", pulse);
    this.#actions(pulse);
  }

  get(name: string): Service {
    return this.all.find(({ service: n }) => n.startsWith(toServiceName(name)));
  }

  async register({ name, port }: NpmPackage) {
    const unit: Unit = {
      directory: `${this.pulse.dir.path}/${toServiceName(name)}`,
      command: `npm run service ${port}`,
      name: toServiceName(name),
      description: "WIP",
      restartTimeout: 15,
      restart: "always",
    };

    await this.#setServiceFile(unit);

    return unit;
  }

  async #doubleCheck(list: Service[]) {
    const response = list;

    this.pulse.arteries.all.forEach(async (art) => {
      const res = {
        enabled:
          (await this.sysctl(toServiceName(art.name), "is-enabled")) ===
          "enabled",
        active:
          (await this.sysctl(toServiceName(art.name), "is-active")) ===
          "active",
        service: art.name,
      };

      const index = response.findIndex((s) => s.service === art.name);

      if (index > -1) {
        response[index] = { ...response[index], ...res };

        // this.pulse.broadcast(response[index]);
        this.register(art);
      } else {
        response.push({ ...res, installed: false, id: "s" });
        // this.pulse.broadcast({ ...res, installed: false });
      }
    });

    return response;
  }

  async check() {
    const services = await readdir(USER_SERVICES_PATH);

    const list = services.map((name) => {
      const service = {
        id: Math.random().toString(36).substring(7),
        installed: true,
        service: name,
        enabled: null,
        active: null,
      };

      return service;
    });

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
    return await bashAsync(["systemctl", command, name], {
      user: "root",
    }).catch(
      this.#error.bind(
        this,
        `Insufficient permissions to ${command} ${name} service`
      )
    );
  }

  async #setServiceFile(unit: Unit) {
    const file = generateUnitFile(unit);
    const serviceFilepath = USER_SERVICES_PATH + "/" + unit.name + ".service";

    const serviceFileExist = existsSync(serviceFilepath);

    if (serviceFileExist) {
      const oldFile = await readFile(serviceFilepath).toString();

      if (JSON.stringify(file.trim()) !== JSON.stringify(oldFile).trim()) {
        time(`[SERVICE] Writing ${unit.name}.service`, { color: "cyan" });

        return await writeFile(serviceFilepath, file);
      }
    } else {
      time(`[SERVICE] Init ${unit.name}.service`, { color: "cyan" });
      return await writeFile(serviceFilepath, file);
    }
  }

  #error(error: string) {
    time(`[SERVICE] ${error}`, { color: "red" });
  }

  #actions(pulse: Pulse) {
    pulse.get("/services", async () => this.all);

    pulse.post(
      "/service",
      async (params, query) =>
        await this.sysctl(toServiceName(query.name), query.state)
    );
  }
}
