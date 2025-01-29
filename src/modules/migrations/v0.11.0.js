const uuidv4 = require("uuid");
const { DEFAULT_FILE_TYPES } = require("../constants");

export const migrationStruct = {
  up: {
    config: {
      config: "..",
      useLocal: "localOnly",
      apperance: "theme",
      showIssue: "",
      appLabel: "",
      summary: "summaryRequired",
      templates: (templates) => {
        if (typeof templates !== "object") {
          console.error("Invalid templates data:", templates);
          return [];
        }
        return Object.entries(templates).map(([type, content]) => {
          let oldType;
          switch (type) {
            case "image":
              oldType = "Screenshot";
              break;
            case "video":
              oldType = "Video";
              break;
            case "audio":
              oldType = "Audio";
              break;
            case "text":
              oldType = "Note";
              break;
            case "mindmap":
              oldType = "Mindmap";
              break;
            default:
              oldType = "File";
          }
          return { oldType, precondition: content, issue: "", isBug: false };
        });
      },
    },
    data: {
      items: (items) => {
        return items.map((item) => {
          item.sessionID = item.id;
          item.caseID = uuidv4();

          delete item.id;
          delete item.sessionType;
          return item;
        });
      },
    },
    credentials: {
      credentials: "..",
    },
  },
  down: {
    config: {
      localOnly: "config.useLocal",
      theme: "config.apperance",
      defaultColor: "config.defaultColor",
      commentType: "config.commentType",
      audioCapture: "config.audioCapture",
      videoQuality: "config.videoQuality",
      debugMode: "config.debugMode",
      summaryRequired: "config.summary",
      ai: "config.ai",
      templates: "config.templates",
      checklist: "config.checklist",
      hotkeys: "config.hotkeys",
      version: "config.version",
      // eslint-disable-next-line no-dupe-keys
      templates: (templates) => {
        let newTemplates = [];
        for (const [type, content] of Object.entries(templates)) {
          let oldType;
          switch (type) {
            case "image":
              oldType = "Screenshot";
              break;
            case "video":
              oldType = "Video";
              break;
            case "audio":
              oldType = "Audio";
              break;
            case "text":
              oldType = "Note";
              break;
            case "mindmap":
              oldType = "Mindmap";
              break;
            default:
              oldType = "File";
          }
          newTemplates.push({
            oldType,
            precondition: content,
            issue: "",
            isBug: false,
          });
        }
        return newTemplates;
      },
    },
    data: {
      items: (items) => {
        return items.map((item) => {
          item.fileType = DEFAULT_FILE_TYPES[item.fileType].type;
          delete item.type;
          return item;
        });
      },
    },
    credentials: {
      testfiesta: "credentials.testfiesta",
      jira: "credentials.jira",
      testrail: "credentials.testrail",
      version: "",
    },
  },
};
