import { fork } from "child_process";
import { resolve as _resolve } from "path";
import { getBrowserWindow } from "./BrowserWindowUtility";

let serverProcess = null;

export async function startServer(vars) {
  if (Object.keys(vars) < 1) {
    vars = {};
  }

  const isDevelopment = process.env.NODE_ENV !== "production";
  serverProcess = fork(
    isDevelopment
      ? _resolve(__dirname, "../server/server.js")
      : _resolve(process.resourcesPath, "./server/server.js"),
    {
      env: vars,
    }
  );

  const browserWindow = getBrowserWindow();

  serverProcess.on("message", (data) => {
    switch (data.type) {
      case "jira":
        browserWindow.webContents.send("JIRA_LOGIN", data.data);
        break;
      default:
        break;
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // TODO: The above line is not ideal, but the express server doesn't seem to
  //       send a 'spawn' event, so the below line doesn't work.
  //await once(serverProcess, 'spawn');
}

export function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
}
