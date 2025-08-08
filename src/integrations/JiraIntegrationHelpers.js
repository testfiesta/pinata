import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";
import {
  doc,
  p,
  a,
  b,
  u,
  em,
  blockQuote,
  ul,
  ol,
  li,
  text,
  textColor,
  heading,
} from "@atlaskit/adf-utils/builders/";
import axios from "axios";
import dayjs from "dayjs";

const URLS = {
  projectIndex: {
    basic: "https://${URL}/rest/api/3/project",
    oauth: "https://api.atlassian.com/ex/jira/${ORG}/rest/api/3/project",
    server: "https://${URL}/rest/api/2/project",
  },
  issueSearch: {
    basic: "https://${URL}/rest/api/3/search",
    oauth: "https://api.atlassian.com/ex/jira/${ORG}/rest/api/3/search",
    server: "https://${URL}/rest/api/2/search",
  },
  projectGet: {
    basic: "https://${URL}/rest/api/3/project/${ID}",
    oauth: "https://api.atlassian.com/ex/jira/${ORG}/rest/api/3/project/${ID}",
    server: "https://${URL}/rest/api/2/project/${ID}",
  },
  issueTypeGet: {
    basic:
      "https://${URL}/rest/api/3/issue/createmeta?projectIds=${PROJ_ID}&issuetypeIds=${TYPE_ID}&expand=projects.issuetypes.fields",
    oauth:
      "https://api.atlassian.com/ex/jira/${ORG}/rest/api/3/issue/createmeta?projectIds=${PROJ_ID}&issuetypeIds=${TYPE_ID}&expand=projects.issuetypes.fields",
    server:
      "https://${URL}/rest/api/2/issue/createmeta?projectIds=${PROJ_ID}&issuetypeIds=${TYPE_ID}&expand=projects.issuetypes.fields",
  },
  attachmentCreate: {
    basic: "https://${URL}/rest/api/3/issue/${KEY}/attachments",
    oauth:
      "https://api.atlassian.com/ex/jira/${ORG}/rest/api/3/issue/${KEY}/attachments",
    server: "https://${URL}/rest/api/2/issue/${KEY}/attachments",
  },
  issueCreate: {
    basic: "https://${URL}/rest/api/3/issue",
    oauth: "https://api.atlassian.com/ex/jira/${ORG}/rest/api/3/issue",
    server: "https://${URL}/rest/api/2/issue",
  },
};

