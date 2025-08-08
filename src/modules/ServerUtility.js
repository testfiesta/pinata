const { fork } = require("child_process");
const path = require("path");
const browserUtility = require("./BrowserWindowUtility");

let serverProcess = null;

module.exports.startServer = async (vars) => {
  if (Object.keys(vars) < 1) {
    vars = {};
  }

  const isDevelopment = process.env.NODE_ENV !== "production";
  serverProcess = fork(
    isDevelopment
      ? path.resolve(__dirname, "../server/server.js")
      : path.resolve(process.resourcesPath, "./server/server.js"),
    {
      env: vars,
    }
  );

  const browserWindow = browserUtility.getBrowserWindow();

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
};

module.exports.stopServer = () => {
  if (serverProcess) {
    serverProcess.kill();
  }
};
