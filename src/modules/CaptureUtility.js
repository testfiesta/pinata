import { app, remote, dialog, desktopCapturer } from "electron";
import { join, basename } from "path";
import { writeFileSync, statSync, existsSync, unlinkSync, readFileSync, rename, renameSync, copyFileSync } from "fs";
import dayjs from "dayjs";
import { fromFile } from "detect-file-type";
import uuidv4 from "uuid";
import { createHash } from "crypto";

import ffmpeg, { setFfmpegPath, setFfprobePath } from "fluent-ffmpeg";

import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const ffmpegPath = ffmpegStatic.replace("app.asar", "app.asar.unpacked");
const ffprobePath = ffprobeStatic.path.replace("app.asar", "app.asar.unpacked");

setFfmpegPath(ffmpegPath);
setFfprobePath(ffprobePath.path);

import { getBrowserWindow } from "./BrowserWindowUtility";
import { getSessionID } from "./PersistenceUtility";

import { STATUSES, DEFAULT_FILE_TYPES } from "./constants";

const configDir = (app || remote.app).getPath("userData");

export async function getMediaSource() {
  const sources = await desktopCapturer.getSources({
    thumbnailSize: {
      width: 600,
      height: 340,
    },
    types: ["window", "screen"],
  });

  return sources.map((source) => {
    return {
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
    };
  });
}

export function createImage({ url, isPoster }) {
  const fileType = DEFAULT_FILE_TYPES["image"].type;
  const imageType = isPoster ? "poster" : "image";
  const { stepID, attachmentID, fileName } = generateIDAndName(imageType);
  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  writeFileSync(filePath, base64Data, "base64", function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });

  const fileSize = statSync(filePath).size;
  const fileChecksum = createHash("md5")
    .update(base64Data, "utf8")
    .digest("hex");
  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName,
      filePath,
      fileSize,
      fileChecksum,
      fileType,
    },
  };
}

export function updateImage({ item, url }) {
  if (item.filePath && existsSync(item.filePath)) {
    unlinkSync(item.filePath);
  }
  const { fileName } = item.fileName
    ? { fileName: item.fileName }
    : generateIDAndName("image", item.attachmentID);

  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  writeFileSync(filePath, base64Data, "base64");

  const fileSize = statSync(filePath).size;
  const fileChecksum = createHash("md5")
    .update(base64Data, "utf8")
    .digest("hex");
  return {
    status: STATUSES.SUCCESS,
    item: {
      fileName,
      filePath,
      fileSize,
      fileChecksum,
    },
  };
}

export function createVideo({ buffer }) {
  const fileType = DEFAULT_FILE_TYPES["video"].type;
  const { stepID, attachmentID, fileName } = generateIDAndName("video");
  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );
  writeFileSync(filePath, Buffer.from(buffer), function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });

  const fileSize = statSync(filePath).size;
  const fileContents = readFileSync(filePath);
  const fileChecksum = createHash("md5")
    .update(fileContents, "utf8")
    .digest("hex");
  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName,
      filePath,
      fileSize,
      fileChecksum,
      fileType,
    },
  };
}

export function optimizeVideo({ filePath }) {
  const fileFormat = DEFAULT_FILE_TYPES["video"].suffix;
  const tempName =
    "temp-optimizing-video-" +
    dayjs().format("YYYY-MM-DD_HH-mm-ss-ms") +
    "." +
    fileFormat;
  const tempPath = join(
    configDir,
    "sessions",
    getSessionID(),
    tempName
  );

  return new Promise(function (resolve, reject) {
    ffmpeg(filePath)
      .videoCodec("libx264")
      .addOption("-preset", "veryfast")
      .audioCodec("aac")
      .format(fileFormat)
      .save(tempPath)
      .on("start", function (commandLine) {
        console.log("start : " + commandLine);
      })
      .on("progress", function (progress) {
        console.log(progress);
      })
      .on("end", function () {
        if (filePath && existsSync(filePath)) {
          unlinkSync(filePath);
        }
        rename(tempPath, filePath, function (err) {
          if (err) {
            console.log(err);
            return reject({ status: STATUSES.ERROR, message: err });
          }

          const fileSize = statSync(filePath).size;
          const fileContents = readFileSync(filePath);
          const fileChecksum = createHash("md5")
            .update(fileContents, "utf8")
            .digest("hex");
          return resolve({
            status: STATUSES.SUCCESS,
            fileSize,
            fileChecksum,
          });
        });
      })
      .on("error", function (err) {
        console.log(err);
        return reject({ status: STATUSES.ERROR, message: err });
      });
  });
}

