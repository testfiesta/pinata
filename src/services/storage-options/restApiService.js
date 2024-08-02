import axios from "axios";
import dayjs from "dayjs";
import StorageInterface from "../storageInterface";
import store from "@/store";

import * as Y from "yjs";
import YattIntegrationHelpers from "@/integrations/YattIntegrationHelpers";
import YjsIntegrationHelpers from "@/integrations/YjsIntegrationHelpers";
import TestfiestaIntegrationHelpers from "@/integrations/TestfiestaIntegrationHelpers";

export default class RestApiService extends StorageInterface {
  async getState(executionId) {
    const credential = store.state.auth.credentials?.testfiesta[0];
    const headers = await TestfiestaIntegrationHelpers.getHeaders(credential);
    const { data } = await axios.get(
      `http://localhost:5000/v1/pinata/executions/${executionId}`,
      headers
    );
    return data;
  }

  async updateState(state) {

    const data = {};
    let credentials = state.auth.credentials?.yatt;
    let credential;
    if (credentials && credentials.length > 0) credential = credentials[0];

//    const data = {
//      case: state.case,
//      session: state.session,
//    };
//    const credential = state.auth.credentials?.testfiesta[0];


    let returnResponse = {
      link: "",
    };

//    let doc = YjsIntegrationHelpers.updateState(state);
//    // eslint-disable-next-line
//    doc.on("update", (update, origin) => {
//      data.yjs = update;
//    });
//    data.yjs = Y.encodeStateAsUpdate(doc);

//    if (credential) {
//      const headers = await YattIntegrationHelpers.getHeaders(credential);
//      await axios
//        .patch(`http://localhost:5000/v1/pinata/executions`, data, headers)
//        .then((postedSession) => {
//          returnResponse = postedSession.data;
//        })
//        .catch((error) => {
//          returnResponse.error = error.response.data.errors;
//        });

//      if (returnResponse?.steps) {
//        returnResponse.steps.map(async (step) => {
//          if (step.uploadURL) {
//            const match = state.session.items.find(
//              (item) => item.stepID === step.external_id
//            );
//            if (match?.filePath) {
//              const fetchResponse = await fetch(match.filePath);
//              const fileBlob = await fetchResponse.blob();
//              const file = new File([fileBlob], step?.uid, {
//                type: match.fileType,

    const headers = await TestfiestaIntegrationHelpers.getHeaders(credential);
    await axios
      .patch(`http://localhost:5000/v1/pinata/executions`, data, headers)
      .then((postedSession) => {
        returnResponse = postedSession.data;
      })
      .catch((error) => {
        returnResponse.error = error.response.data.errors;
      });

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
    }
    if (returnResponse?.data) {
      store.commit("setSessionIDFromBackend", returnResponse.data.sessionID);
      store.commit("setCaseIDFromBackend", returnResponse.data.caseID);
    }
  }

  async getConfig() {
    const response = await axios.get(
      `http://localhost:5000/v1/app/org/f352ae63-11fc-4dbe-bab1-72561aa25fca/config/5e0f71ff-987d-4240-85eb-df6adf568c31`
    );
    return response.data.config;
  }

  async getAttachment(attachmentId) {
    const credential = store.state.auth.credentials?.testfiesta[0];
    const headers = await TestfiestaIntegrationHelpers.getHeaders(credential);
    const response = await axios.get(
      `http://localhost:5000/v1/attachments/${attachmentId}/object`,
      headers
    );
    return response.data;
  }

  async updateConfig(config) {
    const credential = store.state.auth.credentials?.testfiesta[0];
    const headers = await TestfiestaIntegrationHelpers.getHeaders(credential);
    const response = await axios.put(
      `http://localhost:5000/v1/app/org/f352ae63-11fc-4dbe-bab1-72561aa25fca/config/5e0f71ff-987d-4240-85eb-df6adf568c31`,
      config,
      headers
    );
    return response.data.config;
  }

  async getCredentials() {
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

//    data = { ...data, ...store.state.auth.credentials?.yatt };
//    if (data.length > 0) data = data[0];

    data = store.state.auth.credentials?.testfiesta[0];
    if (accessToken) {
      data.type = "cookie";
    } else {
      const response = await axios.get(
        "http://localhost:5000/v1/app/profile/token"
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
