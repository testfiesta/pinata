const { app, remote, dialog, shell, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const AdmZip = require("adm-zip");
const extract = require("extract-zip");
const dayjs = require("dayjs");
const uuidv4 = require("uuid");

const configDir = (app || remote.app).getPath("userData");

const persistenceUtility = require("./PersistenceUtility");
const { STATUSES, FILE_TYPES } = require("./constants");

module.exports.exportItems = async (ids) => {
  const fileName =
    "pinata-export-" + dayjs().format("YYYY-MM-DD_HH-mm-ss-ms") + ".zip";

  const { filePath } = await dialog.showSaveDialog({
    title: "Save Items",
    defaultPath: fileName,
    filters: [{ name: "Zip archives only", extensions: ["zip"] }],
    properties: ["createDirectory", "showOverwriteConfirmation"],
  });

  if (!filePath) {
    return Promise.resolve({ status: "canceled" });
  }

  return new Promise((resolve) => {
    try {
      const zip = new AdmZip();

      ids.map((id) => {
        const item = persistenceUtility.getItemById(id);

        if (item.filePath) {
          const sanitizedPath =
            item.filePath.substring(item.filePath.length - 1) !== "?"
              ? item.filePath
              : item.filePath.substring(0, item.filePath.length - 1);
          zip.addLocalFile(sanitizedPath, FILE_TYPES[item.fileType]);
        }
      });

      zip.writeZip(filePath, (error) => {
        if (error) {
          throw error;
        }

        resolve({
          status: STATUSES.SUCCESS,
          message: "Project exported successfully",
          filePath,
        });
      });
    } catch (error) {
      resolve({ status: STATUSES.ERROR, message: error.message });
    }
  });
};

module.exports.createNewSession = async (state) => {
  state.session.sessionID = uuidv4();
  state.case.caseID = uuidv4();
  const dataFolder = path.join(configDir, "sessions", state.session.sessionID);
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
  }
  persistenceUtility.createNewSession(state);
};

module.exports.saveSession = async (data) => {
  const fileName = "TestSession.test";
  const { filePath } = await dialog.showSaveDialog({
    title: "Save Session",
    defaultPath: fileName,
    filters: [{ name: "Test File", extensions: ["test"] }],
    properties: ["createDirectory", "showOverwriteConfirmation"],
  });

  if (!filePath) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "No path selected",
    });
  }

  return new Promise(function (resolve) {
    const items = persistenceUtility.getItems();
    data.session.items = items;
    const metaPath = path.join(configDir, "metadata.txt");
    const jsonStr = JSON.stringify(data);
    const encodedStr = Buffer.from(jsonStr).toString("hex");

    fs.writeFile(metaPath, encodedStr, function (error) {
      if (error) {
        return resolve({
          status: STATUSES.ERROR,
          message: error,
        });
      }
      try {
        const zip = new AdmZip();
        zip.addLocalFile(metaPath);
        fs.unlinkSync(metaPath);
        items.map((item) => {
          if (item.filePath) {
            const sanitizedPath =
              item.filePath.substring(item.filePath.length - 1) !== "?"
                ? item.filePath
                : item.filePath.substring(0, item.filePath.length - 1);
            zip.addLocalFile(sanitizedPath);
          }
        });

        zip.writeZip(filePath, (error) => {
          if (error) {
            return resolve({
              status: STATUSES.ERROR,
              message: error,
            });
          }

          return resolve({
            status: STATUSES.SUCCESS,
            message: "Session exported successfully",
          });
        });
      } catch (error) {
        return resolve({ status: STATUSES.ERROR, message: error.message });
      }
    });
  });
};

module.exports.openSession = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Test File", extensions: ["test"] }],
  });

  if (canceled) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "No file selected", // TODO i18n
    });
  }

  const filePath = filePaths[0];
  const target = path.join(configDir, "sessions", "temp");
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  try {
    await extract(filePath, { dir: target });
    const metaPath = path.join(target, "metadata.txt");
    const encoded = fs.readFileSync(metaPath, "utf8");
    const state = JSON.parse(Buffer.from(encoded, "hex").toString());

    const id = state.id || uuidv4();
    const dataFolder = path.join(configDir, "sessions", id);
    if (fs.existsSync(dataFolder)) {
      fs.rmSync(dataFolder, { recursive: true });
    }
    fs.renameSync(target, dataFolder);

    const sessionDataPath = path.join(dataFolder, "sessionData.json");
    persistenceUtility.updateMetadata({ sessionDataPath });

    // TODO - Should we restore state here or in Main and Default?

    persistenceUtility.updateItems(state.session.items);
    // delete state.sessions;

    return Promise.resolve({
      status: STATUSES.SUCCESS,
      message: "Session extracted successfully", // TODO i18n
      state: state,
    });
  } catch (err) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "Session extract failed",
    });
  }
};

