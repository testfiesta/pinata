const { app, remote, dialog, desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const detect = require("detect-file-type");
const uuidv4 = require("uuid");

const ffmpeg = require("fluent-ffmpeg");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

const browserUtility = require("./BrowserWindowUtility");
const persistenceUtility = require("./PersistenceUtility");

const { STATUSES } = require("./constants");

const configDir = (app || remote.app).getPath("userData");

module.exports.getMediaSource = async () => {
  const sources = await desktopCapturer.getSources({
    thumbnailSize: {
      width: 150,
      height: 100,
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
};

module.exports.createImage = ({ url, isPoster }) => {
  const imageType = isPoster ? "poster" : "image";
  const { stepID, attachmentID, fileName } = generateIDAndName(imageType);
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(filePath, base64Data, "base64", function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });

  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName,
      filePath,
    },
  };
};

module.exports.updateImage = ({ item, url }) => {
  if (item.filePath && fs.existsSync(item.filePath)) {
    fs.unlinkSync(item.filePath);
  }
  const { fileName } = item.fileName
    ? { fileName: item.fileName }
    : generateIDAndName("image", item.attachmentID);

  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(filePath, base64Data, "base64", function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });
  return {
    status: STATUSES.SUCCESS,
    item: {
      fileName,
      filePath,
    },
  };
};

module.exports.createVideo = ({ buffer }) => {
  const { stepID, attachmentID, fileName } = generateIDAndName("video");
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );
  fs.writeFileSync(filePath, Buffer.from(buffer), function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });
  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName,
      filePath,
    },
  };
};

module.exports.optimizeVideo = ({ filePath }) => {
  const tempName =
    "temp-optimizing-video-" +
    dayjs().format("YYYY-MM-DD_HH-mm-ss-ms") +
    ".mp4";
  const tempPath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    tempName
  );

  return new Promise(function (resolve, reject) {
    ffmpeg(filePath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .format("mp4")
      .save(tempPath)
      .on("start", function (commandLine) {
        console.log("start : " + commandLine);
      })
      .on("progress", function (progress) {
        console.log(progress);
      })
      .on("end", function () {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        fs.rename(tempPath, filePath, function (err) {
          if (err) {
            console.log(err);
            return reject({ status: STATUSES.ERROR, message: err });
          }
          return resolve({
            status: STATUSES.SUCCESS,
          });
        });
      })
      .on("error", function (err) {
        console.log(err);
        return reject({ status: STATUSES.ERROR, message: err });
      });
  });
};

module.exports.updateVideo = ({ item, start, end, previousDuration }) => {
  const tempName =
    "temp-optimizing-video-" +
    dayjs().format("YYYY-MM-DD_HH-mm-ss-ms") +
    ".mp4";
  const tempPath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
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
          if (item.filePath && fs.existsSync(item.filePath)) {
            fs.unlinkSync(item.filePath);
          }
          const { fileName } = item.fileName
            ? { fileName: item.fileName }
            : generateIDAndName("video", item.attachmentID);
          const filePath = path.join(
            configDir,
            "sessions",
            persistenceUtility.getSessionID(),
            fileName
          );
          fs.rename(tempPath, filePath, function (err) {
            if (err) {
              console.log(err);
              return reject({ status: STATUSES.ERROR, message: err });
            }
            return resolve({
              status: STATUSES.SUCCESS,
              item: {
                fileName,
                filePath,
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
      const filePath = path.join(
        configDir,
        "sessions",
        persistenceUtility.getSessionID(),
        fileName
      );
      if (item.filePath && item.filePath !== filePath) {
        fs.rename(item.filePath, filePath, function (err) {
          if (err) {
            console.log(err);
            return reject({ status: STATUSES.ERROR, message: err });
          }
        });
      }
      return resolve({
        status: STATUSES.SUCCESS,
        item: {
          fileName,
          filePath,
        },
      });
    }
  });
};

module.exports.createAudio = ({ buffer }) => {
  const { stepID, attachmentID, fileName } = generateIDAndName("audio");
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );
  fs.writeFileSync(filePath, Buffer.from(buffer), function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });
  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName,
      filePath,
    },
  };
};

