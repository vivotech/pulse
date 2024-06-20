import { ArteryList } from "@vivotech/artery/dist/list";
import { Pulse } from "../pulse";
import { Repository } from "./repository";
import { readdirSync } from "fs";
import { time } from "@vivotech/out";
import { bashAsync } from "@vivotech/artery/dist/common";

export class Repositories extends ArteryList<Repository, Pulse> {
  constructor(pulse: Pulse) {
    super("repositories", pulse);
  }

  async load(path: string): Promise<Repository[]> {
    const names = this.#loadRepositories(path);
    const repos = await this.#analyzeRepositories(names);

    return repos;
  }

  #loadRepositories(path: string) {
    const names = readdirSync(path).map((name) => ({
      path: path + "/" + name,
      name,
    }));

    this.init(names);

    return this.all();
  }

  async #analyzeRepositories(repositories: Repository[]) {
    for (const repository of repositories) {
      const remote = (await bashAsync(["git", "remote", "-v"])) as string;
      const [push, pull] = remote.split(" ");
      const [type, git] = pull.split("\n");
      const [upstream, url] = git.split("\t");

      const behind = parseInt(
        (await bashAsync([
          "git",
          "rev-list",
          "--count",
          "origin..HEAD",
        ])) as string
      );

      this.update([
        {
          ...repository,
          behind,
          url,
        },
      ]);
    }

    return this.all();
  }
}
