import { Pulse } from "../pulse";
import { install } from "./toInstall";

const _ = new Pulse();

install(
  _,
  _.arteries.list.find(({ name }) => name === "@vivotech/pulse")
);
