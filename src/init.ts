import { Pulse } from "./pulse";
import { init } from "@vivotech/artery";

const pulse = new Pulse();

// pulse.services.check("pulse.service");

init(pulse);
