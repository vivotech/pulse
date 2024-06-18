import { time } from "console";
import { Pulse } from "./pulse";

const pulse = new Pulse();

export async function install(name: string) {
  if (!pulse.services.list.some((name) => name === name)) {
    const res = await pulse.services.init();
    time(res);
    await pulse.services.check(name);
  } else {
    time(`${name} already installed`);
    await pulse.services.check(name);
  }
}
