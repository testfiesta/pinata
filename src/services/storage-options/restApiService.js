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
  async apiCall(credential, method, url, data = null) {
    try {
      const headers = await TestfiestaIntegrationHelpers.getHeaders(credential);
      const config = {
        method,
        url,
        data,
        headers,
      };
      return await axios(config);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Session expired.");
      }
      throw error;
    }
  }
  async getState(executionId) {
    const handle = store.state.auth.handle; // TODO: Ensure this is set in Vuex
    const key = store.state.auth.key; // TODO: Ensure this is set in Vuex
    const { data } = await this.apiCall(
      "get",
      `${this.baseUrl}/${handle}/projects/${key}/executions/${executionId}`
    );
    return data;
  }

  async updateState(state) {
    const handle = store.state.auth.handle; // TODO: Ensure this is set in Vuex
    const key = store.state.auth.key; // TODO: Ensure this is set in Vuex
    const data = {
      case: state.case,
      session: state.session,
    };

    let returnResponse = {
      link: "",
    };

    try {
      const response = await this.apiCall(
        "patch",
        `${this.baseUrl}/${handle}/projects/${key}/executions`,
        data
      );
      returnResponse = response.data;

      if (returnResponse?.steps) {
        returnResponse.steps.map(async (step) => {
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
              await axios
                .put(step.uploadURL, file, {
                  headers: {
                    "Content-Type": match.fileType,
                    "X-Upload-Content-Length": match.fileSize,
                  },
                })
                .then(async (resp) => {
                  console.log("File upload response");
                  console.log(resp);
                  const attachmentResp = await this.getAttachment(
                    step.custom_fields.attachmentID
                  );
                  console.log({ attachmentResp });
                  store.commit("replaceAttachmentUrl", {
                    attachmentID: attachmentResp.external_id,
                    url: attachmentResp.url,
                  });
                })
                .catch((error) => {
                  returnResponse.error.push(...error.response.data.errors);
                });
            }
          }
        });
      }
      if (returnResponse?.data) {
        store.commit("setSessionIDFromBackend", returnResponse.data.sessionID);
        store.commit("setCaseIDFromBackend", returnResponse.data.caseID);
      }
    } catch (error) {
      console.error("Error updating state:", error.response?.data?.errors);
      returnResponse.error = error.response?.data?.errors;
    }
    return returnResponse;
  }
  async getConfig(configUid = null) {
    const handle = store.state.auth.handle; // TODO: Ensure this is set in Vuex
    if (!handle) {
      throw new Error(
        "Organization handle is not defined. Ensure the user is logged in."
      );
    }

    const endpoint = configUid
      ? `${this.baseUrl}/${handle}/configs/${configUid}` // Fetch a specific config
      : `${this.baseUrl}/${handle}/configs`; // Fetch all configs for the organization

    const { data } = await this.apiCall("get", endpoint);
    return data;
  }
  async getAttachment(type, attachmentId) {
    const handle = store.state.auth.handle; // TODO: Ensure this is set in Vuex

    const { data } = await this.apiCall(
      "get",
      `${this.baseUrl}/${handle}/${type}/attachments/${attachmentId}/object`
    );
    return data;
  }

  // TODO: implement backend for pinata config
  async updateConfig(config) {
    const { data } = await this.apiCall(
      "put",
      `${this.baseUrl}/app/org/f352ae63-11fc-4dbe-bab1-72561aa25fca/config/5e0f71ff-987d-4240-85eb-df6adf568c31`,
      config
    );
    return data.config;
  }

  async getCredentials() {
    let data = { user: {} };

    const handle = store.state.auth.handle; // TODO: Ensure this is set in Vuex
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
    data = store.state.auth.credentials?.testfiesta[0];
    if (accessToken) {
      data.type = "cookie";
    } else {
      const response = await axios.apiCall(
        "get",
        `${this.baseUrl}/${handle}/accessTokens`
      );
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
            id: data.user.uid,
            email: data.user.email,
            name: data.user.first_name + " " + data.user.last_name,
            avatar: data.user.avatar_url,
            locale: data.user.preferences?.locale,
            verified: data.user.preferences?.verified,
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
