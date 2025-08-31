import { app, remote, dialog, shell, BrowserWindow } from "electron";
import { join } from "path";
import { existsSync, mkdirSync, writeFile, unlinkSync, readFileSync, rmSync, renameSync, lstatSync, readdirSync, rmdirSync, readdir, stat, readFile } from "fs";
import AdmZip from "adm-zip";
import extract from "extract-zip";
import dayjs from "dayjs";
import uuidv4 from "uuid";
import logo from '@/assets/icon/logo.png'

const configDir = (app || remote.app).getPath("userData");

import { getItemById, createNewSession as _createNewSession, getItems, updateMetadata, updateItems, getSessionID, getMetadata, getConfig } from "./PersistenceUtility";
import { STATUSES, FILE_TYPES } from "@/modules/constants";

export async function exportItems(ids) {
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
        const item = getItemById(id);

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
}

export async function createNewSession(state) {
  state.session.sessionID = uuidv4();
  state.case.caseID = uuidv4();
  const dataFolder = join(configDir, "sessions", state.session.sessionID);
  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder, { recursive: true });
  }
  _createNewSession(state);
}

export async function saveSession(data) {
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
    const items = getItems();
    data.session.items = items;
    const metaPath = join(configDir, "metadata.txt");
    const jsonStr = JSON.stringify(data);
    const encodedStr = Buffer.from(jsonStr).toString("hex");

    writeFile(metaPath, encodedStr, function (error) {
      if (error) {
        return resolve({
          status: STATUSES.ERROR,
          message: error,
        });
      }
      try {
        const zip = new AdmZip();
        zip.addLocalFile(metaPath);
        unlinkSync(metaPath);
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
}

export async function openSession() {
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
  const target = join(configDir, "sessions", "temp");
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
  try {
    await extract(filePath, { dir: target });
    const metaPath = join(target, "metadata.txt");
    const encoded = readFileSync(metaPath, "utf8");
    const state = JSON.parse(Buffer.from(encoded, "hex").toString());

    const id = state.id || uuidv4();
    const dataFolder = join(configDir, "sessions", id);
    if (existsSync(dataFolder)) {
      rmSync(dataFolder, { recursive: true });
    }
    renameSync(target, dataFolder);

    const sessionDataPath = join(dataFolder, "sessionData.json");
    updateMetadata({ sessionDataPath });

    // TODO - Should we restore state here or in Main and Default?

    updateItems(state.session.items);
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
}

export async function exportSession(params) {
  const timestamp = dayjs().format("YYYY-MM-DD_HH-mm-ss-ms");
  const id = getSessionID();
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
    icon: join(app.getAppPath(), "assets/icon/logo.png"),
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,
      preload: join(__dirname, "preload.js"),
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
          const pdfPath = join(configDir, "sessions", id, pdfName);
          if (params.type === "pdf") {
            writeFile(filePath, data, (error) => {
              if (error) {
                return Promise.resolve({
                  status: STATUSES.ERROR,
                  message: error,
                });
              }
            });
          } else {
            writeFile(pdfPath, data, (error) => {
              if (error) {
                return Promise.resolve({
                  status: STATUSES.ERROR,
                  message: error,
                });
              }
              try {
                const zip = new AdmZip();

                const items = getItems();
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
}

const deleteFolder = function (folderPath) {
  if (existsSync(folderPath) && lstatSync(folderPath).isDirectory()) {
    readdirSync(folderPath).forEach((file) => {
      const curPath = join(folderPath, file);
      if (lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(folderPath);
    return true;
  } else {
    return false;
  }
};

const deleteOldFiles = (directoryPath, retentionPeriod) => {
  readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return false;
    }

    files.forEach((file) => {
      const filePath = join(directoryPath, file);

      stat(filePath, (err, stats) => {
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

export async function deleteSession(type) {
  let status;
  const metadata = getMetadata();
  if (type === "all") status = deleteFolder(metadata.sessionPath);
  else {
    let config = getConfig();
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
}

export async function openConfigFile() {
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
    readFile(filePath, "utf8", (err) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
    });

    const metadata = getMetadata();
    metadata.configPath = filePath;
    updateMetadata(metadata);
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
}

export async function openCredentialsFile() {
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
    readFile(filePath, "utf8", (err) => {
      if (err) {
        console.log("File read failed:", err);
        return;
      }
    });

    const metadata = getMetadata();
    metadata.credentialsPath = filePath;
    updateMetadata(metadata);
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
}

export function dragItem(event, data) {
  // eslint-disable-next-line no-undef
  const iconPath = join(app.getAppPath(), "assets/icon/drag-drop.png");
  event.sender.startDrag({
    file: data.filePath,
    icon: iconPath,
  });
}

export async function openExternalLink(url = "") {
  if (url === "") return;
  return shell.openExternal(url);
}