module.exports.exportSession = async (params) => {
  const timestamp = dayjs().format("YYYY-MM-DD_HH-mm-ss-ms");
  const id = persistenceUtility.getSessionID();
  // show save dialog
  const fileName =
    params.type === "pdf"
      ? "pinata-session-" + timestamp + ".pdf"
      : "pinata-session-" + timestamp + ".zip";
  const options = {
    title: params.type === "pdf" ? "Save Pdf" : "Save Items",
    defaultPath: fileName,
    filters: [
      params.type === "pdf"
        ? { name: "Pdf files only", extensions: ["pdf"] }
        : { name: "Zip archives only", extensions: ["zip"] },
    ],
    properties: ["createDirectory", "showOverwriteConfirmation"],
  };
  const { filePath } = await dialog.showSaveDialog(options);

  if (!filePath) {
    return Promise.resolve({ status: "canceled" });
  }

  const pdfWin = new BrowserWindow({
    show: false,
    // eslint-disable-next-line no-undef
    icon: path.join(__static, "./logo.png"),
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  });

  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/#/print"
      : `file://${__dirname}/index.html#print`;

  pdfWin.loadURL(url);

  pdfWin.webContents.on("did-finish-load", () => {
    pdfWin.webContents.send("ACTIVE_PDF", params);
    setTimeout(() => {
      pdfWin.webContents
        .printToPDF({})
        .then((data) => {
          const pdfName = "pinata-session-" + timestamp + "-report.pdf";
          const pdfPath = path.join(configDir, "sessions", id, pdfName);
          if (params.type === "pdf") {
            fs.writeFile(filePath, data, (error) => {
              if (error) {
                return Promise.resolve({
                  status: STATUSES.ERROR,
                  message: error,
                });
              }
            });
          } else {
            fs.writeFile(pdfPath, data, (error) => {
              if (error) {
                return Promise.resolve({
                  status: STATUSES.ERROR,
                  message: error,
                });
              }
              try {
                const zip = new AdmZip();

                const items = persistenceUtility.getItems();
                items.map((item) => {
                  if (item.filePath) {
                    const sanitizedPath =
                      item.filePath.substring(item.filePath.length - 1) !== "?"
                        ? item.filePath
                        : item.filePath.substring(0, item.filePath.length - 1);
                    zip.addLocalFile(sanitizedPath, FILE_TYPES[item.fileType]);
                  }
                });

                zip.addLocalFile(pdfPath);
                if (params.logoPath) zip.addLocalFile(params.logoPath);
                zip.writeZip(filePath, (error) => {
                  if (error) {
                    return Promise.resolve({
                      status: STATUSES.ERROR,
                      message: error,
                    });
                  }

                  return Promise.resolve({
                    status: STATUSES.SUCCESS,
                    message: "Session Exported Successfully",
                    filePath,
                  });
                });
              } catch (error) {
                return Promise.resolve({
                  status: STATUSES.ERROR,
                  message: error,
                });
              }
            });
          }
        })
        .catch((error) => {
          return Promise.resolve({
            status: STATUSES.ERROR,
            message: error,
          });
        });
    }, 4000);
  });
};

const deleteFolder = function (folderPath) {
  if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    return true;
  } else {
    return false;
  }
};

const deleteOldFiles = (directoryPath, retentionPeriod) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return false;
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return false;
        }

        const currentTime = new Date();
        const fileModifiedTime = new Date(stats.mtime);

        const timeDifference = currentTime - fileModifiedTime;
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        if (daysDifference > retentionPeriod) {
          let status = deleteFolder(filePath);
          if (!status) return false;
        }
      });
    });
  });
  return true;
};

module.exports.deleteSession = async (type) => {
  let status;
  const metadata = persistenceUtility.getMetadata();
  if (type === "all") status = deleteFolder(metadata.sessionPath);
  else {
    let config = persistenceUtility.getConfig();
    status = deleteOldFiles(metadata.sessionPath, config.cache.retentionPeriod);
  }
  if (status)
    return Promise.resolve({
      status: STATUSES.SUCCESS,
      message: "Session deleted successfully", // TODO i18n
    });
  return Promise.resolve({
    status: STATUSES.ERROR,
    message: "Session deleted failed", // TODO i18n
  });
};

module.exports.openConfigFile = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Config File", extensions: ["json"] }],
  });

  if (canceled) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "No file selected",
    });
  }

  const filePath = filePaths[0];
  try {
    fs.readFile(filePath, "utf8", (err) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
    });

    const metadata = persistenceUtility.getMetadata();
    metadata.configPath = filePath;
    persistenceUtility.updateMetadata(metadata);
    return Promise.resolve({
      status: STATUSES.SUCCESS,
      message: "Config file imported successfully",
    });
  } catch (err) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "Config file imported failed",
    });
  }
};

module.exports.openCredentialsFile = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Credentials File", extensions: ["json"] }],
  });

  if (canceled) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "No file selected",
    });
  }

  const filePath = filePaths[0];
  try {
    fs.readFile(filePath, "utf8", (err) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
    });

    const metadata = persistenceUtility.getMetadata();
    metadata.credentialsPath = filePath;
    persistenceUtility.updateMetadata(metadata);
    return Promise.resolve({
      status: STATUSES.SUCCESS,
      message: "Credentials file imported successfully",
    });
  } catch (err) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "Credentials file imported failed",
    });
  }
};

module.exports.dragItem = (event, data) => {
  // eslint-disable-next-line no-undef
  const iconPath = path.join(__static, "./drag-drop.png");
  event.sender.startDrag({
    file: data.filePath,
    icon: iconPath,
  });
};

module.exports.openExternalLink = async (url = "") => {
  if (url === "") return;
  return shell.openExternal(url);
};
