import { Repository } from "../repo/repository";
import { NpmPackage, Service } from "../service";

export type PulseLists = {
  repositories: Repository[];
  arteries: NpmPackage[];
  services: Service[];
};