export default {
  replaceKeys(url, item) {
    // TODO - move to utility class
    let keys = [];
    let i = 0;
    while (i < url.length) {
      let searchURL = url.substring(i, url.length);
      let startMark = searchURL.indexOf("${");
      let keyLength = searchURL.substring(startMark, url.length).indexOf("}");
      let endMark = startMark + keyLength;
      if (startMark > -1 && endMark > -1) {
        keys.push(searchURL.substring(startMark + 2, endMark));
        i = i + endMark + 1;
      } else {
        i = url.length;
      }
    }
    for (const key of keys) {
      url = url.replace(
        `\${${key}}`,
        item[key.toLowerCase()] ? item[key.toLowerCase()] : `\${${key}}`
      );
    }
    return url;
  },
  getURL(credential, urlEndpoint, item = {}) {
    let url;
    if (credential.type === "basic") {
      url = URLS[urlEndpoint]["basic"].replace("${URL}", credential.url);
      url = this.replaceKeys(url, item);
    } else if (credential.type === "oauth") {
      if (!credential.url) {
        // TODO - Allow selecting of the org.
        url = URLS[urlEndpoint]["oauth"].replace(
          "${ORG}",
          credential.orgs[0].id
        );
        url = this.replaceKeys(url, item);
      } else {
        url = URLS[urlEndpoint]["server"].replace("${URL}", credential.url);
        url = this.replaceKeys(url, item);
      }
    }
    return url;
  },
  getHeaders(credential) {
    let authHeader;
    if (credential.type === "basic") {
      authHeader = `Basic ${credential.accessToken}`;
    } else if (credential.type === "oauth") {
      authHeader = `Bearer ${credential.accessToken}`;
    }
    return {
      Authorization: authHeader,
      Accept: "application/json",
      "X-Atlassian-Token": "no-check",
    };
  },
  async getProvidedURL(credential, url) {
    let returnResponse = {
      items: [],
    };
    const options = {
      headers: this.getHeaders(credential),
    };

    await axios
      .get(url, options)
      .then((response) => {
        if (response.status === 200) {
          returnResponse.items = response.data;
        }
      })
      .catch((error) => {
        returnResponse.error = {
          message: JSON.stringify(error.response.data.errors),
        };

        if (
          credential.type === "oauth" &&
          dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
          [401, 403].includes(error.response.status)
        ) {
          returnResponse.error.checkAuth = true;
        }
      });
    return returnResponse;
  },
  async getAllProjects(credentials) {
    const urlEndpoint = "projectIndex";
    let returnResponse = {
      projects: [],
    };

    for (const [i, credential] of Object.entries(credentials)) {
      const options = {
        headers: this.getHeaders(credential),
      };
      const url = this.getURL(credential, urlEndpoint);

      await axios
        .get(url, options)
        .then((response) => {
          if (response.status === 200) {
            returnResponse.projects.push(
              ...response.data.map((project) => ({
                ...project,
                credentialIndex: i,
              }))
            );
          }
        })
        .catch((error) => {
          returnResponse.error = {
            message: JSON.stringify(error.response.data.errors),
          };

          if (
            credential.type === "oauth" &&
            dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
            [401, 403].includes(error.response.status)
          ) {
            returnResponse.error.checkAuth = true;
          }
        });
    }
    return returnResponse;
  },
  async getAllIssues(credentials) {
    let returnResponse = {
      issues: [],
    };

    for (const [i, credential] of Object.entries(credentials)) {
      let currentResponse = await this.searchIssues(credential);
      returnResponse.issues.push(
        ...currentResponse.issues.map((issue) => ({
          ...issue,
          credentialIndex: i,
        }))
      );
      if (currentResponse.error) {
        returnResponse.error = currentResponse.error;
      }
    }
    return returnResponse;
  },
  async searchIssues(credential, filters = {}) {
    const urlEndpoint = "issueSearch";
    let returnResponse = {
      issues: [],
    };
    const options = {
      headers: this.getHeaders(credential),
    };
    let url = this.getURL(credential, urlEndpoint);
    if (Object.keys(filters)) {
      url += "?jql=";
      for (const [key, value] of Object.entries(filters)) {
        url += `${key}%20%3D%20${value}`;
      }
    }

    await axios
      .get(url, options)
      .then((response) => {
        if (response.status === 200) {
          returnResponse.issues = response.data.issues;
        }
      })
      .catch((error) => {
        returnResponse.error = {
          message: JSON.stringify(error.response.data.errors),
        };

        if (
          credential.type === "oauth" &&
          dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
          [401, 403].includes(error.response.status)
        ) {
          returnResponse.error.checkAuth = true;
        }
      });
    return returnResponse;
  },
  async getProject(credential, id) {
    const urlEndpoint = "projectGet";
    let returnResponse = {
      project: {},
    };
    const options = {
      headers: {
        ...this.getHeaders(credential),
        "Content-Type": "application/json",
      },
    };
    const url = this.getURL(credential, urlEndpoint, { id });

    await axios
      .get(url, options)
      .then((response) => {
        if (response.status === 200) {
          returnResponse.project = response.data;
        }
      })
      .catch((error) => {
        returnResponse.error = {
          message: JSON.stringify(error.response.data.errors),
        };

        if (
          credential.type === "oauth" &&
          dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
          [401, 403].includes(error.response.status)
        ) {
          returnResponse.error.checkAuth = true;
        }
      });
    return returnResponse;
  },
  async getIssueTypeData(credential, projID, typeID) {
    const urlEndpoint = "issueTypeGet";
    let returnResponse = {
      blankIssue: {
        fields: {},
      },
      fieldData: [],
    };
    const options = {
      headers: {
        ...this.getHeaders(credential),
        "Content-Type": "application/json",
      },
    };
    const url = this.getURL(credential, urlEndpoint, {
      proj_id: projID,
      type_id: typeID,
    });

    await axios
      .get(url, options)
      .then((response) => {
        if (response.status === 200) {
          const fields = response.data.projects[0].issuetypes[0].fields;
          for (const item of Object.values(fields)) {
            if (
              item &&
              item.key !== "issuetype" &&
              item.key !== "project" &&
              item.name !== "Sprint" &&
              item.schema.type !== "any" &&
              !["attachment", "issuelinks"].includes(item.schema.system)
            ) {
              // We exclude fields we will add back in later (projects) and
              // those that need to have options pulled from the API separately
              // (Sprints).  We may want to renable the latter at some point
              // and handle it in a generic way.
              returnResponse.fieldData.push(item);
              if (item.key === "reporter") {
                const reporter = {
                  id: credential.user.id,
                };
                returnResponse.blankIssue.fields[item.key] = reporter;
              } else if (item.key === "parent") {
                const parent = {
                  id: "",
                };
                returnResponse.blankIssue.fields[item.key] = parent;
              } else if (item.key === "priority") {
                const priority = {
                  id: item.defaultValue.id || "",
                };
                returnResponse.blankIssue.fields[item.key] = priority;
              } else if (item.schema.type === "array") {
                returnResponse.blankIssue.fields[item.key] = [];
              } else {
                returnResponse.blankIssue.fields[item.key] = "";
              }
            }
          }
        }
      })
      .catch((error) => {
        returnResponse.error = {
          message: JSON.stringify(error.response.data.errors),
        };

        if (
          credential.type === "oauth" &&
          dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
          [401, 403].includes(error.response.status)
        ) {
          returnResponse.error.checkAuth = true;
        }
      });
    return returnResponse;
  },
  async createAttachments(credential, attachToItem, selectedAttachments) {
    const urlEndpoint = "attachmentCreate";
    const formData = new FormData();
    const url = this.getURL(credential, urlEndpoint, attachToItem);
    const options = {
      headers: this.getHeaders(credential),
    };

    for (const attachment of Object.values(selectedAttachments)) {
      console.log(`${JSON.stringify(attachment)}`);
      const response = await fetch(`file:${attachment.filePath}`);
      const file = new File([await response.blob()], attachment.fileName);
      formData.append("file", file);
    }

    let returnResponse = {};
    await axios.post(url, formData, options).catch((error) => {
      returnResponse.error = {
        message: JSON.stringify(error.response.data.errors),
      };

      if (
        credential.type === "oauth" &&
        dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
        [401, 403].includes(error.response.status)
      ) {
        returnResponse.error.checkAuth = true;
      }
    });
    return returnResponse;
  },
  async createIssue(credential, issue, fieldMappings) {
    const urlEndpoint = "issueCreate";
    const url = this.getURL(credential, urlEndpoint);
    const options = {
      headers: {
        ...this.getHeaders(credential),
        "Content-Type": "application/json",
      },
    };

    let issueBody = { fields: {} };
    await Object.keys(issue.fields).forEach((k) => {
      if (issue.fields[k]?.id !== "") {
        issueBody.fields[k] = issue.fields[k];
      }
      if (fieldMappings?.[k]?.type === "text") {
        issueBody.fields[k] = this.htmlToADF(
          "doc",
          new DOMParser().parseFromString(issue.fields[k], "text/html").body
        );
      }
    });

    let returnResponse = {};
    await axios
      .post(url, issueBody, options)
      .then((response) => {
        returnResponse = response;
      })
      .catch((error) => {
        returnResponse.error = {
          message: JSON.stringify(error.response.data.errors),
        };

        if (
          credential.type === "oauth" &&
          dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
          [401, 403].includes(error.response.status)
        ) {
          returnResponse.error.checkAuth = true;
        }
      });
    return returnResponse;
  },
  saveCredentials(credentials, data) {
    // TODO - can this be generalized and the key passed?
    let formattedData = this.formatData(data);

    if (!credentials) {
      credentials = {};
    }

    if (credentials.jira && credentials.jira.length > 0) {
      let matched = false;
      for (const [jiraIndex, credential] of Object.entries(credentials.jira)) {
        if (credential.user.id === formattedData.user.id) {
          credentials.jira[jiraIndex] = formattedData;
          matched = true;
        }
      }
      if (!matched) {
        credentials.jira.push(formattedData);
      }
    } else {
      credentials.jira = [formattedData];
    }

    window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      func: IPC_FUNCTIONS.UPDATE_CREDENTIALS,
      data: credentials,
    });

    return credentials;
  },
  htmlToADF(type, node) {
    // TODO - finish unimplemented types and move to OSS package
    // https://developer.atlassian.com/cloud/jira/platform/apis/document/viewer
    let returnContent = [];
    let nodeList = node.childNodes;
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].nodeType === document.TEXT_NODE) {
        returnContent.push(text(nodeList[i].textContent));
      } else {
        returnContent.push(this.htmlToADF(nodeList[i].tagName, nodeList[i]));
      }
    }

    let allowedAttrs = [];
    let currentAttrs = {};
    switch (type) {
      case undefined:
        return text(...returnContent);
      case "SPAN":
        if (node.style.color) {
          return textColor({ color: this.rgbToHex(node.style.color) })(
            ...returnContent
          );
        } else {
          return text(...returnContent);
        }
      case "P":
        return p(...returnContent);
      case "H1":
        return heading({ level: 1 })(...returnContent);
      case "H2":
        return heading({ level: 2 })(...returnContent);
      case "H3":
        return heading({ level: 3 })(...returnContent);
      case "A":
        allowedAttrs = ["href", "title"];
        currentAttrs = Object.values(node.attributes).reduce((o, a) => {
          return allowedAttrs.includes(a.name)
            ? { ...o, [a.name]: a.value }
            : { ...o };
        }, {});
        return a(currentAttrs)(...returnContent);
      case "B":
        return b(...returnContent);
      case "STRONG":
        return b(...returnContent);
      case "U":
        return u(...returnContent);
      case "EM":
        return em(...returnContent);
      case "BLOCKQUOTE":
        return blockQuote(...returnContent);
      case "OL":
        return ol(...returnContent);
      case "UL":
        return ul(...returnContent);
      case "LI":
        return li(returnContent);
      default:
        return doc(...returnContent);
    }
  },
  rgbToHex(rgbString) {
    // TODO - move to util file
    rgbString = rgbString
      .replace("rgb(", "")
      .replace(")", "")
      .replace(" ", "")
      .split(",");
    let r = parseInt(rgbString[0], 10).toString(16);
    let g = parseInt(rgbString[1], 10).toString(16);
    let b = parseInt(rgbString[2], 10).toString(16);
    r = r.length == 1 ? "0" + r : r;
    g = g.length == 1 ? "0" + g : g;
    b = b.length == 1 ? "0" + b : b;
    return "#" + r + g + b;
  },
  formatData(data) {
    let orgs = [];
    if (Array.isArray(data.resource)) {
      for (const org of data.resource) {
        orgs.push({
          id: org.id,
          url: org.url,
          name: org.name,
          avatar: org.avatarUrl,
        });
      }
    } else {
      orgs = [
        {
          id: data.resource.id,
          url: data.resource.url,
          name: data.resource.name,
          avatar: data.resource.avatarUrl,
        },
      ];
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      testfiestaOauthTokenId: data.testfiestaOauthTokenId,
      expiresAt: data.expiresAt,
      type: data.type,
      loggedInAt: data.loggedInAt,
      lastRefreshed: data.lastRefreshed,
      user: {
        id: data.profile.account_id,
        email: data.profile.email,
        name: data.profile.name,
        avatar: data.profile.picture,
        locale: data.profile.locale,
        account_type: data.profile.account_type,
        verified: data.profile.email_verified,
      },
      orgs: orgs,
      url: data.url,
    };
  },
};
