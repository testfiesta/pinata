const JSONdb = require("simple-json-db");
const { app, remote } = require("electron");
const { join, resolve } = require("path");
const { existsSync, readdirSync, mkdirSync } = require("fs");

let defaultMeta, defaultConfig, recursivelyMerge;

try {
  const sharedUtils = require("./shared-utils.js");
  defaultMeta = sharedUtils.defaultMeta;
  defaultConfig = sharedUtils.defaultConfig;
  recursivelyMerge = sharedUtils.recursivelyMerge;
} catch (error) {
  const sharedUtils = require("../modules/shared-utils.js");
  defaultMeta = sharedUtils.defaultMeta;
  defaultConfig = sharedUtils.defaultConfig;
  recursivelyMerge = sharedUtils.recursivelyMerge;
}

let configDir, currentVersion;

try {
  configDir = (app || remote.app).getPath("userData");
  currentVersion = app.getVersion();
} catch (error) {
  const os = require('os');
  const path = require('path');
  configDir = path.join(os.homedir(), '.pinata');
  currentVersion = "1.0.0"; // Default version
}

const jsonDbConfig = {
  jsonSpaces: 2,
};

let metaDb, configDb, credentialDb, dataDb;

const migrateKeys = async (migrations, data) => {
  for (const [key, value] of Object.entries(migrations)) {
    if (value.constructor === String) {
      if (data[key]) {
        if (value === "..") {
          for (const [subKey, subValue] of Object.entries(data[key])) {
            data[subKey] = subValue;
          }
        } else if (value.length > 1 && value.split(".") > 1) {
          if (/^[A-za-z0-9.-_]+$/.test(value)) {
            eval(`data.${value} = data[key];`);
          } else {
            console.log(`Invalid migration value [${value}] skipping...`);
          }
        } else if (value !== "") {
          data[value] = data[key];
        }
        delete data[key];
      }
    } else if (value.constructor === Function) {
      if (data[key]) {
        data[key] = await value(data[key]);
      }
    }
  }
  return data;
};

const applyMigrations = async (type, newVersion, data) => {
  let oldVersion = data.version || "0.0.0";
  let migratedData = Object.assign(data, {});

  if (newVersion !== oldVersion) {
    let splitNewVersion = newVersion.substring(1).split(".");
    splitNewVersion = splitNewVersion.map((num) => parseInt(num));
    let splitDataVersion = oldVersion.split(".");
    splitDataVersion = splitDataVersion.map((num) => parseInt(num));
    let direction = "up";
    for (let i = 0; i < splitNewVersion.length; i++) {
      if (splitNewVersion[i] < splitDataVersion[i]) {
        direction = "down";
        break;
      }
    }

    const isDevelopment = process.env.NODE_ENV !== "production";
    let migrationFilesPath = isDevelopment
      ? resolve(__dirname, "../src/modules/migrations/")
      : resolve(process.resourcesPath, "./migrations/");

    let migrationFiles = readdirSync(migrationFilesPath);
    let migrationVersions = migrationFiles.map((fileName) => {
      let temp = fileName.substring(1, fileName.length - 3).split(".");
      return temp.map((num) => parseInt(num));
    });

    if (direction === "down") {
      migrationFiles.reverse();
      migrationVersions.reverse();
    }

    let nextMigrationIndex;
    for (let i = 0; i < migrationVersions.length; i++) {
      if (direction === "up") {
        if (migrationVersions[i][0] < splitDataVersion[0]) {
          continue;
        }
        if (migrationVersions[i][0] === splitDataVersion[0]) {
          if (migrationVersions[i][1] < splitDataVersion[1]) {
            continue;
          }

          if (migrationVersions[i][1] > splitDataVersion[1]) {
            nextMigrationIndex = i;
            break;
          }

          if (migrationVersions[i][1] === splitDataVersion[1]) {
            if (migrationVersions[i][2] <= splitDataVersion[2]) {
              continue;
            } else {
              nextMigrationIndex = i;
              break;
            }
          }
        }
        if (migrationVersions[i][0] > splitDataVersion[0]) {
          nextMigrationIndex = i;
          break;
        }
      } else {
        if (migrationVersions[i][0] > splitDataVersion[0]) {
          continue;
        }
        if (migrationVersions[i][0] === splitDataVersion[0]) {
          if (migrationVersions[i][1] > splitDataVersion[1]) {
            continue;
          }

          if (migrationVersions[i][1] < splitDataVersion[1]) {
            nextMigrationIndex = i;
            break;
          }

          if (migrationVersions[i][1] === splitDataVersion[1]) {
            if (migrationVersions[i][2] >= splitDataVersion[2]) {
              continue;
            } else {
              nextMigrationIndex = i;
              break;
            }
          }
        }
        if (migrationVersions[i][0] < splitDataVersion[0]) {
          nextMigrationIndex = i;
          break;
        }
      }
    }

    for (const migration of migrationFiles.slice(
      nextMigrationIndex,
      migrationFiles.length
    )) {
      const migrationPath = resolve(migrationFilesPath, migration);

      const { migrationStruct } = require(migrationPath);
      if (!migrationStruct[direction][type]) continue;

      let moveUpMigrations = {};
      let moveLateralMigrations = {};
      let otherMigrations = {};
      for (const [key, value] of Object.entries(
        migrationStruct[direction][type]
      )) {
        if (
          value === ".." ||
          (value.length > 1 && value.split(".").length > 1)
        ) {
          moveUpMigrations[key] = value;
        } else if (value.constructor === String) {
          moveLateralMigrations[key] = value;
        } else {
          otherMigrations[key] = value;
        }
      }

      migratedData = await migrateKeys(moveUpMigrations, migratedData);
      migratedData = await migrateKeys(moveLateralMigrations, migratedData);
      migratedData = await migrateKeys(otherMigrations, migratedData);
    }
  }

  let updatedData = migratedData;
  switch (type) {
    case "meta":
      updatedData = recursivelyMerge(migratedData, defaultMeta);
      break;
    case "config":
      updatedData = recursivelyMerge(migratedData, defaultConfig);
      break;
  }
  updatedData.version = newVersion;

  return updatedData;
};