module.exports.updateAudio = ({ item }) => {
  const { fileName } = item.fileName
    ? { fileName: item.fileName }
    : generateIDAndName("audio", item.attachmentID);
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );

  if (item.filePath && item.filePath !== filePath) {
    fs.rename(item.filePath, filePath, function (err) {
      if (err) {
        console.log(err);
        return {
          status: STATUSES.ERROR,
          message: err,
        };
      }
    });
  }
  return {
    status: STATUSES.SUCCESS,
    item: {
      fileName,
      filePath,
    },
  };
};

module.exports.deleteFile = ({ filePath }) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports.saveNote = (comment, fileNameToSave = "") => {
  const { stepID, attachmentID, fileName } = generateIDAndName("text");
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileNameToSave ? fileNameToSave : fileName
  );

  fs.writeFile(filePath, comment.text, function (err) {
    if (err) {
      console.log(err);
      return {
        status: STATUSES.ERROR,
        message: err,
      };
    }
  });
  return {
    status: STATUSES.SUCCESS,
    item: {
      stepID,
      attachmentID,
      fileName: fileNameToSave ? fileNameToSave : fileName,
      filePath,
    },
  };
};

module.exports.uploadEvidence = async () => {
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
  const fileName = path.basename(filePaths[0]);
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );

  fs.copyFileSync(filePaths[0], filePath);

  // TODO - move promise building to shared block with dropUpload
  return new Promise(function (resolve) {
    detect.fromFile(filePath, function (err, result) {
      if (err) {
        return resolve({
          status: STATUSES.ERROR,
          message: err,
        });
      }

      let fileType = "";
      if (result) {
        if (result.mime.substring(0, 6) === "image/") {
          fileType = "image";
        } else if (result.mime.substring(0, 6) === "video/") {
          fileType = "video";
        } else if (result.mime.substring(0, 6) === "audio/") {
          fileType = "audio";
        } else {
          fileType = "other";
        }
      } else {
        fileType = "other";
      }

      return resolve({
        status: STATUSES.SUCCESS,
        item: {
          stepID,
          attachmentID,
          fileType,
          fileName,
          filePath,
        },
      });
    });
  });
};

module.exports.dropFile = async (data) => {
  const stepID = uuidv4();
  const attachmentID = uuidv4();
  const fileName = data.name;
  const filePath = path.join(
    configDir,
    "sessions",
    persistenceUtility.getSessionID(),
    fileName
  );

  fs.copyFileSync(data.path, filePath);

  return new Promise(function (resolve) {
    detect.fromFile(filePath, function (err, result) {
      if (err) {
        return resolve({
          status: STATUSES.ERROR,
          message: err,
        });
      }

      let fileType = "";
      if (result) {
        if (result.mime.substring(0, 6) === "image/") {
          fileType = "image";
        } else if (result.mime.substring(0, 6) === "video/") {
          fileType = "video";
        } else if (result.mime.substring(0, 6) === "audio/") {
          fileType = "audio";
        } else {
          fileType = "other";
        }
      } else {
        fileType = "other";
      }

      return resolve({
        status: STATUSES.SUCCESS,
        item: {
          stepID,
          attachmentID,
          fileType,
          fileName,
          filePath,
        },
      });
    });
  });
};

module.exports.setAppearance = ({ theme }) => {
  const browserWindow = browserUtility.getBrowserWindow();
  browserWindow.webContents.send("SET_THEME", { theme });
};

const generateIDAndName = (type, uid = undefined) => {
  const stepID = uuidv4();
  let attachmentID, idStr, fileName;
  let success = false;
  let suffix;

  switch (type) {
    case "video":
      suffix = "mp4";
      break;
    case "audio":
      suffix = "mp3";
      break;
    case "image":
    case "poster":
      suffix = "png";
      break;
    case "text":
      suffix = "txt";
      break;
    default:
      suffix = "file";
  }

  while (!success) {
    attachmentID = uuidv4();
    idStr = attachmentID.replaceAll("-", "");
    for (let i = 0; i < idStr.length - 5; i++) {
      fileName = `${type}-${idStr.substring(i, 5)}.${suffix}`;
      if (
        !fs.existsSync(
          path.join(
            configDir,
            "sessions",
            persistenceUtility.getSessionID(),
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
