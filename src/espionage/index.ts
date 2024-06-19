import { spawnSync } from "child_process";

export function isTcpFree(port: number) {
  const output = spawnSync(
    `lsof -i tcp:${port} | awk '{print $2}' |grep --invert PID`,
    { shell: true },
  );

  if (output.error) {
    console.error(output.error);
    return;
  }

  const pid = Buffer.from(output.stdout.buffer).toString().split("\n")[0];

  return pid;
}
