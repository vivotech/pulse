import { bashAsync } from "@vivotech/artery/dist/common";
import { existsSync, readdirSync } from "fs";
import { ArteryList } from "@vivotech/artery/dist/list";
import { Repository } from "./repository";
import { time } from "@vivotech/out";

export class Repositories extends ArteryList<Repository> {
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
      const remote = (await bashAsync(["git", "remote", "-v"], {
        cwd: repository.path,
      })) as string;

      if (existsSync(`${repository.path}/.git`)) {
        let url;

        if (remote) {
          try {
            const [push, pull] = remote.split(" ");
            const [type, git] = pull.split("\n");
            const [upstream, _url] = git.split("\t");

            url = _url;
          } catch (err) {
            time(`[GIT] analyze ${repository.name} ${err}`, { color: "red" });
          }

          const behind = parseInt(
            (await bashAsync(["git", "rev-list", "--count", "origin..HEAD"], {
              cwd: repository.path,
            }).catch((er) => `${er}`)) as string
          );

          this.update([
            {
              ...repository,
              behind,
              url,
            },
          ]);
        } else {
          time(`[GIT] ${repository.name} have no remote`, { color: "magenta" });
        }
      } else {
        time(`[GIT] ${repository.name} not found`, { color: "magenta" });
      }
    }

    return this.all();
  }
}
