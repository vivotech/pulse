import { ArteryList } from "@vivotech/artery/dist/list";
import { time } from "@vivotech/out";
import { Pulse } from "../pulse/index";
import { Repository } from "../repo/repository";
import { NpmPackage } from "../service";
import { DEFAULT_ARTERIES } from "./defaults";
import { readdirSync } from "fs";
import { bashAsync } from "@vivotech/artery/dist/common";

export class Arteries extends ArteryList<NpmPackage, Pulse> {
  constructor(private art: Pulse) {
    super("arteries", art);

    this.init(DEFAULT_ARTERIES);
    this.#actions(art);
  }

  #actions(art: Pulse) {
    art.get("/arteries", async () => this.all);

    art.post(
      "/install",
      async (params, query) => await this.install(art, query.name)
    );
  }

  async install(art: Pulse, name: string) {
    time(`[ART] install ${name}`);
    // const service = this.all.find(({ service }) => name === service);

    // if (service) {
    time(`[ART] install service ${name} not supported yet`, {
      color: "yellow",
    });
    // const i = await install(art, service);
    // } else {
    //  time("[ART] Artery service not found");
    // }
  }

  provideRepositories(repositories: Repository[]): NpmPackage[] {
    if (repositories.length) {
      const detected = [];

      for (const repo of repositories) {
        const dir = readdirSync(repo.path);

        if (dir.includes("package.json")) {
          const pkg = require(`${repo.path}/package.json`);
          const artery = this.all.find(({ name }) => name === pkg.name);

          if (artery) {
            time(`[ART] ${artery.name} detected`, {
              color: "green",
            });

            detected.push({ ...artery, path: repo.path });
          }
        } else {
          time(`[ART] No package.json found`, { color: "yellow" });
        }
      }

      if (detected.length) {
        this.update(detected);
      }

      return detected;
    }

    time(`[ART] No repositories to analyze`, { color: "yellow" });
    return [];
  }
}
