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
    const handle = "idonn01";
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
      steps: state.session.items.map((item) => ({
        stepID: item.stepID,
        attachmentID: item.attachmentID,
        fileName: item.fileName,
        fileType: item.fileType,
        timer_mark: item.timer_mark,
        comment: item.comment,
        tags: item.tags || [],
        followUp: item.followUp || false,
        createdAt: item.createdAt,
        filePath: item.filePath,
        fileSize: item.fileSize,
      })),
      templateFields: {
        charter: state.case.charter?.content || "",
        preconditions: state.case.preconditions?.content || "",
        mindmap: {
          nodes: state.case.mindmap?.nodes || [],
          connections: state.case.mindmap?.connections || [],
        },
        notes: state.session.notes?.content || "",
      },
      customFields: {
        timer: state.session.timer,
        started: state.session.started,
        ended: state.session.ended,
        savedTimer: state.savedTimer,
        isTargetForAll: state.session.isTargetForAll,
        remote: state.session.remote,
      },
    };

    let returnResponse = { link: "" };

    try {
      let response;

      // Update an existing execution
      const url = `${baseUrl}/${executionId}`;
      response = await axios.patch(url, data, { withCredentials: true });
      returnResponse = response.data;
    } catch (error) {
      console.error("Error updating state:", error.response?.data?.errors);
      returnResponse.error = error.response?.data?.errors;
    }

    return returnResponse;
  }

  async createTestCase(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const url = `${this.baseURL}/${handle}/projects/${projectKey}/cases`;

    const testCasePayload = {
      name: state.case.title,
      source: "pinata",
      projectKey: state.case.key || null,
      parentId: state.case.parentId || 0,
      templateId: state.case.templateId || null,
      priority: state.case.priority,
      steps: [],
      customFields: {
        templateFields: {
          charter: state.case.charter?.content || "",
          preconditions: state.case.preconditions?.content || "",
          mindmap: {
            nodes: state.case.mindmap?.nodes || [],
            connections: state.case.mindmap?.connections || [],
          },
          notes: state.session.notes?.content || "",
        },
      },
      tags: state.case.tags || [],
    };

    try {
      const testCaseResponse = await axios.post(url, testCasePayload, {
        withCredentials: true,
      });

      if (testCaseResponse.status !== 200) {
        console.error("Failed to create test case:", testCaseResponse.data);
        return null;
      }

      console.log("Test case created successfully:", testCaseResponse.data);
      store.commit("setCaseIDFromBackend", testCaseResponse.data.uid);

      return testCaseResponse.data;
    } catch (error) {
      console.error(
        "Error creating test case:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createExecutionWithCase(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const baseUrl = `${this.baseURL}/${handle}/projects/${projectKey}/executions`;

    const executionPayload = {
      name: state.case.title, // Required
      version: 1, // Example value, should be dynamically set
      testCaseRef: state.case.caseID, // Required
      projectUid: state.project?.uid,
      steps: [],
      templateFields: {
        charter: state.case.charter?.content || "",
        preconditions: state.case.preconditions?.content || "",
        mindmap: {
          nodes: state.case.mindmap?.nodes || [],
          connections: state.case.mindmap?.connections || [],
        },
        notes: state.session.notes?.content || "",
      },
      customFields: {
        timer: state.session.timer,
        started: state.session.started,
        ended: state.session.ended,
        savedTimer: state.savedTimer,
        isTargetForAll: state.session.isTargetForAll,
        remote: state.session.remote,
      },
    };

    let returnResponse = { link: "" };

    try {
      const response = await axios.post(baseUrl, executionPayload, {
        withCredentials: true,
      });
      returnResponse = response.data;

      // Set sessionID from backend response if provided
      if (returnResponse?.uid) {
        store.commit("setSessionIDFromBackend", returnResponse.uid);
      } else {
        console.warn("No uid returned from backend for new session");
      }

      // Handle steps with upload URLs
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
                  withCredentials: true,
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
      console.error("Error creating execution:", error.response?.data?.errors);
      returnResponse.error = error.response?.data?.errors;
    }

    return returnResponse;
  }

  async createNewSession(state) {
    try {
      // Step 1: Create the test case
      const testCaseResponse = await this.createTestCase(state);
      if (!testCaseResponse?.uid) {
        throw new Error("Failed to get test case UID");
      }

      // Step 2: Create the execution linked to the test case
      const executionResponse = await this.createExecutionWithCase(state);

      return executionResponse;
    } catch (error) {
      console.error("Error in createNewSession:", error);
      return {
        link: "",
        error: error.response?.data?.errors || error.message,
      };
    }
  }

  async saveSession(data) {
    console.log(data);
  }
  async resetData(state) {
    const handle = "idonn01";
    const projectKey = "PROJECTKEY";
    const executionId = state.session.sessionID;
    const caseId = state.case.caseID;

    const url = `${this.baseURL}/${handle}/projects/${projectKey}/executions/${executionId}`;
    const caseUrl = `${this.baseURL}/${handle}/projects/${projectKey}/cases/${caseId}`;

    if (executionId && caseId) {
      try {
        await axios.delete(url, { withCredentials: true });
        await axios.delete(caseUrl, {
          withCredentials: true,
        });
      } catch (error) {
        console.error(
          "Error deleting execution:",
          error.response?.data?.errors || error.message
        );
        throw error;
      }
    }
  }
  // TODO: Implement this method to fetch metadata from the backend
  async getMetaData() {}

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

  // TODO create pinata config on the backend
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

  // TODO: Needed? Never called.
  async getAttachment(type, attachmentId) {
    const handle = "idonn01";
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

  // TODO: Implement this method to fetch credentials from the backend?
  async updateCredentials(credentials) {
    console.log(credentials);
    // saving credentials endpoint here
  }

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
}
