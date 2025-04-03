import axios from "axios";
import dayjs from "dayjs";
import StorageInterface from "../storageInterface";
import store from "@/store";
import TestfiestaIntegrationHelpers from "@/integrations/TestfiestaIntegrationHelpers";

export default class RestApiService extends StorageInterface {
  constructor() {
    super();
    this.baseURL =
      process.env.VUE_APP_TESTFIESTA_API_URL || "http://localhost:5050/core";
  }

  async getState(executionId) {
    const handle = "idonn01"; // TODO: Ensure this is set in Vuex
    // const key = store.state.auth.key; // TODO: Ensure this is set in Vuex
    // const credential = null;
    // const headers = credential
    //   ? await TestfiestaIntegrationHelpers.getHeaders(credential)
    //   : {};
    const url = `${this.baseURL}/${handle}/projects/project1/executions/${executionId}`;

    try {
      const { data } = await axios.get(url, { withCredentials: true });
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }
  async updateState(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const executionId = state.session.sessionID;
    const baseUrl = `${this.baseURL}/${handle}/projects/${projectKey}/executions`;

    const data = {
      name: state.case.title,
      steps: state.session.items,
      templateFields: {
        charter: state.case.charter,
        preconditions: state.case.preconditions,
        mindmap: state.case.mindmap,
        notes: state.session.notes,
      },
      // status: state.session.status,
      customFields: {
        timer: state.session.timer,
        started: state.session.started,
        ended: state.session.ended,
        savedTimer: state.savedTimer,
        isTargetForAll: state.session.isTargetForAll,
        remote: state.session.remote,
      },
      tagUids: state.case.tagUids,
      tagReplacements: state.case.tagReplacements,
    };

    let returnResponse = { link: "" };

    try {
      let response;

      if (executionId) {
        // Update an existing execution
        const url = `${baseUrl}/${executionId}`;
        response = await axios.patch(url, data, { withCredentials: true });
      } else {
        // Create a new execution
        response = await axios.post(baseUrl, data, { withCredentials: true });
      }

      returnResponse = response.data;

      // If a new execution was created, set the executionId in the state - is this needed?
      if (!executionId && returnResponse?.uid) {
        state.session.sessionID = returnResponse.uid; // Update the state with the new executionId
      }

      // Handle steps with upload URLs - verify if functioniong as expected
      if (returnResponse?.steps) {
        for (const step of returnResponse.steps) {
          if (step.uploadURL) {
            const match = state.session.items.find(
              (item) => item.stepID === step.external_id
            );
            if (match?.filePath) {
              const fetchResponse = await fetch(match.filePath);
              const fileBlob = await fetchResponse.blob();
              const file = new File([fileBlob], step?.uid, {
                type: match.fileType,
              });
              try {
                await axios.put(step.uploadURL, file, {
                  headers: {
                    "Content-Type": match.fileType,
                    "X-Upload-Content-Length": match.fileSize,
                  },
                });
              } catch (uploadError) {
                console.error("File upload error:", uploadError);
                returnResponse.error = returnResponse.error || [];
                returnResponse.error.push(uploadError.response?.data?.errors);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating state:", error.response?.data?.errors);
      returnResponse.error = error.response?.data?.errors;
    }

    return returnResponse;
  }
  async getConfig(configUid = null) {
    const handle = "idonn01"; // TODO: Ensure this is set in Vuex
    if (!handle) {
      throw new Error(
        "Organization handle is not defined. Ensure the user is logged in."
      );
    }

    const endpoint = configUid
      ? `${this.baseURL}/${handle}/configs/${configUid}`
      : `${this.baseURL}/${handle}/configs`;

    try {
      const { data } = await axios.get(endpoint, { withCredentials: true });
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }
  async getAttachment(type, attachmentId) {
    const handle = "idonn01"; // TODO: Ensure this is set in Vuex
    // const credential = null; // Or fetch from store.state.auth.credentials
    // const headers = credential
    //   ? await TestfiestaIntegrationHelpers.getHeaders(credential)
    //   : {};
    const url = `${this.baseURL}/${handle}/${type}/attachments/${attachmentId}/object`;

    try {
      const { data } = await axios.get(url, { withCredentials: true });
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }

  async updateConfig(config) {
    const credential = null; // Or fetch from store.state.auth.credentials
    const headers = credential
      ? await TestfiestaIntegrationHelpers.getHeaders(credential)
      : {};
    const url = `${this.baseURL}/app/org/f352ae63-11fc-4dbe-bab1-72561aa25fca/config/5e0f71ff-987d-4240-85eb-df6adf568c31`;

    try {
      const { data } = await axios.put(url, config, { headers });
      return data.config;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }

  // Example for getCredentials (partial implementation)
  async getCredentials() {
    const handle = "idonn01"; // TODO: Ensure this is set in Vuex
    // const credential = null; // Or fetch from store.state.auth.credentials
    // const headers = credential
    //   ? await TestfiestaIntegrationHelpers.getHeaders(credential)
    //   : {};
    let data = { user: {} };

    const allCookies = document.cookie;
    const cookieArray = allCookies.split("; ");
    let accessToken = null;
    for (const cookie of cookieArray) {
      const [name, value] = cookie.split("=");
      if (name.trim() === "access_token") {
        accessToken = value;
        break;
      }
    }
    data = store.state.auth.credentials?.testfiesta[0] || {};
    if (accessToken) {
      data.type = "cookie";
    } else {
      const url = `${this.baseURL}/${handle}/accessTokens`;
      const response = await axios.get(url, { withCredentials: true });
      data = response.data;
      data.type = "bearer";
    }
    return {
      testfiesta: [
        {
          accessToken: data.accessToken,
          expiresAt: data.expiresAt,
          type: data.type || "bearer",
          loggedInAt: data.loggedInAt || dayjs().format("YYYY-MM-DD HH:mm:ss"),
          oauthTokenIds: data.oauthTokenIds,
          user: {
            id: data.user?.uid,
            email: data.user?.email,
            name: data.user?.first_name + " " + data.user?.last_name,
            avatar: data.user?.avatar_url,
            locale: data.user?.preferences?.locale,
            verified: data.user?.preferences?.verified,
          },
          orgs: data.orgs,
        },
      ],
    };
  }

  async getMetaData() {}

  async updateCredentials(credentials) {
    console.log(credentials);
    // saving credentials endpoint here
  }

  async getItems() {
    // const response = await axios.get(`http://localhost:8082/items`);
    // return response.data;
    return [];
  }

  async getItemById(id) {
    const itemInStore = store.state.session.items.find(
      (item) => item.stepID === id
    );
    return itemInStore;
  }

  async updateItems(items) {
    console.log(items);
    // saving state endpoint here
  }

  async deleteItems(items) {
    console.log(items);
  }

  async getNotes() {
    const response = await axios.get(`http://localhost:8082/notes`);
    return response.data;
  }

  async updateNotes(notes) {
    console.log(notes);
    // saving notes endpoint here
  }

  async getNodes() {
    const response = await axios.get(`http://localhost:8082/nodes`);
    return response.data;
  }

  async updateNodes(nodes) {
    console.log(nodes);
    // saving nodes endpoint here
  }

  async getConnections() {
    const response = await axios.get(`http://localhost:8082/connections`);
    return response.data;
  }

  async updateConnections(connections) {
    console.log(connections);
    // saving connections endpoint here
  }

  async createNewSession(data) {
    console.log(data);
  }

  async saveSession(data) {
    console.log(data);
  }

  async resetData() {
    console.log("Reset data request goes here");
  }

  async saveNote() {
    console.log("Save Note");
  }
}
