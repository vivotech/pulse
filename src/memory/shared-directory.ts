import { existsSync } from "fs";
import { bashAsync } from "../../../vivo/artery/src";
import { getLinuxUser } from "./user";
import { time } from "@vivotech/out";

export class SharedDirectory {
  groupname = "vivo";

  constructor(public path: string) {
    this.init();
  }

  async init() {
    const user = await getLinuxUser("debi");

    if (user) {
      await this.#makeSureMainDirectoryExists();
    }
  }

  async #makeSureMainDirectoryExists() {
    const exists = existsSync(this.path);

    if (exists) {
      time(`Main directory detected`, { color: "cyan" });
    } else {
      const mkdir = await bashAsync("mkdir", ["-p", this.path]).catch(
        (e) => false
      );

      if (!mkdir) {
        time("Failed to create shared directory", { color: "red" });
      } else {
        time(mkdir as any, { color: "green" });
      }

      const createGroup = await this.createGroup(this.groupname).catch((e) => {
        time(e as string, { color: "red" });
        return false;
      });

      if (createGroup) {
        time(createGroup as any, { color: "green" });
      }

      const addUser = await this.addUser("debi").catch((e) => ({ error: e }));

      if (addUser && "error" in addUser) {
        time(addUser.error, { color: "red" });
      } else {
        time(addUser as any, { color: "green" });
      }
    }
  }

  async createGroup(groupname) {
    await bashAsync(`groupadd`, [groupname]);
    await bashAsync("chgrp", ["-R", groupname, this.path]);
    await bashAsync("chmod", ["-R", "2775", this.path]);
  }

  async addUser(username: string) {
    await bashAsync(`usermod`, ["-a", "-G", this.groupname, username]);
  }
}
