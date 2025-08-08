export const migrationStruct = {
  up: {
    meta: {
      meta: "..",
      dataPath: "sessionDataPath",
    },
  },
  down: {
    meta: {
      configPath: "meta.configPath",
      credentialsPath: "meta.credentialsPath",
      sessionDataPath: "meta.dataPath",
      version: "meta.version",
    },
  },
};
