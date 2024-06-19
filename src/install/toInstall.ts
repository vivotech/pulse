import { time } from "@vivotech/out";
import { isTcpFree } from "../espionage";
import { bashAsync } from "../../../vivo/artery/src";
import { Pulse } from "../pulse";
import { ArteryService } from "../service";
import { existsSync } from "fs";

export async function install(pulse: Pulse, arteryService: ArteryService) {
  const { service, port, name: pkgName, gitUrl } = arteryService;
  const directoryName = pkgName.split("/").pop();
  const path = `${pulse.dir.path}/${directoryName}`;

  if (existsSync(path)) {
    time(`Found ${path}`);
  } else {
    time(`cloning ${pkgName}`);

    const clone = await bashAsync("git", ["clone", gitUrl], {
      cwd: pulse.dir.path,
    }).catch((e) => {
      time(e as string, { color: "red" });
      return false;
    });

    if (!clone) {
      time(`failed cloning ${pkgName}`, { color: "red" });
      return;
    }
  }

  time(`installing ${pkgName}`);

  const npmI = await bashAsync("npm", ["i"], {
    cwd: path,
  }).catch(() => false);

  time("installation " + (npmI ? "success" : "failed"), {
    color: npmI ? "green" : "red",
  });

  time("Look for systemd services");

  const services = await pulse.services.check();

  time(`Found ${services.length} services`);

  if (!services.some((name) => name.service === service)) {
    time(`boot ${pkgName}`);
    const s = pulse.arteries.list.find(({ name }) => name === service);

    if (s) {
      const res = await pulse.services.init(s);
      time(res);
    } else {
      time(`Init ${service}`, { color: "cyan" });
      pulse.services.init(arteryService);
    }
  } else {
    time(`${pkgName} already installed`);
  }

  const notSureService = pulse.services.get(service);

  if (notSureService) {
    const { active, enabled } = notSureService;

    const pid = isTcpFree(port);

    if (!pid) {
      time(
        `${pkgName} is ${active ? "" : "not"} active, and ${
          enabled ? "" : "not"
        } enabled`
      );
    } else {
      time(`${pkgName} is running on port ${port}`);
    }
  } else {
    time("Service not found", { color: "red" });
  }
}
