import { Arteries } from "../artery/arteries";
import { Repositories } from "../repo";
import { Services } from "../service/services";

export type PulseLists = {
  repositories: Repositories;
  services: Services;
  arteries: Arteries;
};
