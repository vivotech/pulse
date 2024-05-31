import { Pulse } from "./pulse";

const pulse = new Pulse();

pulse.services.check();
pulse.setupApp(6334);