export function updateVideo({ item, start, end, previousDuration }) {
  const fileFormat = "mp4";
  const tempName =
    "temp-optimizing-video-" +
    dayjs().format("YYYY-MM-DD_HH-mm-ss-ms") +
    "." +
    fileFormat;
  const tempPath = join(
    configDir,
    "sessions",
    getSessionID(),
    tempName
  );
  const duration = parseInt(end - start);

  return new Promise(function (resolve, reject) {
    if (previousDuration !== duration) {
      ffmpeg(item.filePath)
        .setStartTime(parseInt(start))
        .setDuration(duration)
        .save(tempPath)
        .on("start", function (commandLine) {
          console.log("start : " + commandLine);
        })
        .on("progress", function (progress) {
          console.log(progress);
        })
        .on("end", function () {
          if (item.filePath && existsSync(item.filePath)) {
            unlinkSync(item.filePath);
          }
          const { fileName } = item.fileName
            ? { fileName: item.fileName }
            : generateIDAndName("video", item.attachmentID);
          const filePath = join(
            configDir,
            "sessions",
            getSessionID(),
            fileName
          );
          rename(tempPath, filePath, function (err) {
            if (err) {
              console.log(err);
              return reject({ status: STATUSES.ERROR, message: err });
            }

            const fileSize = statSync(filePath).size;
            const fileContents = readFileSync(filePath);
            const fileChecksum = createHash("md5")
              .update(fileContents, "utf8")
              .digest("hex");
            return resolve({
              status: STATUSES.SUCCESS,
              item: {
                fileName,
                filePath,
                fileSize,
                fileChecksum,
              },
            });
          });
        })
        .on("error", function (err) {
          console.log(err);
          return reject({ status: STATUSES.ERROR, message: err });
        });
    } else {
      const { fileName } = item.fileName
        ? { fileName: item.fileName }
        : generateIDAndName("video", item.attachmentID);
      const filePath = join(
        configDir,
        "sessions",
        getSessionID(),
        fileName
      );
      if (item.filePath && item.filePath !== filePath) {
        renameSync(item.filePath, filePath);
      }

      const fileSize = statSync(filePath).size;
      const fileContents = readFileSync(filePath);
      const fileChecksum = createHash("md5")
        .update(fileContents, "utf8")
        .digest("hex");
      return resolve({
        status: STATUSES.SUCCESS,
        item: {
          fileName,
          filePath,
          fileSize,
          fileChecksum,
        },
      });
    }
  });
}

export function createAudio({ buffer }) {
  const fileType = DEFAULT_FILE_TYPES["audio"].type;
  const { stepID, attachmentID, fileName } = generateIDAndName("audio");
  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );
  writeFileSync(filePath, Buffer.from(buffer), function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });

  const fileSize = statSync(filePath).size;
  const fileChecksum = createHash("md5")
    .update(Buffer.from(buffer, "utf-8"))
    .digest("hex");
  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName,
      filePath,
      fileSize,
      fileChecksum,
      fileType,
    },
  };
}

export function updateAudio({ item }) {
  const { fileName } = item.fileName
    ? { fileName: item.fileName }
    : generateIDAndName("audio", item.attachmentID);
  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );

  if (item.filePath && item.filePath !== filePath) {
    renameSync(item.filePath, filePath);
  }

  const fileSize = statSync(filePath).size;
  const fileContents = readFileSync(filePath, "utf-8");
  const fileChecksum = createHash("md5")
    .update(fileContents)
    .digest("hex");
  return {
    status: STATUSES.SUCCESS,
    item: {
      fileName,
      filePath,
      fileSize,
      fileChecksum,
    },
  };
}

export function deleteFile({ filePath }) {
  if (filePath && existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export async function uploadEvidence() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
  });

  if (canceled) {
    return Promise.resolve({
      status: STATUSES.ERROR,
      message: "No file selected",
    });
  }

  // TODO - Handle multiple files uploaded
  const stepID = uuidv4();
  const attachmentID = uuidv4();
  const fileName = basename(filePaths[0]);
  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );

  copyFileSync(filePaths[0], filePath);

  // TODO - move promise building to shared block with dropUpload
  return new Promise(function (resolve) {
    fromFile(filePath, function (err, result) {
      if (err) {
        return resolve({
          status: STATUSES.ERROR,
          message: err,
        });
      }

      let fileType = result.mime;

      const fileSize = statSync(filePath).size;
      const fileContents = readFileSync(filePath, "utf8");
      const fileChecksum = createHash("md5")
        .update(fileContents)
        .digest("hex");
      return resolve({
        status: STATUSES.SUCCESS,
        item: {
          stepID,
          attachmentID,
          fileType,
          fileName,
          filePath,
          fileSize,
          fileChecksum,
        },
      });
    });
  });
}

export async function dropFile(data) {
  const stepID = uuidv4();
  const attachmentID = uuidv4();
  const fileName = data.name;
  const filePath = join(
    configDir,
    "sessions",
    getSessionID(),
    fileName
  );

  copyFileSync(data.path, filePath);

  return new Promise(function (resolve) {
    fromFile(filePath, function (err, result) {
      if (err) {
        return resolve({
          status: STATUSES.ERROR,
          message: err,
        });
      }

      let fileType = result.mime;

      const fileSize = statSync(filePath).size;
      const fileContents = readFileSync(filePath);
      const fileChecksum = createHash("md5")
        .update(fileContents, "utf8")
        .digest("hex");
      return resolve({
        status: STATUSES.SUCCESS,
        // TODO - Move item building to a util
        item: {
          stepID,
          attachmentID,
          fileType,
          fileName,
          filePath,
          fileSize,
          fileChecksum,
        },
      });
    });
  });
}

export function setAppearance(theme) {
  const browserWindow = getBrowserWindow();
  browserWindow.webContents.send("SET_THEME", theme);
}

const generateIDAndName = (type, uid = undefined) => {
  const stepID = uuidv4();
  let attachmentID, idStr, fileName;
  let success = false;
  let suffix;

  if (type === "poster") {
    type = "image";
  }
  if (DEFAULT_FILE_TYPES[type]) {
    suffix = DEFAULT_FILE_TYPES[type].suffix;
  } else {
    suffix = "file";
  }

  while (!success) {
    attachmentID = uuidv4();
    idStr = attachmentID.replaceAll("-", "");
    for (let i = 0; i < idStr.length - 5; i++) {
      fileName = `${type}-${idStr.substring(i, 5)}.${suffix}`;
      if (
        !existsSync(
          join(
            configDir,
            "sessions",
            getSessionID(),
            fileName
          )
        )
      ) {
        success = true;
        break;
      }
    }
  }
  if (uid) {
    attachmentID = uid;
  }
  return { stepID, attachmentID, fileName };
};
