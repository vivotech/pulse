import { Pulse } from "./pulse";
import { init } from "@vivotech/artery/dist/core";

const pulse = new Pulse();

// pulse.services.check("pulse.service");

console.clear();

init(pulse);
