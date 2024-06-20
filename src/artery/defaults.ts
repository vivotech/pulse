import { NpmPackage } from "../service";

export const DEFAULT_ARTERIES: Omit<NpmPackage, "id">[] = [
  {
    gitUrl: "git@github.com:vivotech/pulse.git",
    name: "@vivotech/pulse",
    port: 3963,
  },
  {
    gitUrl: "git@github.com:vivotech/shepheard.git",
    name: "@vivotech/shepheard",
    port: 3964,
  },
  {
    gitUrl: "git@github.com:vivotech/memory.git",
    name: "@vivotech/memory",
    port: 3965,
  },
];
