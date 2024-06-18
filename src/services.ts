import { time } from "@vivotech/out";
import { bash } from "@vivotech/artery";
import { readdir, writeFile } from "fs/promises";
import { Pulse } from "./pulse";
import { Service, Unit, generateUnitFile } from "./service";

export const USER_SERVICES_PATH = "/etc/systemd/system";

export class Services {
  list: Service[] = [];

  constructor(pulse: Pulse) {
    this.#actions(pulse);
  }

  async init() {
    await this.#setServiceFile({
      directory: "/home/dev/sources/pulse",
      description: "Debi omni unificator",
      command: "npm run dev",
      restartTimeout: 15,
      restart: "always",
      name: "pulse",
    });

    return "Pulse not initialized";
  }

  async check() {
    const servicesDirectory = await readdir(USER_SERVICES_PATH);
    const services = servicesDirectory.filter((name) => name.startsWith(name));

    this.list = await Promise.all(
      services.map(async (name) => {
        const service = {
          active: (await this.state(name)) === "active",
          installed: true,
          service: name,
          enabled: null,
        };

        return service;
      })
    );
  }

  async deactivate(name: string) {
    return new Promise((res) => {
      bash("systemctl", ["stop", name]).on("data", (data) => res(data));
    }).catch(
      this.#error.bind(this, "Insufficient permissions to deactivate service")
    );
  }

  async activate(name: string) {
    return new Promise((res, rej) => {
      bash("systemctl", ["start", name])
        .on("data", (data) => res(data))
        .on("error", (error) => rej(error));
    }).catch(
      this.#error.bind(this, "Insufficient permissions to activate service")
    );
  }

  async enable(name: string) {
    return new Promise((res) => {
      bash("systemctl", ["enable", name]).on("data", (data) => res(data));
    }).catch(
      this.#error.bind(this, "Insufficient permissions to enable service")
    );
  }

  async disable(name: string) {
    return new Promise((res) => {
      bash("systemctl", ["disable", name]).on("data", (data) => res(data));
    }).catch(
      this.#error.bind(this, "Insufficient permissions to disable service")
    );
  }

  async state(name: string): Promise<"active" | "inactive"> {
    return new Promise((res) => {
      bash("systemctl", ["is-active", name]).on("data", (data) =>
        res(data as "active" | "inactive")
      );
    });
  }

  async #setServiceFile(unit: Unit) {
    const file = generateUnitFile(unit);

    return await writeFile(
      USER_SERVICES_PATH + "/" + unit.name + ".service",
      file
    );
  }

  #error(error: string) {
    time(error); //, { type: "error" });
  }

  #actions(pulse: Pulse) {
    pulse.get("/services", async () => this.list);

    pulse.get(
      "/service/:name",
      async (params) => await this.state(params.name)
    );

    pulse.post(
      "/service/:name/activate",
      async (params) => await this.activate(params.name)
    );

    pulse.post(
      "/service/:name/deactivate",
      async (params) => await this.deactivate(params.name)
    );

    pulse.post(
      "/service/:name/enable",
      async (params) => await this.enable(params.name)
    );

    pulse.post(
      "/service/:name/disable",
      async (params) => await this.disable(params.name)
    );
  }
}
