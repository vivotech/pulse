import { existsSync } from "fs";
import { bashAsync } from "@vivotech/artery/dist/common";
import { getLinuxUser } from "./user";
import { time } from "@vivotech/out";

export class SharedDirectory {
  groupname = "vivo";

  constructor(public path: string) {}

  async init(): Promise<string | null> {
    const user = await getLinuxUser("debi");

    if (user) {
      return await this.#makeSureMainDirectoryExists();
    } else {
      return null;
    }
  }

  async #makeSureMainDirectoryExists() {
    const exists = existsSync(this.path);
    let path = null;

    if (exists) {
      time(`[DIR] Main directory detected`, { color: "cyan" });
      path = this.path;
    } else {
      const mkdir = await bashAsync(["mkdir", this.path], {
        user: "root",
      }).catch((e) => false);

      if (!mkdir) {
        time("[DIR] Failed to create shared directory", { color: "red" });
        path = null;
      } else {
        time(`[DIR] ${mkdir}`, { color: "green" });
        path = this.path;
      }

      const createGroup = await this.createGroup(this.groupname).catch((e) => {
        time(`[DIR] ${e}`, { color: "red" });
        return false;
      });

      if (createGroup) {
        time(`[DIR] ${createGroup}`, { color: "green" });
      }

      const addUser = await this.addUser("debi").catch((e) => ({ error: e }));

      if (addUser && "error" in addUser) {
        time(`[DIR] ${addUser.error}`, { color: "red" });
      } else {
        time(`[DIR] ${addUser}`, { color: "green" });
      }
    }

    return path;
  }

  async createGroup(groupname) {
    await bashAsync([`groupadd`, groupname], { user: "root" });
    await bashAsync(["chgrp", "-R", groupname, this.path], { user: "root" });
    await bashAsync(["chmod", "-R", "2775", this.path], { user: "root" });
  }

  async addUser(username: string) {
    await bashAsync([`usermod`, "-a", "-G", this.groupname, username], {
      user: "root",
    });
  }
}