async function runMigrations() {
  console.log("Running migrations...");
  
  try {
    // Create config directory if it doesn't exist
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    // Initialize databases
    metaDb = new JSONdb(join(configDir, "meta.json"), jsonDbConfig);
    let metadata = {
      version: currentVersion,
    };
    
    if (metaDb) {
      metadata = metaDb.JSON();
    }

    metadata = await applyMigrations("meta", currentVersion, metadata);

    if (!metadata.configPath) {
      metadata.configPath = defaultMeta.configPath;
    }
    configDb = new JSONdb(metadata.configPath, jsonDbConfig);
    const configData = await applyMigrations("config", currentVersion, configDb.JSON());

    if (!metadata.credentialsPath) {
      metadata.credentialsPath = defaultMeta.credentialsPath;
    }
    credentialDb = new JSONdb(metadata.credentialsPath, jsonDbConfig);
    const credentialData = await applyMigrations(
      "credentials",
      currentVersion,
      credentialDb.JSON()
    );

    let sessionData;
    if (metadata.sessionDataPath) {
      if (existsSync(metadata.sessionDataPath)) {
        dataDb = new JSONdb(metadata.sessionDataPath, jsonDbConfig);
        sessionData = await applyMigrations("data", currentVersion, dataDb.JSON());
      } else {
        metaDb.set("sessionDataPath", "");
      }
    }

    // Save migrated data
    metaDb.JSON(metadata);
    metaDb.sync();

    configDb.JSON(configData);
    configDb.sync();

    credentialDb.JSON(credentialData);
    credentialDb.sync();

    if (sessionData) {
      dataDb.JSON(sessionData);
      dataDb.sync();
    }

    console.log("Migrations completed successfully");
    return { metaDb, configDb, credentialDb, dataDb };
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}

// Export the databases so they can be imported in PersistenceUtility
module.exports = { 
  runMigrations,
  getMetaDb: () => metaDb,
  getConfigDb: () => configDb,
  getCredentialDb: () => credentialDb,
  getDataDb: () => dataDb
};
