import { Organ, bash, time } from "organ";
import { readdir, writeFile } from "fs/promises";
import { Service } from "./service";

export const USER_SERVICES_PATH = "/etc/systemd/system";

export class Services {
  list: Service[] = [];

  async set(unit: Unit) {
    const file = generateUnitFile(unit);
    return await writeFile(
      USER_SERVICES_PATH + "/" + unit.name + ".service",
      file
    );
  }

  async check() {
    const dir = await readdir(USER_SERVICES_PATH);

    const services = dir.filter((name) => name.startsWith("pulse"));

    this.list = services;

    if (!services.length) {
      time("No services installed");
    } else {
      let active = 0;

      for (const service of services) {
        const state = await this.state(service);

        if (service === "pulse.service") {
          if (state === "active") {
            time("System activatated");
          } else {
            time("System deactivated", { type: "error" });
            await this.activate(service)
              .then((res) => {
                if (res) {
                  time("System activated");
                  process.exit();
                }
              })
              .catch(this.error.bind(this));
          }
        }

        if (state === "active") {
          active++;
        }
      }

      time(`${services.length} services found, ${active} active`);
    }
  }

  deactivate(name: string) {
    return new Promise((res) => {
      bash("systemctl", ["stop", name]).on("data", (data) => res(data));
    }).catch(
      this.error.bind(this, "Insufficient permissions to deactivate service")
    );
  }

  activate(name: string) {
    return new Promise((res, rej) => {
      bash("systemctl", ["start", name])
        .on("data", (data) => res(data))
        .on("error", (error) => rej(error));
    }).catch(
      this.error.bind(this, "Insufficient permissions to activate service")
    );
  }

  error(error: string) {
    time(error, { type: "error" });
  }

  enable(name: string) {
    return new Promise((res) => {
      bash("systemctl", ["enable", name]).on("data", (data) => res(data));
    }).catch(
      this.error.bind(this, "Insufficient permissions to enable service")
    );
  }

  state(name: string): Promise<"active" | "inactive"> {
    return new Promise((res) => {
      bash("systemctl", ["is-active", name]).on("data", (data) =>
        res(data as "active" | "inactive")
      );
    });
  }

  async init() {
    await this.set({
      directory: "/home/dev/sources/pulse",
      description: "Debi omni unificator",
      command: "npm run dev",
      restartTimeout: 15,
      restart: "always",
      name: "pulse",
    });

    return "Pulse not initialized";
  }
}

export class Pulse extends Organ {
  services = new Services();

  constructor() {
    super({
      statics: [],
    });

    this.#setupHello();
  }

  #setupHello() {
    this.get("/", (params) => "Hello, I'm Debi");

    this.get(
      "/:name",
      (params) => `Hello${params.name ? ` ${params.name}` : ""}, I'm Debi`
    );
  }

  #todo() {
    time("[x] check available services");
    time("[x] need to can create new services");
    time("[ ] some cli for creating projects");

    time("[ ] interface for viewing services");
    time("[ ] connect with compact db service (memory)");

    time("[ ] can list available services (with socket updates)");
    time("[ ] can stop/start service");
  }
}

export interface Unit {
  restart: "always" | "on-failure";
  restartTimeout: number;
  description: string;
  directory: string;
  command: string;
  name: string;
}

export function generateUnitFile(unit: Unit) {
  // PermissionsStartOnly=true
  return `[Unit]

Description=${unit.description}
After=network.target                  

[Service] 
WorkingDirectory=${unit.directory}
ExecStart=${unit.command}
Type=exec
Restart=${unit.restart}
RestartSec=${unit.restartTimeout}s                                  
                                                    
[Install]                                                           
WantedBy=multi-user.target`;
}
