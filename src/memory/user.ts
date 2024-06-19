import { time } from "@vivotech/out";
import { bashAsync } from "@vivotech/artery/dist/common";

export async function getLinuxUser(username: string) {
  const debiExists = await bashAsync(["id", "-u", username])
    .then((n) => +n)
    .catch((e) => null)
    .then((n) => typeof n === "number");

  if (!debiExists) {
    const user = await bashAsync(["useradd", username], { user: "root" }).catch(
      (er) => {
        time(er as string, { color: "red" });
        return false;
      }
    );

    if (user) {
      time(`${username} user created`);
      return username;
    } else {
      time(`${username} not created, probably not sufficent permission`, {
        color: "red",
      });
      return false;
    }
  }

  return username;
}
