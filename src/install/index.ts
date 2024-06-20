import { Pulse } from "../pulse";
import { install } from "./toInstall";

const _ = new Pulse();

install(
  _,
  _.arteries.all().find(({ name }) => name === "@vivotech/pulse")
);
