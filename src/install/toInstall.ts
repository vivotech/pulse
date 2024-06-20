import { time } from "@vivotech/out";
import { isTcpFree } from "../espionage";
import { bashAsync } from "@vivotech/artery/dist/common";
import { Pulse } from "../pulse";
import { existsSync } from "fs";
import { NpmPackage } from "../service";

export async function install(pulse: Pulse, arteryService: NpmPackage) {
  const { port, name: pkgName, gitUrl } = arteryService;
  const directoryName = pkgName.split("/").pop();
  const path = `${pulse.dir.path}/${directoryName}`;

  if (existsSync(path)) {
    time(`[GIT] Pull command for ${path}`);

    await bashAsync(["git", "pull"], { cwd: path }).catch((e) => {
      time(`[GIT] ${e}` as string, { color: "red" });
    });
  } else {
    time(`[GIT] Clone command for ${pkgName}`);

    await bashAsync(["git", "clone", gitUrl], {
      cwd: pulse.dir.path,
    }).catch((e) => {
      time(`[GIT] ${pkgName} ${gitUrl} ${e}`, { color: "red" });
    });

    if (!existsSync(path)) {
      return;
    }
  }

  time(`[NPM] ${pkgName} install`);

  const npmI = await bashAsync(["npm", "i"], {
    cwd: path,
  }).catch(() => false);

  time(`[NPM] ${pkgName} installation ${npmI ? "success" : "failed"}`, {
    color: npmI ? "green" : "red",
  });

  time("[SYSTEMD] Look for systemd services");

  const services = await pulse.services.check();

  time(`[SYSTEMD] Found ${services.length} services`);

  if (!services.some((name) => name.service === pkgName)) {
    time(`[SYSTEMD] boot ${pkgName}`, { color: "cyan" });
    const s = pulse.arteries.all().find(({ name }) => name === pkgName);

    if (s) {
      const res = await pulse.services.register(s);
      time(`[SYSTEMD] ${res}`);
    } else {
      time(`[SYSTEMD] Init ${pkgName}`, { color: "cyan" });
      pulse.services.register(arteryService);
    }
  } else {
    // time(`[SYSTEMD] ${pkgName} already installed`);
  }

  const { active, enabled } = pulse.services.get(pkgName) ?? {};

  const pid = isTcpFree(port);

  if (!pid) {
    time(
      `[SYSTEMD] ${pkgName} is ${active ? "" : "not"} active, and ${
        enabled ? "" : "not"
      } enabled`
    );
  } else {
    time(`[PROCESS] ${pkgName} is running on port ${port}`);
  }
}
