import { time } from "console";
import { Pulse } from "./pulse";

const pulse = new Pulse();

async function install() {
  if (!pulse.services.list.some((name) => name === "pulse.service")) {
    const res = await pulse.services.init();
    time(res);
    await pulse.services.check();
  } else {
    time("Pulse already installed");
    await pulse.services.check();
  }
}

install();
