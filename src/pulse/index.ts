import { Artery } from "@vivotech/artery/dist/core";
import { time } from "@vivotech/out";
import { readdir } from "fs/promises";
import { Arteries } from "../artery/arteries";
import { SharedDirectory } from "../memory/shared-directory";
import { Repositories } from "../repo";
import { Services } from "../service/services";
import { ArteryList } from "@vivotech/artery/dist/list";

export class Pulse extends Artery {
  dir = new SharedDirectory("/home/.debi");

  cwd() {
    return readdir(process.cwd());
  }

  constructor() {
    super({
      lists: {
        repositories: Repositories,
        services: Services,
        arteries: Arteries,
      } as { [key: string]: typeof ArteryList },
    });

    this.#start();
  }

  async #start() {
    const services = await this.inject<Services>("services").check();

    time(
      `[PULSE] ${
        services.length
          ? services.length + " services installed"
          : "No services found"
      }`
    );

    const path = await this.dir.init();

    const repos = await this.inject<Repositories>("repositories").load(path);
    const behind = repos.filter((repo) => repo.behind);

    time(
      `[PULSE] Found ${repos.length} programs (${
        behind.length
          ? behind.length + " have updates available"
          : "all are up to date"
      })`
    );

    const detected =
      this.inject<Arteries>("arteries").provideRepositories(repos);

    time(`[PULSE] ${detected.length} arteries detected`);
  }
}
